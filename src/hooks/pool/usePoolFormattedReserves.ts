import {
  EmodeDataHumanized,
  ReserveDataHumanized,
  ReservesDataHumanized,
  ReservesIncentiveDataHumanized,
} from '@aave/contract-helpers';
import { formatReservesAndIncentives } from '@aave/math-utils';
import dayjs from 'dayjs';
import memoize from 'micro-memoize';
import { reserveSortFn } from 'src/store/poolSelectors';
import { isReserveHidden } from 'src/ui-config/hiddenReserves';
import { MarketDataType } from 'src/ui-config/marketsConfig';
import { fetchIconSymbolAndName, IconMapInterface } from 'src/ui-config/reservePatches';
import { deriveEModesFromReserves } from 'src/utils/legacyEModes';
import { getNetworkConfig, NetworkConfig } from 'src/utils/marketsAndNetworksConfig';

import { usePoolsEModes } from './usePoolEModes';
import { usePoolsReservesHumanized } from './usePoolReserves';
import { usePoolsReservesIncentivesHumanized } from './usePoolReservesIncentives';
import { combineQueries, SimplifiedUseQueryResult } from './utils';

export type FormattedReservesAndIncentives = ReturnType<
  typeof formatReservesAndIncentives
>[number] &
  IconMapInterface & {
    isWrappedBaseAsset: boolean;
  } & ReserveDataHumanized;

const formatReserves = memoize(
  (
    reservesData: ReservesDataHumanized,
    incentivesData: ReservesIncentiveDataHumanized[],
    poolsEModesData: EmodeDataHumanized[],
    networkConfig: NetworkConfig,
    chainId: number
  ) => {
    const reserves = reservesData.reservesData.filter(
      (r) => !isReserveHidden(chainId, r.underlyingAsset)
    );
    const baseCurrencyData = reservesData.baseCurrencyData;
    // the legacy UiPoolDataProvider has no getEModes() view, so the categories are reconstructed
    // from the per-reserve e-mode fields it returns instead (bit indices refer to originalId, so
    // the unfiltered list is the right input here)
    const eModes =
      poolsEModesData.length > 0
        ? poolsEModesData
        : deriveEModesFromReserves(reservesData.reservesData);
    return formatReservesAndIncentives({
      reserves,
      currentTimestamp: dayjs().unix(),
      marketReferenceCurrencyDecimals: baseCurrencyData.marketReferenceCurrencyDecimals,
      marketReferencePriceInUsd: baseCurrencyData.marketReferenceCurrencyPriceInUsd,
      reserveIncentives: incentivesData,
      eModes,
    })
      .map((r) => ({
        ...r,
        ...fetchIconSymbolAndName(r),
        isWrappedBaseAsset:
          r.symbol.toLowerCase() === networkConfig.wrappedBaseAssetSymbol?.toLowerCase(),
      }))
      .sort(reserveSortFn);
  }
);

export const usePoolsFormattedReserves = (
  marketsData: MarketDataType[]
): SimplifiedUseQueryResult<FormattedReservesAndIncentives[]>[] => {
  const poolsReservesQueries = usePoolsReservesHumanized(marketsData);
  const poolsReservesIncentivesQueries = usePoolsReservesIncentivesHumanized(marketsData);
  const poolsEModesQueries = usePoolsEModes(marketsData);

  return poolsReservesQueries.map((poolReservesQuery, index) => {
    const marketData = marketsData[index];
    const poolReservesIncentivesQuery = poolsReservesIncentivesQueries[index];
    const poolEModesQuery = poolsEModesQueries[index];
    const networkConfig = getNetworkConfig(marketData.chainId);
    const selector = (
      reservesData: ReservesDataHumanized,
      incentivesData: ReservesIncentiveDataHumanized[],
      poolsEModesData: EmodeDataHumanized[]
    ) => {
      return formatReserves(
        reservesData,
        incentivesData,
        poolsEModesData,
        networkConfig,
        marketData.chainId
      );
    };
    return combineQueries(
      [poolReservesQuery, poolReservesIncentivesQuery, poolEModesQuery] as const,
      selector
    );
  });
};

export const usePoolFormattedReserves = (marketData: MarketDataType) => {
  return usePoolsFormattedReserves([marketData])[0];
};
