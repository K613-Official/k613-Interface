import { useQuery, useQueryClient } from '@tanstack/react-query';
import { waitForTransactionReceipt } from '@wagmi/core';
import { useEffect, useMemo, useState } from 'react';
import seasonClaimArtifact from 'src/abis/K613SeasonClaim/K613SeasonClaim.json';
import { type SeasonClaimConfig, seasonClaimByChainId } from 'src/const/seasonClaim';
import { useRootStore } from 'src/store/root';
import { useAccount, useConfig, useReadContract, useWriteContract } from 'wagmi';

import { fetchSeasonProof } from '../api/snapshotsClient';

const SEASON_CLAIM_ABI = (seasonClaimArtifact as unknown as { abi: unknown[] }).abi;

// Minimal ERC20 read used to check the user's K613S1 balance before a conversion —
// the season claim burns K613S1 from this balance, so a short balance reverts.
const ERC20_BALANCE_ABI = [
  {
    type: 'function',
    name: 'balanceOf',
    stateMutability: 'view',
    inputs: [{ name: 'account', type: 'address' }],
    outputs: [{ name: '', type: 'uint256' }],
  },
] as const;

export const SEASON_TRANCHE_COUNT = 5;
export const SEASON_TRANCHE_INTERVAL_S = 15 * 86_400;

export type SeasonClaimStatus =
  | 'not-configured' // SEASON_CLAIM address is empty → "Conversion opens at TGE"
  | 'not-connected'
  | 'not-eligible' // proof 404 — address not in the season-final snapshot
  | 'before-tge'
  | 'claimable'
  | 'awaiting-next-tranche' // vested part fully converted, more tranches pending
  | 'fully-claimed';

export type SeasonTranche = {
  index: number; // 0-based
  unlockTs: number; // unix seconds
  amount: bigint;
  status: 'converted' | 'available' | 'locked';
};

/** Resolves the active per-network season-claim config from the current market. */
export function useSeasonClaimConfig(): SeasonClaimConfig | null {
  const chainId = useRootStore((s) => s.currentMarketData.chainId) as number | undefined;
  return useMemo(() => seasonClaimByChainId(chainId), [chainId]);
}

/** Tranches unlocked at `nowS`: 20% at TGE, +20% every 15 days, capped at 5. */
export function getUnlockedTranches(tgeS: number, nowS: number): number {
  if (!Number.isFinite(tgeS) || tgeS <= 0 || nowS < tgeS) return 0;
  return Math.min(SEASON_TRANCHE_COUNT, 1 + Math.floor((nowS - tgeS) / SEASON_TRANCHE_INTERVAL_S));
}

export function useSeasonClaim() {
  const { address } = useAccount();
  const config = useSeasonClaimConfig();
  const seasonClaim = config?.SEASON_CLAIM ?? '';
  const k613s1 = config?.K613S1 ?? '';
  const baseUrl = config?.PROOFS_BASE_URL ?? '';
  const isConfigured = Boolean(seasonClaim);
  const enabled = Boolean(address && seasonClaim);

  const queryClient = useQueryClient();
  const wagmiConfig = useConfig();

  // Re-derive time-based vesting every 30s so tranches unlock without a reload.
  const [nowMs, setNowMs] = useState(() => Date.now());
  useEffect(() => {
    const id = window.setInterval(() => setNowMs(Date.now()), 30_000);
    return () => window.clearInterval(id);
  }, []);

  const tgeRead = useReadContract({
    address: seasonClaim as `0x${string}` | undefined,
    abi: SEASON_CLAIM_ABI,
    functionName: 'tgeTimestamp',
    query: { enabled: isConfigured },
  });

  const deadlineRead = useReadContract({
    address: seasonClaim as `0x${string}` | undefined,
    abi: SEASON_CLAIM_ABI,
    functionName: 'claimDeadline',
    query: { enabled: isConfigured },
  });

  const claimedRead = useReadContract({
    address: seasonClaim as `0x${string}` | undefined,
    abi: SEASON_CLAIM_ABI,
    functionName: 'claimed',
    args: address ? [address] : undefined,
    query: { enabled },
  });

  // The user's live K613S1 balance — what the next conversion actually burns from.
  const k613s1BalanceRead = useReadContract({
    address: k613s1 as `0x${string}` | undefined,
    abi: ERC20_BALANCE_ABI,
    functionName: 'balanceOf',
    args: address ? [address] : undefined,
    query: { enabled: Boolean(address && k613s1) },
  });

  const proofQuery = useQuery({
    queryKey: ['points-campaign', 'season-proof', baseUrl, address?.toLowerCase()],
    queryFn: () => fetchSeasonProof(baseUrl, address as string),
    enabled: Boolean(address && baseUrl),
    staleTime: 5 * 60 * 1000,
    retry: false,
  });

  const { writeContractAsync, isPending: isWritePending } = useWriteContract();

  const totalAllocation = proofQuery.data?.totalAllocation ?? 0n;
  const alreadyClaimed = (claimedRead.data as bigint | undefined) ?? 0n;
  const k613s1Balance = (k613s1BalanceRead.data as bigint | undefined) ?? 0n;
  const tgeTimestamp = tgeRead.data != null ? Number(tgeRead.data as bigint) : null;
  const claimDeadline = deadlineRead.data != null ? Number(deadlineRead.data as bigint) : null;

  const nowS = Math.floor(nowMs / 1000);
  const unlockedTranches = tgeTimestamp != null ? getUnlockedTranches(tgeTimestamp, nowS) : 0;
  const vested = (totalAllocation * BigInt(unlockedTranches)) / BigInt(SEASON_TRANCHE_COUNT);
  // Amount of K613S1 the next conversion burns from the wallet.
  const availableNow = vested > alreadyClaimed ? vested - alreadyClaimed : 0n;
  // The conversion reverts (ERC20InsufficientBalance) when the wallet holds fewer
  // K613S1 than it needs to burn — typically because the weekly points were never
  // claimed from the distributor.
  const hasEnoughK613S1 = k613s1Balance >= availableNow;

  const tranches: SeasonTranche[] = useMemo(() => {
    if (tgeTimestamp == null || totalAllocation === 0n) return [];
    const count = BigInt(SEASON_TRANCHE_COUNT);
    const base = totalAllocation / count;
    return Array.from({ length: SEASON_TRANCHE_COUNT }, (_, index) => {
      // The last tranche absorbs the division remainder.
      const amount =
        index === SEASON_TRANCHE_COUNT - 1 ? totalAllocation - base * (count - 1n) : base;
      const vestedThrough = (totalAllocation * BigInt(index + 1)) / count;
      const status: SeasonTranche['status'] =
        alreadyClaimed >= vestedThrough
          ? 'converted'
          : index < unlockedTranches
          ? 'available'
          : 'locked';
      return { index, unlockTs: tgeTimestamp + index * SEASON_TRANCHE_INTERVAL_S, amount, status };
    });
  }, [tgeTimestamp, totalAllocation, alreadyClaimed, unlockedTranches]);

  const isEligibilityKnown = proofQuery.isSuccess;
  const status: SeasonClaimStatus = !isConfigured
    ? 'not-configured'
    : !address
    ? 'not-connected'
    : isEligibilityKnown && proofQuery.data === null
    ? 'not-eligible'
    : tgeTimestamp != null && nowS < tgeTimestamp
    ? 'before-tge'
    : totalAllocation > 0n && alreadyClaimed >= totalAllocation
    ? 'fully-claimed'
    : availableNow > 0n
    ? 'claimable'
    : 'awaiting-next-tranche';

  const convert = async () => {
    if (!proofQuery.data || availableNow === 0n || !seasonClaim) return;
    const hash = await writeContractAsync({
      address: seasonClaim as `0x${string}`,
      abi: SEASON_CLAIM_ABI,
      functionName: 'claim',
      args: [proofQuery.data.totalAllocation, proofQuery.data.proof],
    });
    await waitForTransactionReceipt(wagmiConfig, { hash });
    await Promise.all([claimedRead.refetch(), k613s1BalanceRead.refetch()]);
    // Refresh wallet balances (K613 minted, K613S1 burned) tracked by wagmi.
    await queryClient.invalidateQueries({ queryKey: ['balance'] });
    await queryClient.invalidateQueries({ queryKey: ['readContract'] });
    return hash;
  };

  // Re-read the K613S1 balance after an external mint (a distributor points claim)
  // so the "enough to convert" gate reopens without a page reload.
  const refetchK613S1Balance = () => k613s1BalanceRead.refetch();

  return {
    config,
    status,
    convert,
    totalAllocation,
    alreadyClaimed,
    availableNow,
    k613s1Balance,
    hasEnoughK613S1,
    refetchK613S1Balance,
    unlockedTranches,
    tranches,
    tgeTimestamp,
    claimDeadline,
    isConfigured,
    isLoading:
      proofQuery.isLoading ||
      claimedRead.isLoading ||
      tgeRead.isLoading ||
      deadlineRead.isLoading ||
      k613s1BalanceRead.isLoading,
    isPending: isWritePending,
    error: proofQuery.error ?? claimedRead.error ?? tgeRead.error ?? deadlineRead.error,
  };
}
