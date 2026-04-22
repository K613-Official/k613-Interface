import {
  IncentiveDataHumanized,
  ReservesIncentiveDataHumanized,
  RewardInfoHumanized,
  UserIncentiveDataHumanized,
  UserReservesIncentivesDataHumanized,
  UserRewardInfoHumanized,
} from '@aave/contract-helpers';
import { Provider } from '@ethersproject/providers';
import { BigNumber, constants, Contract } from 'ethers';
import { MarketDataType } from 'src/ui-config/marketsConfig';
import invariant from 'tiny-invariant';

const POOL_ABI = [
  'function getReservesList() view returns (address[])',
  'function getReserveData(address asset) view returns (tuple(uint256 data) configuration, uint128 liquidityIndex, uint128 currentLiquidityRate, uint128 variableBorrowIndex, uint128 currentVariableBorrowRate, uint128 currentStableBorrowRate, uint40 lastUpdateTimestamp, uint16 id, address aTokenAddress, address stableDebtTokenAddress, address variableDebtTokenAddress, address interestRateStrategyAddress, uint128 accruedToTreasury, uint128 unbacked, uint128 isolationModeTotalDebt)',
];

const TOKEN_ABI = ['function getIncentivesController() view returns (address)'];

const RC_ABI = [
  'function getRewardsByAsset(address asset) view returns (address[])',
  'function getRewardsData(address asset, address reward) view returns (uint256 index, uint256 emissionPerSecond, uint256 lastUpdate, uint256 distributionEnd)',
  'function getAssetDecimals(address asset) view returns (uint8)',
  'function getRewardOracle(address reward) view returns (address)',
  'function getUserAssetIndex(address user, address asset, address reward) view returns (uint256)',
  'function getUserRewards(address[] assets, address user, address reward) view returns (uint256)',
  'function getAllUserRewards(address[] assets, address user) view returns (address[], uint256[])',
];

const ERC20_ABI = [
  'function symbol() view returns (string)',
  'function decimals() view returns (uint8)',
];

const ORACLE_ABI = [
  'function latestAnswer() view returns (int256)',
  'function decimals() view returns (uint8)',
];

const EMPTY_A_INC: IncentiveDataHumanized = {
  tokenAddress: constants.AddressZero,
  incentiveControllerAddress: constants.AddressZero,
  rewardsTokenInformation: [],
};
const EMPTY_U_INC: UserIncentiveDataHumanized = {
  tokenAddress: constants.AddressZero,
  incentiveControllerAddress: constants.AddressZero,
  userRewardsInformation: [],
};

type RewardMeta = {
  symbol: string;
  decimals: number;
  oracle: string;
  priceFeed: string;
  priceFeedDecimals: number;
};

export class UiIncentivesService {
  constructor(private readonly getProvider: (chainId: number) => Provider) {}

  async getReservesIncentivesDataHumanized(
    marketData: MarketDataType
  ): Promise<ReservesIncentiveDataHumanized[]> {
    if (!marketData.enabledFeatures?.incentives) return [];
    const provider = this.getProvider(marketData.chainId);
    invariant(marketData.addresses.LENDING_POOL, 'No Pool address for this market');

    try {
      const pool = new Contract(marketData.addresses.LENDING_POOL, POOL_ABI, provider);
      const reserves: string[] = await pool.getReservesList();
      const rewardMetaCache = new Map<string, Promise<RewardMeta>>();

      return await Promise.all(
        reserves.map(async (underlyingAsset) => {
          const rd = await pool.getReserveData(underlyingAsset);
          const aToken: string = rd.aTokenAddress;
          const vToken: string = rd.variableDebtTokenAddress;
          const [aIncentiveData, vIncentiveData] = await Promise.all([
            this.buildAssetIncentive(provider, aToken, rewardMetaCache),
            this.buildAssetIncentive(provider, vToken, rewardMetaCache),
          ]);
          return {
            id: `${marketData.chainId}-${underlyingAsset}-${marketData.addresses.LENDING_POOL_ADDRESS_PROVIDER}`.toLowerCase(),
            underlyingAsset: underlyingAsset.toLowerCase(),
            aIncentiveData,
            vIncentiveData,
          };
        })
      );
    } catch {
      return [];
    }
  }

  async getUserReservesIncentivesData(
    marketData: MarketDataType,
    user: string
  ): Promise<UserReservesIncentivesDataHumanized[]> {
    if (!marketData.enabledFeatures?.incentives) return [];
    if (!user) return [];
    const provider = this.getProvider(marketData.chainId);
    invariant(marketData.addresses.LENDING_POOL, 'No Pool address for this market');

    try {
      const pool = new Contract(marketData.addresses.LENDING_POOL, POOL_ABI, provider);
      const reserves: string[] = await pool.getReservesList();
      const rewardMetaCache = new Map<string, Promise<RewardMeta>>();

      return await Promise.all(
        reserves.map(async (underlyingAsset) => {
          const rd = await pool.getReserveData(underlyingAsset);
          const aToken: string = rd.aTokenAddress;
          const vToken: string = rd.variableDebtTokenAddress;
          const [aTokenIncentivesUserData, vTokenIncentivesUserData] = await Promise.all([
            this.buildUserAssetIncentive(provider, aToken, user, rewardMetaCache),
            this.buildUserAssetIncentive(provider, vToken, user, rewardMetaCache),
          ]);
          return {
            id: `${marketData.chainId}-${user}-${underlyingAsset}-${marketData.addresses.LENDING_POOL_ADDRESS_PROVIDER}`.toLowerCase(),
            underlyingAsset: underlyingAsset.toLowerCase(),
            aTokenIncentivesUserData,
            vTokenIncentivesUserData,
          };
        })
      );
    } catch {
      return [];
    }
  }

  async getOnChainClaimable(
    marketData: MarketDataType,
    user: string
  ): Promise<{ reward: string; symbol: string; decimals: number; amount: BigNumber }[]> {
    if (!user) return [];
    const provider = this.getProvider(marketData.chainId);
    invariant(marketData.addresses.LENDING_POOL, 'No Pool address for this market');
    const pool = new Contract(marketData.addresses.LENDING_POOL, POOL_ABI, provider);
    const reserves: string[] = await pool.getReservesList();

    const tokens: string[] = [];
    const rcByToken = new Map<string, string>();
    await Promise.all(
      reserves.map(async (underlying) => {
        const rd = await pool.getReserveData(underlying);
        for (const tok of [rd.aTokenAddress, rd.variableDebtTokenAddress]) {
          if (!tok || tok === constants.AddressZero) continue;
          const rcAddress = await new Contract(tok, TOKEN_ABI, provider)
            .getIncentivesController()
            .catch(() => constants.AddressZero);
          if (!rcAddress || rcAddress === constants.AddressZero) continue;
          tokens.push(tok);
          rcByToken.set(tok.toLowerCase(), rcAddress);
        }
      })
    );
    if (tokens.length === 0) return [];

    const rcAddress = rcByToken.get(tokens[0].toLowerCase())!;
    const rc = new Contract(rcAddress, RC_ABI, provider);
    const [rewardAddresses, amounts] = (await rc
      .getAllUserRewards(tokens, user)
      .catch(() => [[], []])) as [string[], BigNumber[]];

    const metaCache = new Map<string, Promise<RewardMeta>>();
    return Promise.all(
      rewardAddresses.map(async (reward, i) => {
        const meta = await this.loadRewardMeta(provider, rc, reward, metaCache);
        return {
          reward,
          symbol: meta.symbol,
          decimals: meta.decimals,
          amount: amounts[i],
        };
      })
    );
  }

  private async buildAssetIncentive(
    provider: Provider,
    tokenAddress: string,
    cache: Map<string, Promise<RewardMeta>>
  ): Promise<IncentiveDataHumanized> {
    if (!tokenAddress || tokenAddress === constants.AddressZero) return EMPTY_A_INC;
    const rcAddress = await new Contract(tokenAddress, TOKEN_ABI, provider)
      .getIncentivesController()
      .catch(() => constants.AddressZero);
    if (!rcAddress || rcAddress === constants.AddressZero) {
      return { tokenAddress, incentiveControllerAddress: constants.AddressZero, rewardsTokenInformation: [] };
    }
    const rc = new Contract(rcAddress, RC_ABI, provider);
    const rewards: string[] = await rc.getRewardsByAsset(tokenAddress).catch(() => []);
    if (rewards.length === 0) {
      return { tokenAddress, incentiveControllerAddress: rcAddress, rewardsTokenInformation: [] };
    }
    const precision = Number(await rc.getAssetDecimals(tokenAddress).catch(() => 0));
    const rewardsTokenInformation: RewardInfoHumanized[] = await Promise.all(
      rewards.map(async (reward) => {
        const [data, meta] = await Promise.all([
          rc.getRewardsData(tokenAddress, reward),
          this.loadRewardMeta(provider, rc, reward, cache),
        ]);
        return {
          rewardTokenAddress: reward,
          rewardTokenDecimals: meta.decimals,
          precision,
          emissionPerSecond: (data.emissionPerSecond as BigNumber).toString(),
          incentivesLastUpdateTimestamp: (data.lastUpdate as BigNumber).toNumber(),
          tokenIncentivesIndex: (data.index as BigNumber).toString(),
          emissionEndTimestamp: (data.distributionEnd as BigNumber).toNumber(),
          rewardTokenSymbol: meta.symbol,
          rewardOracleAddress: meta.oracle,
          rewardPriceFeed: meta.priceFeed,
          priceFeedDecimals: meta.priceFeedDecimals,
        };
      })
    );
    return { tokenAddress, incentiveControllerAddress: rcAddress, rewardsTokenInformation };
  }

  private async buildUserAssetIncentive(
    provider: Provider,
    tokenAddress: string,
    user: string,
    cache: Map<string, Promise<RewardMeta>>
  ): Promise<UserIncentiveDataHumanized> {
    if (!tokenAddress || tokenAddress === constants.AddressZero) return EMPTY_U_INC;
    const rcAddress = await new Contract(tokenAddress, TOKEN_ABI, provider)
      .getIncentivesController()
      .catch(() => constants.AddressZero);
    if (!rcAddress || rcAddress === constants.AddressZero) {
      return { tokenAddress, incentiveControllerAddress: constants.AddressZero, userRewardsInformation: [] };
    }
    const rc = new Contract(rcAddress, RC_ABI, provider);
    const rewards: string[] = await rc.getRewardsByAsset(tokenAddress).catch(() => []);
    if (rewards.length === 0) {
      return { tokenAddress, incentiveControllerAddress: rcAddress, userRewardsInformation: [] };
    }
    const userRewardsInformation: UserRewardInfoHumanized[] = await Promise.all(
      rewards.map(async (reward) => {
        const [userIndex, unclaimed, meta] = await Promise.all([
          rc.getUserAssetIndex(user, tokenAddress, reward).catch(() => BigNumber.from(0)),
          rc.getUserRewards([tokenAddress], user, reward).catch(() => BigNumber.from(0)),
          this.loadRewardMeta(provider, rc, reward, cache),
        ]);
        return {
          rewardTokenAddress: reward,
          rewardTokenDecimals: meta.decimals,
          tokenIncentivesUserIndex: (userIndex as BigNumber).toString(),
          userUnclaimedRewards: (unclaimed as BigNumber).toString(),
          rewardTokenSymbol: meta.symbol,
          rewardOracleAddress: meta.oracle,
          rewardPriceFeed: meta.priceFeed,
          priceFeedDecimals: meta.priceFeedDecimals,
        };
      })
    );
    return { tokenAddress, incentiveControllerAddress: rcAddress, userRewardsInformation };
  }

  private loadRewardMeta(
    provider: Provider,
    rc: Contract,
    reward: string,
    cache: Map<string, Promise<RewardMeta>>
  ): Promise<RewardMeta> {
    const key = reward.toLowerCase();
    const existing = cache.get(key);
    if (existing) return existing;
    const task = (async () => {
      const token = new Contract(reward, ERC20_ABI, provider);
      const oracleAddress: string = await rc
        .getRewardOracle(reward)
        .catch(() => constants.AddressZero);
      const oracle = new Contract(oracleAddress, ORACLE_ABI, provider);
      const [symbol, decimals, price, priceDecimals] = await Promise.all([
        token.symbol().catch(() => ''),
        token.decimals().catch(() => 18),
        oracle.latestAnswer().catch(() => BigNumber.from(0)),
        oracle.decimals().catch(() => 8),
      ]);
      return {
        symbol,
        decimals: Number(decimals),
        oracle: oracleAddress,
        priceFeed: (price as BigNumber).toString(),
        priceFeedDecimals: Number(priceDecimals),
      };
    })();
    cache.set(key, task);
    return task;
  }
}
