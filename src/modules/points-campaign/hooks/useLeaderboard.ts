import { useQuery } from '@tanstack/react-query';

import { fetchLeaderboard } from '../api/snapshotsClient';
import { usePointsCampaignConfig } from './usePointsCampaignWeeks';

export function useLeaderboard(week: number) {
  const config = usePointsCampaignConfig();
  const baseUrl = config?.SNAPSHOTS_BASE_URL ?? '';

  return useQuery({
    queryKey: ['points-campaign', 'leaderboard', baseUrl, week],
    queryFn: () => fetchLeaderboard(baseUrl, week),
    enabled: Boolean(baseUrl),
    staleTime: 5 * 60 * 1000,
    retry: (failureCount, error) => {
      if (/404/.test(String(error))) return false;
      return failureCount < 2;
    },
  });
}
