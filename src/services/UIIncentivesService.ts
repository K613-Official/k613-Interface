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

type MarketTokensCache = {
  tokens: string[];
  rcAddress: string;
  expiresAt: number;
};

const marketTokensCache = new Map<string, MarketTokensCache>();
const rewardMetaCache = new Map<string, RewardMeta>();
const tokenRcCache = new Map<string, string>();
const assetPrecisionCache = new Map<string, number>();
const rewardsByAssetCache = new Map<string, { rewards: string[]; expiresAt: number }>();
const TOKENS_TTL_MS = 10 * 60 * 1000;
const REWARDS_TTL_MS = 60 * 1000;

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
  ): Promise<{
    rcAddress: string;
    tokens: string[];
    rewards: { reward: string; symbol: string; decimals: number; amount: BigNumber }[];
  }> {
    const empty = { rcAddress: constants.AddressZero, tokens: [], rewards: [] };
    if (!user) return empty;
    const provider = this.getProvider(marketData.chainId);
    invariant(marketData.addresses.LENDING_POOL, 'No Pool address for this market');

    const cacheKey = `${marketData.chainId}:${marketData.addresses.LENDING_POOL}`.toLowerCase();
    let cached = marketTokensCache.get(cacheKey);
    if (!cached || cached.expiresAt < Date.now()) {
      const pool = new Contract(marketData.addresses.LENDING_POOL, POOL_ABI, provider);
      const reserves: string[] = await pool.getReservesList();

      const tokens: string[] = [];
      let rcAddress = constants.AddressZero;
      for (const underlying of reserves) {
        const rd = await pool.getReserveData(underlying);
        for (const tok of [rd.aTokenAddress, rd.variableDebtTokenAddress]) {
          if (!tok || tok === constants.AddressZero) continue;
          tokens.push(tok);
        }
        if (rcAddress === constants.AddressZero && rd.aTokenAddress) {
          const got = await new Contract(rd.aTokenAddress, TOKEN_ABI, provider)
            .getIncentivesController()
            .catch(() => constants.AddressZero);
          if (got && got !== constants.AddressZero) rcAddress = got;
        }
      }
      cached = { tokens, rcAddress, expiresAt: Date.now() + TOKENS_TTL_MS };
      marketTokensCache.set(cacheKey, cached);
    }

    if (cached.tokens.length === 0 || cached.rcAddress === constants.AddressZero) return empty;

    const rc = new Contract(cached.rcAddress, RC_ABI, provider);
    const [rewardAddresses, amounts] = (await rc
      .getAllUserRewards(cached.tokens, user)
      .catch(() => [[], []])) as [string[], BigNumber[]];

    const rewards = await Promise.all(
      rewardAddresses.map(async (reward, i) => {
        const meta = await this.getRewardMetaCached(provider, rc, reward);
        return {
          reward,
          symbol: meta.symbol,
          decimals: meta.decimals,
          amount: amounts[i],
        };
      })
    );
    return { rcAddress: cached.rcAddress, tokens: cached.tokens, rewards };
  }

  private async getRewardMetaCached(
    provider: Provider,
    rc: Contract,
    reward: string
  ): Promise<RewardMeta> {
    const key = reward.toLowerCase();
    const existing = rewardMetaCache.get(key);
    if (existing) return existing;
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
    const meta: RewardMeta = {
      symbol,
      decimals: Number(decimals),
      oracle: oracleAddress,
      priceFeed: (price as BigNumber).toString(),
      priceFeedDecimals: Number(priceDecimals),
    };
    rewardMetaCache.set(key, meta);
    return meta;
  }

  private async resolveTokenRc(provider: Provider, tokenAddress: string): Promise<string> {
    const key = tokenAddress.toLowerCase();
    const cached = tokenRcCache.get(key);
    if (cached !== undefined) return cached;
    const rcAddress = await new Contract(tokenAddress, TOKEN_ABI, provider)
      .getIncentivesController()
      .catch(() => constants.AddressZero);
    tokenRcCache.set(key, rcAddress || constants.AddressZero);
    return rcAddress || constants.AddressZero;
  }

  private async resolveRewardsByAsset(rc: Contract, tokenAddress: string): Promise<string[]> {
    const key = `${rc.address}:${tokenAddress}`.toLowerCase();
    const cached = rewardsByAssetCache.get(key);
    if (cached && cached.expiresAt > Date.now()) return cached.rewards;
    const rewards: string[] = await rc.getRewardsByAsset(tokenAddress).catch(() => []);
    rewardsByAssetCache.set(key, { rewards, expiresAt: Date.now() + REWARDS_TTL_MS });
    return rewards;
  }

  private async resolveAssetPrecision(rc: Contract, tokenAddress: string): Promise<number> {
    const key = `${rc.address}:${tokenAddress}`.toLowerCase();
    const cached = assetPrecisionCache.get(key);
    if (cached !== undefined) return cached;
    const precision = Number(await rc.getAssetDecimals(tokenAddress).catch(() => 0));
    assetPrecisionCache.set(key, precision);
    return precision;
  }

  private async buildAssetIncentive(
    provider: Provider,
    tokenAddress: string,
    cache: Map<string, Promise<RewardMeta>>
  ): Promise<IncentiveDataHumanized> {
    if (!tokenAddress || tokenAddress === constants.AddressZero) return EMPTY_A_INC;
    const rcAddress = await this.resolveTokenRc(provider, tokenAddress);
    if (!rcAddress || rcAddress === constants.AddressZero) {
      return { tokenAddress, incentiveControllerAddress: constants.AddressZero, rewardsTokenInformation: [] };
    }
    const rc = new Contract(rcAddress, RC_ABI, provider);
    const rewards = await this.resolveRewardsByAsset(rc, tokenAddress);
    if (rewards.length === 0) {
      return { tokenAddress, incentiveControllerAddress: rcAddress, rewardsTokenInformation: [] };
    }
    const precision = await this.resolveAssetPrecision(rc, tokenAddress);
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
    const rcAddress = await this.resolveTokenRc(provider, tokenAddress);
    if (!rcAddress || rcAddress === constants.AddressZero) {
      return { tokenAddress, incentiveControllerAddress: constants.AddressZero, userRewardsInformation: [] };
    }
    const rc = new Contract(rcAddress, RC_ABI, provider);
    const rewards = await this.resolveRewardsByAsset(rc, tokenAddress);
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
