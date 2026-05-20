import { useQuery, useQueryClient } from '@tanstack/react-query';
import { waitForTransactionReceipt } from '@wagmi/core';
import distributorArtifact from 'src/abis/K613S1Distributor/K613S1Distributor.json';
import { useAccount, useConfig, useReadContract, useWriteContract } from 'wagmi';

import { fetchUserProof } from '../api/snapshotsClient';
import { usePointsCampaignConfig } from './usePointsCampaignWeeks';

const DISTRIBUTOR_ABI = (distributorArtifact as unknown as { abi: unknown[] }).abi;

export function useUserClaim(week: number) {
  const { address } = useAccount();
  const campaign = usePointsCampaignConfig();
  const distributor = campaign?.DISTRIBUTOR ?? '';
  const baseUrl = campaign?.SNAPSHOTS_BASE_URL ?? '';
  const isClaimAvailable = Boolean(distributor);
  const enabled = Boolean(address && distributor);

  const queryClient = useQueryClient();
  const wagmiConfig = useConfig();

  const proofQuery = useQuery({
    queryKey: ['points-campaign', 'proof', baseUrl, week, address?.toLowerCase()],
    queryFn: () => fetchUserProof(baseUrl, week, address as string),
    enabled: enabled && Boolean(baseUrl),
    staleTime: 5 * 60 * 1000,
    retry: (failureCount, error) => {
      if (/404/.test(String(error))) return false;
      return failureCount < 2;
    },
  });

  const claimedRead = useReadContract({
    address: distributor as `0x${string}` | undefined,
    abi: DISTRIBUTOR_ABI,
    functionName: 'claimed',
    args: address ? [address] : undefined,
    query: { enabled },
  });

  const { writeContractAsync, isPending: isWritePending } = useWriteContract();

  const cumulativeAmount = proofQuery.data?.amount ?? 0n;
  const alreadyClaimed = (claimedRead.data as bigint | undefined) ?? 0n;
  const claimable = cumulativeAmount > alreadyClaimed ? cumulativeAmount - alreadyClaimed : 0n;

  const claim = async () => {
    if (!proofQuery.data || claimable === 0n || !distributor) return;
    const hash = await writeContractAsync({
      address: distributor as `0x${string}`,
      abi: DISTRIBUTOR_ABI,
      functionName: 'claim',
      args: [proofQuery.data.amount, proofQuery.data.proof],
    });
    await waitForTransactionReceipt(wagmiConfig, { hash });
    await claimedRead.refetch();
    await queryClient.invalidateQueries({
      queryKey: ['points-campaign', 'proof', baseUrl, week, address?.toLowerCase()],
    });
    return hash;
  };

  return {
    claim,
    claimable,
    cumulativeAmount,
    alreadyClaimed,
    isClaimAvailable,
    isReady: enabled && proofQuery.isSuccess && !claimedRead.isLoading,
    isLoading: proofQuery.isLoading || claimedRead.isLoading,
    isPending: isWritePending,
    error: proofQuery.error ?? claimedRead.error,
    hasProof: Boolean(proofQuery.data),
  };
}
