import { useQuery } from '@tanstack/react-query';

import { fetchLeaderboard } from '../api/snapshotsClient';

export function useLeaderboard(week: number) {
  return useQuery({
    queryKey: ['points-campaign', 'leaderboard', week],
    queryFn: () => fetchLeaderboard(week),
    staleTime: 5 * 60 * 1000,
    retry: (failureCount, error) => {
      if (/404/.test(String(error))) return false;
      return failureCount < 2;
    },
  });
}
