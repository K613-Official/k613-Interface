import {
  EmodeDataHumanized,
  LegacyUiPoolDataProvider,
  ReserveDataHumanized,
  ReservesDataHumanized,
  UiPoolDataProvider,
  UserReserveDataHumanized,
} from '@aave/contract-helpers';
import { Provider } from '@ethersproject/providers';
import { BigNumber, constants, Contract } from 'ethers';
import { MarketDataType } from 'src/ui-config/marketsConfig';

export type UserReservesDataHumanized = {
  userReserves: UserReserveDataHumanized[];
  userEmodeCategoryId: number;
};

// v3.2 DefaultReserveInterestRateStrategyV2: one strategy for the whole pool, params per reserve
const INTEREST_RATE_STRATEGY_V2_ABI = [
  'function getInterestRateData(address reserve) view returns (tuple(uint256 optimalUsageRatio, uint256 baseVariableBorrowRate, uint256 variableRateSlope1, uint256 variableRateSlope2))',
];

const MULTICALL3_ADDRESS = '0xcA11bde05977b3631167028862bE2a173976CA11';
const MULTICALL3_ABI = [
  'function aggregate3(tuple(address target, bool allowFailure, bytes callData)[] calls) view returns (tuple(bool success, bytes returnData)[])',
];

// v3.2 Pool: e-mode membership lives in per-category bitmaps indexed by reserve id
const POOL_EMODE_ABI = [
  'function getEModeCategoryLabel(uint8 id) view returns (string)',
  'function getEModeCategoryCollateralConfig(uint8 id) view returns (tuple(uint16 ltv, uint16 liquidationThreshold, uint16 liquidationBonus))',
  'function getEModeCategoryCollateralBitmap(uint8 id) view returns (uint128)',
  'function getEModeCategoryBorrowableBitmap(uint8 id) view returns (uint128)',
];
const POOL_EMODE_CALLS = [
  'getEModeCategoryLabel',
  'getEModeCategoryCollateralConfig',
  'getEModeCategoryCollateralBitmap',
  'getEModeCategoryBorrowableBitmap',
] as const;

// category ids are assigned sequentially, so probe in batches and stop at the first empty one
const EMODE_PROBE_BATCH_SIZE = 8;
const MAX_EMODE_CATEGORY_ID = 255;
const EMODE_BITMAP_LENGTH = 256;

// the formatters read the bit of a reserve at `bitmap[bitmap.length - reserveId - 1]`
const toBitmapString = (bitmap: BigNumber) =>
  bitmap.toBigInt().toString(2).padStart(EMODE_BITMAP_LENGTH, '0');

export class UiPoolService {
  constructor(private readonly getProvider: (chainId: number) => Provider) {}

  private async getUiPoolDataService(marketData: MarketDataType) {
    const provider = this.getProvider(marketData.chainId);
    if (this.useLegacyUiPoolDataProvider(marketData)) {
      return new LegacyUiPoolDataProvider({
        uiPoolDataProviderAddress: marketData.addresses.UI_POOL_DATA_PROVIDER,
        provider,
        chainId: marketData.chainId,
      });
    } else {
      return new UiPoolDataProvider({
        uiPoolDataProviderAddress: marketData.addresses.UI_POOL_DATA_PROVIDER as string,
        provider,
        chainId: marketData.chainId,
      });
    }
  }

  private useLegacyUiPoolDataProvider(_marketData: MarketDataType) {
    return true;
  }

  async getReservesHumanized(marketData: MarketDataType): Promise<ReservesDataHumanized> {
    const uiPoolDataProvider = await this.getUiPoolDataService(marketData);
    const reservesData = await uiPoolDataProvider.getReservesHumanized({
      lendingPoolAddressProvider: marketData.addresses.LENDING_POOL_ADDRESS_PROVIDER,
    });
    return this.patchInterestRateParams(marketData, reservesData);
  }

  /**
   * The v3.1 UiPoolDataProvider reads the rate params through the no-arg getters of the old
   * per-reserve strategy contracts. This pool runs the v3.2 shared strategy, where the params are
   * stored per reserve, so those calls revert and the provider silently returns zeros — which
   * renders the interest rate model as a flat 0% line with an "Optimal 0%" marker. Read them from
   * the strategy directly for the reserves that came back empty.
   */
  private async patchInterestRateParams(
    marketData: MarketDataType,
    reservesData: ReservesDataHumanized
  ): Promise<ReservesDataHumanized> {
    const isMissingParams = (reserve: ReserveDataHumanized) =>
      reserve.optimalUsageRatio === '0' &&
      reserve.interestRateStrategyAddress !== constants.AddressZero;

    if (!reservesData.reservesData.some(isMissingParams)) {
      return reservesData;
    }

    const provider = this.getProvider(marketData.chainId);
    const strategyInterface = new Contract(constants.AddressZero, INTEREST_RATE_STRATEGY_V2_ABI)
      .interface;
    const multicall = new Contract(MULTICALL3_ADDRESS, MULTICALL3_ABI, provider);

    const targets = reservesData.reservesData.filter(isMissingParams);
    let results: Array<{ success: boolean; returnData: string }>;
    try {
      results = await multicall.callStatic.aggregate3(
        targets.map((reserve) => ({
          target: reserve.interestRateStrategyAddress,
          allowFailure: true,
          callData: strategyInterface.encodeFunctionData('getInterestRateData', [
            reserve.underlyingAsset,
          ]),
        }))
      );
    } catch {
      // no multicall3 on this chain — the graph falls back to the provider's zeros
      return reservesData;
    }

    const paramsByReserveId = new Map<string, Partial<ReserveDataHumanized>>();
    targets.forEach((reserve, index) => {
      const result = results[index];
      // strategy predates v3.2, or is not a rate strategy at all
      if (!result?.success) return;
      const [data] = strategyInterface.decodeFunctionResult(
        'getInterestRateData',
        result.returnData
      );
      paramsByReserveId.set(reserve.id, {
        optimalUsageRatio: data.optimalUsageRatio.toString(),
        baseVariableBorrowRate: data.baseVariableBorrowRate.toString(),
        variableRateSlope1: data.variableRateSlope1.toString(),
        variableRateSlope2: data.variableRateSlope2.toString(),
      });
    });

    return {
      ...reservesData,
      reservesData: reservesData.reservesData.map((reserve) => {
        const params = paramsByReserveId.get(reserve.id);
        return params ? { ...reserve, ...params } : reserve;
      }),
    };
  }

  async getUserReservesHumanized(
    marketData: MarketDataType,
    user: string
  ): Promise<UserReservesDataHumanized> {
    const uiPoolDataProvider = await this.getUiPoolDataService(marketData);
    return uiPoolDataProvider.getUserReservesHumanized({
      user,
      lendingPoolAddressProvider: marketData.addresses.LENDING_POOL_ADDRESS_PROVIDER,
    });
  }

  async getEModesHumanized(marketData: MarketDataType): Promise<EmodeDataHumanized[]> {
    const uiPoolDataProvider = await this.getUiPoolDataService(marketData);
    const eModes = await uiPoolDataProvider.getEModesHumanized({
      lendingPoolAddressProvider: marketData.addresses.LENDING_POOL_ADDRESS_PROVIDER,
    });
    if (eModes.length > 0) {
      return eModes;
    }
    return this.readEModesFromPool(marketData);
  }

  /**
   * The deployed UiPoolDataProvider predates getEModes(), so contract-helpers resolves it to the
   * legacy service, whose getEModesHumanized() is hardcoded to an empty array. The per-reserve
   * eModeCategoryId it does return is a v3.1 field the v3.2 pool never writes, so the categories
   * have to come from the pool itself — same data the modern provider would have returned.
   */
  private async readEModesFromPool(marketData: MarketDataType): Promise<EmodeDataHumanized[]> {
    const poolAddress = marketData.addresses.LENDING_POOL;
    if (!poolAddress) {
      return [];
    }

    const provider = this.getProvider(marketData.chainId);
    const poolInterface = new Contract(constants.AddressZero, POOL_EMODE_ABI).interface;
    const multicall = new Contract(MULTICALL3_ADDRESS, MULTICALL3_ABI, provider);
    const eModes: EmodeDataHumanized[] = [];

    for (let firstId = 1; firstId <= MAX_EMODE_CATEGORY_ID; firstId += EMODE_PROBE_BATCH_SIZE) {
      const ids = Array.from(
        { length: Math.min(EMODE_PROBE_BATCH_SIZE, MAX_EMODE_CATEGORY_ID - firstId + 1) },
        (_, index) => firstId + index
      );

      let results: Array<{ success: boolean; returnData: string }>;
      try {
        results = await multicall.callStatic.aggregate3(
          ids.flatMap((id) =>
            POOL_EMODE_CALLS.map((fn) => ({
              target: poolAddress,
              allowFailure: true,
              callData: poolInterface.encodeFunctionData(fn, [id]),
            }))
          )
        );
      } catch {
        // no multicall3 on this chain, or the pool is not v3.2
        return eModes;
      }

      for (let index = 0; index < ids.length; index++) {
        const batch = results.slice(
          index * POOL_EMODE_CALLS.length,
          (index + 1) * POOL_EMODE_CALLS.length
        );
        if (batch.some((result) => !result?.success)) {
          return eModes;
        }

        const [label, collateralConfig, collateralBitmap, borrowableBitmap] = batch.map(
          (result, callIndex) =>
            poolInterface.decodeFunctionResult(POOL_EMODE_CALLS[callIndex], result.returnData)[0]
        );

        const isEmpty =
          collateralBitmap.isZero() &&
          borrowableBitmap.isZero() &&
          collateralConfig.liquidationThreshold === 0;
        if (isEmpty) {
          return eModes;
        }

        eModes.push({
          id: ids[index],
          eMode: {
            ltv: collateralConfig.ltv.toString(),
            liquidationThreshold: collateralConfig.liquidationThreshold.toString(),
            liquidationBonus: collateralConfig.liquidationBonus.toString(),
            label,
            collateralBitmap: toBitmapString(collateralBitmap),
            borrowableBitmap: toBitmapString(borrowableBitmap),
          },
        });
      }
    }

    return eModes;
  }
}
