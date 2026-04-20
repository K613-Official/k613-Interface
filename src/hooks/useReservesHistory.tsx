/**
 * This hook is used for getting historical reserve data, and it is primarily used with charts.
 * In particular, this hook is used in the ApyGraph.
 */
import dayjs from 'dayjs';
import { useCallback, useEffect, useState } from 'react';
import { ESupportedTimeRanges } from 'src/modules/reserve-overview/TimeRangeSelector';
import { useRootStore } from 'src/store/root';
import { makeCancelable } from 'src/utils/utils';
import { useShallow } from 'zustand/shallow';

export const reserveRateTimeRangeOptions = [
  ESupportedTimeRanges.OneMonth,
  ESupportedTimeRanges.SixMonths,
  ESupportedTimeRanges.OneYear,
];
export type ReserveRateTimeRange = (typeof reserveRateTimeRangeOptions)[number];

type RestAPIResponse = {
  liquidityRate_avg: number;
  variableBorrowRate_avg: number;
  stableBorrowRate_avg: number;
  utilizationRate_avg: number;
  x: { year: number; month: number; date: number; hours: number };
};

type SubgraphHistoryItem = {
  timestamp: number;
  liquidityRate: string;
  variableBorrowRate: string;
  stableBorrowRate: string;
  utilizationRate: string;
};

const RAY = 1e27;

const resolutionForTimeRange = (
  timeRange: ReserveRateTimeRange
): { from: number; resolutionInHours: number } => {
  switch (timeRange) {
    case ESupportedTimeRanges.OneMonth:
      return { from: dayjs().subtract(30, 'day').unix(), resolutionInHours: 6 };
    case ESupportedTimeRanges.SixMonths:
      return { from: dayjs().subtract(6, 'month').unix(), resolutionInHours: 24 };
    case ESupportedTimeRanges.OneYear:
      return { from: dayjs().subtract(1, 'year').unix(), resolutionInHours: 24 };
    default:
      return { from: dayjs().unix(), resolutionInHours: 6 };
  }
};

export type FormattedReserveHistoryItem = {
  date: number;
  liquidityRate: number;
  utilizationRate: number;
  stableBorrowRate: number;
  variableBorrowRate: number;
};

/**
 * Broken Assets:
 * A list of assets that currently are broken in some way, i.e. has bad data from either the subgraph or backend server
 * Each item represents the ID of the asset, not the underlying address it's deployed to, appended with LendingPoolAddressProvider
 * contract address it is held in. So each item in the array is essentially [underlyingAssetId + LendingPoolAddressProvider address].
 */
export const BROKEN_ASSETS = [
  // ampl https://governance.aave.com/t/arc-fix-ui-bugs-in-reserve-overview-for-ampl/5885/5?u=sakulstra
  '0xd46ba6d942050d489dbd938a2c909a5d5039a1610xb53c1a33016b2dc2ff3653530bff1848a515c8c5',
  // fei usd (v2 eth mainnet)
  '0x956f47f50a910163d8bf957cf5846d573e7f87ca0xb53c1a33016b2dc2ff3653530bff1848a515c8c5',
];

const fetchFromRest = async (
  reserveAddress: string,
  timeRange: ReserveRateTimeRange,
  endpointURL: string
): Promise<FormattedReserveHistoryItem[]> => {
  const { from, resolutionInHours } = resolutionForTimeRange(timeRange);
  const url = `${endpointURL}?reserveId=${reserveAddress}&from=${from}&resolutionInHours=${resolutionInHours}`;
  const result = await fetch(url);
  const json: RestAPIResponse[] = await result.json();
  return json.map((d) => ({
    date: new Date(d.x.year, d.x.month, d.x.date, d.x.hours).getTime(),
    liquidityRate: d.liquidityRate_avg,
    variableBorrowRate: d.variableBorrowRate_avg,
    utilizationRate: d.utilizationRate_avg,
    stableBorrowRate: d.stableBorrowRate_avg,
  }));
};

const fetchFromSubgraph = async (
  subgraphUrl: string,
  underlyingAsset: string,
  addressesProvider: string,
  timeRange: ReserveRateTimeRange
): Promise<FormattedReserveHistoryItem[]> => {
  const { from } = resolutionForTimeRange(timeRange);
  const reserveId = `${underlyingAsset.toLowerCase()}${addressesProvider.toLowerCase()}`;
  const query = `
    query($r: String!, $from: Int!) {
      reserveParamsHistoryItems(
        first: 1000
        where: { reserve: $r, timestamp_gte: $from }
        orderBy: timestamp
        orderDirection: asc
      ) {
        timestamp
        liquidityRate
        variableBorrowRate
        stableBorrowRate
        utilizationRate
      }
    }`;
  const res = await fetch(subgraphUrl, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ query, variables: { r: reserveId, from } }),
  });
  if (!res.ok) throw new Error(`subgraph HTTP ${res.status}`);
  const json = await res.json();
  if (json.errors) throw new Error(`subgraph errors: ${JSON.stringify(json.errors)}`);
  const items: SubgraphHistoryItem[] = json.data?.reserveParamsHistoryItems ?? [];
  return items.map((it) => ({
    date: Number(it.timestamp) * 1000,
    liquidityRate: Number(it.liquidityRate) / RAY,
    variableBorrowRate: Number(it.variableBorrowRate) / RAY,
    stableBorrowRate: Number(it.stableBorrowRate) / RAY,
    utilizationRate: Number(it.utilizationRate),
  }));
};

export function useReserveRatesHistory(reserveAddress: string, timeRange: ReserveRateTimeRange) {
  const [currentNetworkConfig, currentMarketData] = useRootStore(
    useShallow((store) => [store.currentNetworkConfig, store.currentMarketData])
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [data, setData] = useState<FormattedReserveHistoryItem[]>([]);

  const ratesHistoryApiUrl = currentNetworkConfig?.ratesHistoryApiUrl;
  const subgraphUrl = currentMarketData?.subgraphUrl;
  const addressesProvider = currentMarketData?.addresses.LENDING_POOL_ADDRESS_PROVIDER;

  const refetchData = useCallback<() => () => void>(() => {
    setLoading(true);
    setError(false);
    setData([]);

    if (!reserveAddress || BROKEN_ASSETS.includes(reserveAddress)) {
      setLoading(false);
      return () => null;
    }

    let promise: Promise<FormattedReserveHistoryItem[]> | null = null;

    if (subgraphUrl && addressesProvider) {
      promise = fetchFromSubgraph(subgraphUrl, reserveAddress, addressesProvider, timeRange);
    } else if (ratesHistoryApiUrl) {
      // Legacy REST API expects v3 id format: underlying + addressesProvider + chainId
      const restId =
        currentMarketData?.v3 && addressesProvider
          ? `${reserveAddress}${addressesProvider}${currentMarketData.chainId}`
          : addressesProvider
            ? `${reserveAddress}${addressesProvider}`
            : reserveAddress;
      promise = fetchFromRest(restId, timeRange, ratesHistoryApiUrl);
    }

    if (!promise) {
      setLoading(false);
      return () => null;
    }

    const cancelable = makeCancelable(promise);
    cancelable.promise
      .then((rows) => {
        setData(rows);
        setLoading(false);
      })
      .catch((e) => {
        console.error('useReservesHistory(): Failed to fetch historical reserve data.', e);
        setError(true);
        setLoading(false);
      });

    return cancelable.cancel;
  }, [reserveAddress, timeRange, ratesHistoryApiUrl, subgraphUrl, addressesProvider, currentMarketData?.v3, currentMarketData?.chainId]);

  useEffect(() => {
    const cancel = refetchData();
    return () => cancel();
  }, [refetchData]);

  return {
    loading,
    data,
    error: error || BROKEN_ASSETS.includes(reserveAddress),
    refetch: refetchData,
  };
}
