import { useQuery } from '@tanstack/react-query';
import { waitForTransactionReceipt } from '@wagmi/core';
import k613Artifact from 'src/abis/K613/K613.json';
import rewardsDistributorArtifact from 'src/abis/RewardsDistributor/RewardsDistributor.json';
import stakingArtifact from 'src/abis/Staking/Staking.json';
import { addressesByChainId } from 'src/utils/addresses';
import { useAccount, useConfig, usePublicClient, useReadContract, useWriteContract } from 'wagmi';

const STAKING_ABI = (stakingArtifact as unknown as { abi: unknown[] }).abi;
const K613_ABI = (k613Artifact as unknown as { abi: unknown[] }).abi;
const REWARDS_DISTRIBUTOR_ABI = (rewardsDistributorArtifact as unknown as { abi: unknown[] }).abi;

const XK613_ADDRESS = '0x9064d55A8A8473fA39c41A16492Fa1094Eb4E8b5' as const;

export type StakingExitRequest = {
  amount: bigint;
  exitInitiatedAt: bigint;
};

export type StakingDepositView = {
  amount: bigint;
  exitQueue: StakingExitRequest[];
};

function parseExitRequestRow(item: unknown): StakingExitRequest | null {
  if (item === null || item === undefined) return null;
  if (Array.isArray(item)) {
    const [amount, exitInitiatedAt] = item;
    if (typeof amount !== 'bigint' || typeof exitInitiatedAt !== 'bigint') return null;
    return { amount, exitInitiatedAt };
  }
  if (typeof item === 'object' && 'amount' in item && 'exitInitiatedAt' in item) {
    const row = item as { amount: unknown; exitInitiatedAt: unknown };
    if (typeof row.amount !== 'bigint' || typeof row.exitInitiatedAt !== 'bigint') return null;
    return { amount: row.amount, exitInitiatedAt: row.exitInitiatedAt };
  }
  return null;
}

export function parseStakingDepositsRead(data: unknown): StakingDepositView | undefined {
  if (data === undefined || data === null) return undefined;
  if (Array.isArray(data)) {
    if (data.length < 2) return undefined;
    const amount = data[0];
    const rawQueue = data[1];
    if (typeof amount !== 'bigint') return undefined;
    const exitQueue: StakingExitRequest[] = [];
    if (Array.isArray(rawQueue)) {
      for (const row of rawQueue) {
        const parsed = parseExitRequestRow(row);
        if (parsed && parsed.amount > 0n) exitQueue.push(parsed);
      }
    }
    return { amount, exitQueue };
  }
  if (typeof data === 'object' && 'amount' in data && 'exitQueue' in data) {
    const record = data as { amount: unknown; exitQueue: unknown };
    if (typeof record.amount !== 'bigint') return undefined;
    const exitQueue: StakingExitRequest[] = [];
    if (Array.isArray(record.exitQueue)) {
      for (const row of record.exitQueue) {
        const parsed = parseExitRequestRow(row);
        if (parsed && parsed.amount > 0n) exitQueue.push(parsed);
      }
    }
    return { amount: record.amount, exitQueue };
  }
  return undefined;
}

export function useK613StakingAddress() {
  const { chainId } = useAccount();
  const addresses = chainId ? addressesByChainId(chainId) : null;
  return addresses?.staking || null;
}

export function useK613StakingData() {
  const { address: userAddress } = useAccount();
  const stakingAddress = useK613StakingAddress();

  const deposits = useReadContract({
    address: stakingAddress as `0x${string}` | undefined,
    abi: STAKING_ABI,
    functionName: 'deposits',
    args: userAddress ? [userAddress] : undefined,
  });

  const lockDuration = useReadContract({
    address: stakingAddress as `0x${string}` | undefined,
    abi: STAKING_ABI,
    functionName: 'lockDuration',
  });

  const instantExitPenaltyBps = useReadContract({
    address: stakingAddress as `0x${string}` | undefined,
    abi: STAKING_ABI,
    functionName: 'instantExitPenaltyBps',
  });

  const k613Address = useReadContract({
    address: stakingAddress as `0x${string}` | undefined,
    abi: STAKING_ABI,
    functionName: 'k613',
  });

  const xk613Address = useReadContract({
    address: stakingAddress as `0x${string}` | undefined,
    abi: STAKING_ABI,
    functionName: 'xk613',
  });

  const paused = useReadContract({
    address: stakingAddress as `0x${string}` | undefined,
    abi: STAKING_ABI,
    functionName: 'paused',
  });

  const rewardsDistributor = useReadContract({
    address: stakingAddress as `0x${string}` | undefined,
    abi: STAKING_ABI,
    functionName: 'rewardsDistributor',
  });

  const maxExitRequests = useReadContract({
    address: stakingAddress as `0x${string}` | undefined,
    abi: STAKING_ABI,
    functionName: 'maxExitRequests',
  });

  const totalBacking = useReadContract({
    address: stakingAddress as `0x${string}` | undefined,
    abi: STAKING_ABI,
    functionName: 'totalBacking',
  });

  return {
    stakingAddress,
    userAddress,
    deposits,
    lockDuration,
    instantExitPenaltyBps,
    k613Address: k613Address.data as `0x${string}` | undefined,
    xk613Address: xk613Address.data as `0x${string}` | undefined,
    paused: paused.data,
    rewardsDistributor: rewardsDistributor.data as `0x${string}` | undefined,
    maxExitRequests: maxExitRequests.data as bigint | undefined,
    totalBacking: totalBacking.data as bigint | undefined,
    isLoading:
      deposits.isLoading ||
      lockDuration.isLoading ||
      instantExitPenaltyBps.isLoading ||
      k613Address.isLoading ||
      xk613Address.isLoading ||
      paused.isLoading ||
      rewardsDistributor.isLoading ||
      maxExitRequests.isLoading,
    refetch: () => {
      deposits.refetch();
      lockDuration.refetch();
      instantExitPenaltyBps.refetch();
      k613Address.refetch();
      xk613Address.refetch();
      paused.refetch();
      rewardsDistributor.refetch();
      maxExitRequests.refetch();
      totalBacking.refetch();
    },
  };
}

export function useK613TokenBalance(tokenAddress: `0x${string}` | undefined) {
  const { address: userAddress } = useAccount();

  return useReadContract({
    address: tokenAddress,
    abi: K613_ABI,
    functionName: 'balanceOf',
    args: userAddress ? [userAddress] : undefined,
  });
}

export function useK613TokenAllowance(
  tokenAddress: `0x${string}` | undefined,
  spenderAddress: `0x${string}` | undefined
) {
  const { address: userAddress } = useAccount();

  return useReadContract({
    address: tokenAddress,
    abi: K613_ABI,
    functionName: 'allowance',
    args: userAddress && spenderAddress ? [userAddress, spenderAddress] : undefined,
  });
}

export function useK613StakingActions() {
  const stakingAddress = useK613StakingAddress();
  const { writeContractAsync, isPending } = useWriteContract();
  const config = useConfig();

  const writeAndWait = async (args: Parameters<typeof writeContractAsync>[0]) => {
    const hash = await writeContractAsync(args);
    await waitForTransactionReceipt(config, { hash });
    return hash;
  };

  const stake = async (amount: bigint) => {
    if (!stakingAddress) throw new Error('Staking contract not configured');
    return writeAndWait({
      address: stakingAddress as `0x${string}`,
      abi: STAKING_ABI,
      functionName: 'stake',
      args: [amount],
    });
  };

  const initiateExit = async (amount: bigint) => {
    if (!stakingAddress) throw new Error('Staking contract not configured');
    return writeAndWait({
      address: stakingAddress as `0x${string}`,
      abi: STAKING_ABI,
      functionName: 'initiateExit',
      args: [amount],
    });
  };

  const exit = async (index: bigint) => {
    if (!stakingAddress) throw new Error('Staking contract not configured');
    return writeAndWait({
      address: stakingAddress as `0x${string}`,
      abi: STAKING_ABI,
      functionName: 'exit',
      args: [index],
    });
  };

  const instantExit = async (index: bigint) => {
    if (!stakingAddress) throw new Error('Staking contract not configured');
    return writeAndWait({
      address: stakingAddress as `0x${string}`,
      abi: STAKING_ABI,
      functionName: 'instantExit',
      args: [index],
    });
  };

  const cancelExit = async (index: bigint) => {
    if (!stakingAddress) throw new Error('Staking contract not configured');
    return writeAndWait({
      address: stakingAddress as `0x${string}`,
      abi: STAKING_ABI,
      functionName: 'cancelExit',
      args: [index],
    });
  };

  const redeemRewards = async (amount: bigint) => {
    if (!stakingAddress) throw new Error('Staking contract not configured');
    return writeAndWait({
      address: stakingAddress as `0x${string}`,
      abi: STAKING_ABI,
      functionName: 'redeemRewards',
      args: [amount],
    });
  };

  return {
    stake,
    initiateExit,
    exit,
    instantExit,
    cancelExit,
    redeemRewards,
    isPending,
  };
}

export function useK613Approve() {
  const { writeContractAsync, isPending } = useWriteContract();
  const config = useConfig();

  const approve = async (tokenAddress: `0x${string}`, spender: `0x${string}`, amount: bigint) => {
    const hash = await writeContractAsync({
      address: tokenAddress,
      abi: K613_ABI,
      functionName: 'approve',
      args: [spender, amount],
    });
    await waitForTransactionReceipt(config, { hash });
    return hash;
  };

  return { approve, isPending };
}

export function useK613RewardsData(rewardsDistributorAddress: `0x${string}` | undefined) {
  const { address: userAddress } = useAccount();

  const pendingRewardsOf = useReadContract({
    address: rewardsDistributorAddress,
    abi: REWARDS_DISTRIBUTOR_ABI,
    functionName: 'pendingRewardsOf',
    args: userAddress ? [userAddress] : undefined,
  });

  const lastEpochFlushAt = useReadContract({
    address: rewardsDistributorAddress,
    abi: REWARDS_DISTRIBUTOR_ABI,
    functionName: 'lastEpochFlushAt',
  });

  const nextEpochAt = useReadContract({
    address: rewardsDistributorAddress,
    abi: REWARDS_DISTRIBUTOR_ABI,
    functionName: 'nextEpochAt',
  });

  const userPoolBalance = useReadContract({
    address: rewardsDistributorAddress,
    abi: REWARDS_DISTRIBUTOR_ABI,
    functionName: 'balanceOf',
    args: userAddress ? [userAddress] : undefined,
  });

  const totalDeposits = useReadContract({
    address: rewardsDistributorAddress,
    abi: REWARDS_DISTRIBUTOR_ABI,
    functionName: 'totalDeposits',
  });

  const xk613Balance = useReadContract({
    address: XK613_ADDRESS,
    abi: K613_ABI,
    functionName: 'balanceOf',
    args: rewardsDistributorAddress ? [rewardsDistributorAddress] : undefined,
  });

  const totalDepositsValue = (totalDeposits.data as bigint | undefined) ?? BigInt(0);
  const xk613BalanceValue = (xk613Balance.data as bigint | undefined) ?? BigInt(0);
  const poolRewardBalance =
    xk613BalanceValue > totalDepositsValue ? xk613BalanceValue - totalDepositsValue : BigInt(0);

  return {
    pendingRewardsOf,
    lastEpochFlushAt: lastEpochFlushAt.data as bigint | undefined,
    nextEpochAt: nextEpochAt.data as bigint | undefined,
    userPoolBalance: userPoolBalance.data as bigint | undefined,
    totalDeposits: totalDepositsValue,
    poolPendingRewards: poolRewardBalance,
    isLoading:
      pendingRewardsOf.isLoading ||
      lastEpochFlushAt.isLoading ||
      nextEpochAt.isLoading ||
      userPoolBalance.isLoading ||
      totalDeposits.isLoading ||
      xk613Balance.isLoading,
    refetch: () => {
      pendingRewardsOf.refetch();
      lastEpochFlushAt.refetch();
      nextEpochAt.refetch();
      userPoolBalance.refetch();
      totalDeposits.refetch();
      xk613Balance.refetch();
    },
  };
}

/**
 * Reward pool APR.
 *
 * The contract has no reward rate: payouts arrive as discrete `RewardNotified`
 * events on every buyback. Summing those logs is not an option — Monad RPCs cap
 * `eth_getLogs` at a small block range (100 on the public node), while 30 days
 * is ~8.6M blocks.
 *
 * So we read `accRewardPerShare` instead — the cumulative index that grows by
 * `amount * 1e18 / totalDeposits` on every notify. Its growth over the window
 * is the yield per deposited xK613, regardless of how the pool size changed in
 * between. Two `eth_call`s instead of thousands of log requests.
 */
const APR_WINDOW_DAYS = 30;
const APR_MIN_WINDOW_DAYS = 7;
const APR_SAMPLES = 6;
/** How many separate payouts must land in the window for an average to mean anything. */
const APR_MIN_ACCRUALS = 2;
const BLOCK_TIME_PROBE_SPAN = 100_000n;

export function useK613RewardsAPR(rewardsDistributorAddress: `0x${string}` | undefined) {
  const publicClient = usePublicClient();

  const { data } = useQuery({
    queryKey: ['k613-rewards-apr', rewardsDistributorAddress, publicClient?.chain?.id],
    enabled: Boolean(publicClient && rewardsDistributorAddress),
    staleTime: 10 * 60 * 1000,
    retry: false,
    queryFn: async (): Promise<{ apr: string | null }> => {
      if (!publicClient || !rewardsDistributorAddress) return { apr: null };

      const readAcc = (blockNumber: bigint) =>
        publicClient.readContract({
          address: rewardsDistributorAddress,
          abi: REWARDS_DISTRIBUTOR_ABI,
          functionName: 'accRewardPerShare',
          blockNumber,
        }) as Promise<bigint>;

      const latest = await publicClient.getBlockNumber();
      const [latestBlock, probeBlock] = await Promise.all([
        publicClient.getBlock({ blockNumber: latest }),
        publicClient.getBlock({ blockNumber: latest - BLOCK_TIME_PROBE_SPAN }),
      ]);
      const secondsPerBlock =
        Number(latestBlock.timestamp - probeBlock.timestamp) / Number(BLOCK_TIME_PROBE_SPAN);
      if (!Number.isFinite(secondsPerBlock) || secondsPerBlock <= 0) return { apr: null };

      // Nodes keep historical state for a limited depth: ask for 30 days and
      // halve the window until the node serves the historical call.
      const minSpan = BigInt(Math.round((APR_MIN_WINDOW_DAYS * 86400) / secondsPerBlock));
      let span = BigInt(Math.round((APR_WINDOW_DAYS * 86400) / secondsPerBlock));
      let startBlock: bigint | null = null;
      let accStart = 0n;

      while (span >= minSpan) {
        const candidate = latest - span;
        try {
          accStart = await readAcc(candidate);
          startBlock = candidate;
          break;
        } catch {
          span /= 2n;
        }
      }

      // A zero index at the window start means the pool only began accruing
      // inside the window. Annualising that cold start invents a 3-digit APR.
      if (startBlock === null || accStart === 0n) return { apr: null };

      const windowStart = startBlock;
      const step = (latest - windowStart) / BigInt(APR_SAMPLES);
      const sampleBlocks = Array.from(
        { length: APR_SAMPLES - 1 },
        (_, i) => windowStart + step * BigInt(i + 1)
      );
      const [startTsBlock, samples, accLatest] = await Promise.all([
        publicClient.getBlock({ blockNumber: windowStart }),
        Promise.all(sampleBlocks.map(readAcc)),
        readAcc(latest),
      ]);

      const series = [accStart, ...samples, accLatest];
      const accruals = series.reduce(
        (count, value, i) => (i > 0 && value > series[i - 1] ? count + 1 : count),
        0
      );
      if (accruals < APR_MIN_ACCRUALS) return { apr: null };

      const windowSeconds = Number(latestBlock.timestamp - startTsBlock.timestamp);
      if (windowSeconds <= 0) return { apr: null };

      const growthPerToken = Number(accLatest - accStart) / 1e18;
      const apr = growthPerToken * ((365 * 86400) / windowSeconds) * 100;
      return { apr: apr.toFixed(2) };
    },
  });

  return { apr: data?.apr ?? null };
}

export function useK613RewardsActions(rewardsDistributorAddress: `0x${string}` | undefined) {
  const { writeContractAsync, isPending } = useWriteContract();
  const config = useConfig();

  const writeAndWait = async (args: Parameters<typeof writeContractAsync>[0]) => {
    const hash = await writeContractAsync(args);
    await waitForTransactionReceipt(config, { hash });
    return hash;
  };

  const claimRewards = async () => {
    if (!rewardsDistributorAddress) throw new Error('Rewards distributor not configured');
    return writeAndWait({
      address: rewardsDistributorAddress,
      abi: REWARDS_DISTRIBUTOR_ABI,
      functionName: 'claim',
      args: [],
    });
  };

  const deposit = async (amount: bigint) => {
    if (!rewardsDistributorAddress) throw new Error('Rewards distributor not configured');
    return writeAndWait({
      address: rewardsDistributorAddress,
      abi: REWARDS_DISTRIBUTOR_ABI,
      functionName: 'deposit',
      args: [amount],
    });
  };

  const withdraw = async (amount: bigint) => {
    if (!rewardsDistributorAddress) throw new Error('Rewards distributor not configured');
    return writeAndWait({
      address: rewardsDistributorAddress,
      abi: REWARDS_DISTRIBUTOR_ABI,
      functionName: 'withdraw',
      args: [amount],
    });
  };

  return {
    claimRewards,
    deposit,
    withdraw,
    isPending,
  };
}

export function formatLockDuration(seconds: bigint | undefined): string {
  if (!seconds) return '—';
  const s = Number(seconds);
  if (s >= 86400) return `${Math.floor(s / 86400)}d`;
  if (s >= 3600) return `${Math.floor(s / 3600)}h`;
  if (s >= 60) return `${Math.floor(s / 60)}m`;
  return `${s}s`;
}

export function formatStakeLockPeriod(seconds: bigint | undefined): string {
  if (!seconds || seconds <= 0n) return '—';
  const s = Number(seconds);
  if (!Number.isFinite(s) || s <= 0) return '—';
  if (s < 86400) return `${s} s`;
  const days = Math.floor(s / 86400);
  return `${days} day${days === 1 ? '' : 's'}`;
}

export function formatUnlockCountdown(
  exitInitiatedAt: bigint,
  lockDurationSeconds: bigint
): string {
  const unlockAt = Number(exitInitiatedAt) + Number(lockDurationSeconds);
  const now = Math.floor(Date.now() / 1000);
  let remaining = unlockAt - now;
  if (remaining <= 0) return 'Ready';
  if (remaining < 60) return `${remaining}s`;
  if (remaining < 3600) {
    const mm = Math.floor(remaining / 60);
    const ss = remaining % 60;
    return `${mm}m ${String(ss).padStart(2, '0')}s`;
  }
  const d = Math.floor(remaining / 86400);
  remaining %= 86400;
  const h = Math.floor(remaining / 3600);
  remaining %= 3600;
  const m = Math.floor(remaining / 60);
  if (d > 0) {
    return `${d}d ${String(h).padStart(2, '0')}h ${String(m).padStart(2, '0')}m`;
  }
  return `${h}h ${String(m).padStart(2, '0')}m`;
}

export function formatExitRequestId(index: number): string {
  return `REQ-${String(index + 1).padStart(3, '0')}`;
}
