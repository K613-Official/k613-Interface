import { useQuery, useQueryClient } from '@tanstack/react-query';
import { waitForTransactionReceipt } from '@wagmi/core';
import distributorArtifact from 'src/abis/K613S1Distributor/K613S1Distributor.json';
import { useAccount, useConfig, useReadContract, useWriteContract } from 'wagmi';

import { fetchUserProof } from '../api/snapshotsClient';
import { getUnlockedWeek, usePointsCampaignConfig } from './usePointsCampaignWeeks';

const DISTRIBUTOR_ABI = (distributorArtifact as unknown as { abi: unknown[] }).abi;

export function useUserClaim() {
  const { address } = useAccount();
  const campaign = usePointsCampaignConfig();
  const distributor = campaign?.DISTRIBUTOR ?? '';
  const baseUrl = campaign?.SNAPSHOTS_BASE_URL ?? '';
  const unlockedWeek = campaign ? getUnlockedWeek(campaign) : 0;
  const isClaimAvailable = Boolean(distributor);
  const enabled = Boolean(address && distributor);

  const queryClient = useQueryClient();
  const wagmiConfig = useConfig();

  const rootRead = useReadContract({
    address: distributor as `0x${string}` | undefined,
    abi: DISTRIBUTOR_ABI,
    functionName: 'merkleRoot',
    query: { enabled: isClaimAvailable },
  });
  const onChainRoot = (rootRead.data as `0x${string}` | undefined)?.toLowerCase();

  // Distributor stores a single active merkleRoot — only the snapshot whose
  // root matches it will pass MerkleProof.verify. Walk weeks newest-to-oldest
  // and pick the first match; older weeks' proofs are guaranteed to revert.
  const claimProofQuery = useQuery({
    queryKey: [
      'points-campaign',
      'claim-proof',
      baseUrl,
      address?.toLowerCase(),
      onChainRoot,
      unlockedWeek,
    ],
    queryFn: async () => {
      if (!onChainRoot || !address) return null;
      for (let w = unlockedWeek; w >= 1; w -= 1) {
        const proof = await fetchUserProof(baseUrl, w, address);
        if (proof && proof.root.toLowerCase() === onChainRoot) {
          return { week: w, ...proof };
        }
      }
      return null;
    },
    enabled: enabled && Boolean(baseUrl) && Boolean(onChainRoot) && unlockedWeek > 0,
    staleTime: 5 * 60 * 1000,
    retry: false,
  });

  const claimedRead = useReadContract({
    address: distributor as `0x${string}` | undefined,
    abi: DISTRIBUTOR_ABI,
    functionName: 'claimed',
    args: address ? [address] : undefined,
    query: { enabled },
  });

  const { writeContractAsync, isPending: isWritePending } = useWriteContract();

  const cumulativeAmount = claimProofQuery.data?.amount ?? 0n;
  const alreadyClaimed = (claimedRead.data as bigint | undefined) ?? 0n;
  const claimable = cumulativeAmount > alreadyClaimed ? cumulativeAmount - alreadyClaimed : 0n;
  const claimWeek = claimProofQuery.data?.week ?? null;

  const claim = async () => {
    if (!claimProofQuery.data || claimable === 0n || !distributor) return;
    const hash = await writeContractAsync({
      address: distributor as `0x${string}`,
      abi: DISTRIBUTOR_ABI,
      functionName: 'claim',
      args: [claimProofQuery.data.amount, claimProofQuery.data.proof],
    });
    await waitForTransactionReceipt(wagmiConfig, { hash });
    await claimedRead.refetch();
    await queryClient.invalidateQueries({ queryKey: ['points-campaign', 'claim-proof'] });
    return hash;
  };

  return {
    claim,
    claimable,
    cumulativeAmount,
    alreadyClaimed,
    claimWeek,
    isClaimAvailable,
    isReady: enabled && claimProofQuery.isSuccess && !claimedRead.isLoading && !rootRead.isLoading,
    isLoading: claimProofQuery.isLoading || claimedRead.isLoading || rootRead.isLoading,
    isPending: isWritePending,
    error: claimProofQuery.error ?? claimedRead.error ?? rootRead.error,
    hasProof: Boolean(claimProofQuery.data),
  };
}
