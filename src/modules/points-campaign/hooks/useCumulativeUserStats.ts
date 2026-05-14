import { useMemo } from 'react';

import { useLeaderboard } from './useLeaderboard';
import { getUnlockedWeek } from './usePointsCampaignWeeks';

export function useCumulativeUserStats(address: string | undefined) {
  const latestWeek = getUnlockedWeek();
  const query = useLeaderboard(latestWeek);

  const cumulativePoints = useMemo<bigint>(() => {
    if (!query.data || !address) return 0n;
    const target = address.toLowerCase();
    const row = query.data.rows.find((r) => r.address.toLowerCase() === target);
    return row?.cumulativePoints ?? 0n;
  }, [query.data, address]);

  return {
    cumulativePoints,
    latestWeek,
    isLoading: query.isLoading,
    isError: query.isError,
  };
}
