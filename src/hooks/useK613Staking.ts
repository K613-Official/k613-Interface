import { useQuery } from '@tanstack/react-query';
import { waitForTransactionReceipt } from '@wagmi/core';
import k613Artifact from 'src/abis/K613/K613.json';
import rewardsDistributorArtifact from 'src/abis/RewardsDistributor/RewardsDistributor.json';
import legacyStakingArtifact from 'src/abis/Staking/Staking.json';
import stakingArtifact from 'src/abis/Staking/StakingV2.json';
import xk613Artifact from 'src/abis/xK613.sol/xK613.json';
import { networkConfigs } from 'src/ui-config/networksConfig';
import { addressesByChainId } from 'src/utils/addresses';
import { Abi, encodeFunctionData } from 'viem';
import { useAccount, useConfig, usePublicClient, useReadContract, useWriteContract } from 'wagmi';

const STAKING_ABI = (stakingArtifact as unknown as { abi: unknown[] }).abi;
/**
 * Previous Staking deployment. Identical to V2 except for `redeemRewards` and the
 * system-staker functions, but kept as its own ABI so the migration block can only
 * ever call what that contract actually exposes.
 */
const LEGACY_STAKING_ABI = (legacyStakingArtifact as unknown as { abi: unknown[] }).abi;
const K613_ABI = (k613Artifact as unknown as { abi: unknown[] }).abi;
const XK613_ABI = (xk613Artifact as unknown as { abi: unknown[] }).abi;
const REWARDS_DISTRIBUTOR_ABI = (rewardsDistributorArtifact as unknown as { abi: unknown[] }).abi;

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
  return addresses?.STAKING_V2 || null;
}

export function useK613LegacyStakingAddress() {
  const { chainId } = useAccount();
  const addresses = chainId ? addressesByChainId(chainId) : null;
  return addresses?.STAKING_LEGACY || null;
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

  const exitPendingSum = useReadContract({
    address: stakingAddress as `0x${string}` | undefined,
    abi: STAKING_ABI,
    functionName: 'exitPendingSum',
    args: userAddress ? [userAddress] : undefined,
  });

  // V2 is deployed well before it is live: it can only mint or burn once the Gov
  // Safe batch runs `xK613.setMinter(StakingV2)`. Until then `stake` and `exit`
  // revert, so the address alone is not proof the contract is usable.
  const xk613Minter = useReadContract({
    address: xk613Address.data as `0x${string}` | undefined,
    abi: XK613_ABI,
    functionName: 'minter',
  });

  const minterAddress = xk613Minter.data as `0x${string}` | undefined;

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
    exitPendingSum: exitPendingSum.data as bigint | undefined,
    /** `undefined` until `minter()` resolves — callers must not treat that as "not live". */
    isV2Live: minterAddress
      ? minterAddress.toLowerCase() === (stakingAddress ?? '').toLowerCase()
      : undefined,
    isLoading:
      deposits.isLoading ||
      lockDuration.isLoading ||
      instantExitPenaltyBps.isLoading ||
      k613Address.isLoading ||
      xk613Address.isLoading ||
      paused.isLoading ||
      rewardsDistributor.isLoading ||
      maxExitRequests.isLoading ||
      exitPendingSum.isLoading,
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
      exitPendingSum.refetch();
      xk613Minter.refetch();
    },
  };
}

/**
 * Reads for the previous Staking deployment after the cutover.
 *
 * The cutover is atomic: `xK613.setMinter(StakingV2)` lands together with seeding
 * V2, and from that block on V1 has exactly one working function — `cancelExit`.
 * `stake` reverts on mint, `exit` / `instantExit` / `redeemRewards` revert on
 * burnFrom, because V1 no longer holds MINTER_ROLE. V1 is deliberately left
 * unpaused so `cancelExit` stays reachable, which is why `paused` cannot be used
 * to detect the cutover — `minter()` is the signal.
 */
export function useK613LegacyStakingData() {
  const { address: userAddress } = useAccount();
  const legacyAddress = useK613LegacyStakingAddress();
  const enabled = Boolean(legacyAddress && userAddress);

  const deposits = useReadContract({
    address: legacyAddress as `0x${string}` | undefined,
    abi: LEGACY_STAKING_ABI,
    functionName: 'deposits',
    args: userAddress ? [userAddress] : undefined,
    query: { enabled },
  });

  const exitQueueLength = useReadContract({
    address: legacyAddress as `0x${string}` | undefined,
    abi: LEGACY_STAKING_ABI,
    functionName: 'exitQueueLength',
    args: userAddress ? [userAddress] : undefined,
    query: { enabled },
  });

  // The token V1 minted — its `minter()` is what the cutover reassigns.
  const legacyXk613 = useReadContract({
    address: legacyAddress as `0x${string}` | undefined,
    abi: LEGACY_STAKING_ABI,
    functionName: 'xk613',
    query: { enabled: Boolean(legacyAddress) },
  });

  const minter = useReadContract({
    address: legacyXk613.data as `0x${string}` | undefined,
    abi: XK613_ABI,
    functionName: 'minter',
  });

  const minterAddress = minter.data as `0x${string}` | undefined;
  // Only once the read resolves — treating "unknown" as done would flash the
  // migration block at people whose V1 still works normally.
  const isCutoverDone =
    Boolean(minterAddress) &&
    Boolean(legacyAddress) &&
    minterAddress?.toLowerCase() !== legacyAddress?.toLowerCase();

  return {
    legacyAddress,
    deposits,
    exitQueueLength: (exitQueueLength.data as bigint | undefined) ?? BigInt(0),
    isCutoverDone,
    isLoading: deposits.isLoading || exitQueueLength.isLoading || minter.isLoading,
    refetch: () => {
      deposits.refetch();
      exitQueueLength.refetch();
      minter.refetch();
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

/**
 * The only call the previous Staking deployment still honours after the cutover.
 * `exit` and `instantExit` are deliberately absent: both burn xK613, and V1 lost
 * MINTER_ROLE, so they revert every time.
 */
export function useK613LegacyStakingActions() {
  const legacyAddress = useK613LegacyStakingAddress();
  const { writeContractAsync, isPending } = useWriteContract();
  const config = useConfig();

  const cancelExit = async (index: bigint) => {
    if (!legacyAddress) throw new Error('Legacy staking contract not configured');
    const hash = await writeContractAsync({
      address: legacyAddress as `0x${string}`,
      abi: LEGACY_STAKING_ABI,
      functionName: 'cancelExit',
      args: [index],
    } as Parameters<typeof writeContractAsync>[0]);
    await waitForTransactionReceipt(config, { hash });
    return hash;
  };

  return { cancelExit, isPending };
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

  return {
    stake,
    initiateExit,
    exit,
    instantExit,
    cancelExit,
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

  // Ask the distributor which token it actually holds rather than hardcoding an
  // xK613 address: more than one xK613 deployment exists, and pointing this at
  // the wrong one silently reports a zero reward balance.
  const stakingToken = useReadContract({
    address: rewardsDistributorAddress,
    abi: REWARDS_DISTRIBUTOR_ABI,
    functionName: 'stakingToken',
  });

  const xk613Balance = useReadContract({
    address: stakingToken.data as `0x${string}` | undefined,
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
      stakingToken.isLoading ||
      xk613Balance.isLoading,
    refetch: () => {
      pendingRewardsOf.refetch();
      lastEpochFlushAt.refetch();
      nextEpochAt.refetch();
      userPoolBalance.refetch();
      totalDeposits.refetch();
      stakingToken.refetch();
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
/**
 * Sampling has to be dense enough to separate two payouts that land close together:
 * every pair of buybacks between the same two samples reads as a single accrual.
 */
const APR_SAMPLES = 12;
/**
 * How many separate payouts must land in the window for an average to mean anything.
 *
 * One is enough. Two used to be the bar, but it silently assumed the full 30-day
 * window: whenever the node cannot serve state that far back the window collapses
 * to the 7-day floor, and buybacks land roughly weekly — so a single payout in the
 * window is the normal case there, and requiring two hides the APR completely.
 */
const APR_MIN_ACCRUALS = 1;
const BLOCK_TIME_PROBE_SPAN = 100_000n;

/**
 * One RPC endpoint, reduced to the three calls the APR needs. Every read of the
 * window goes through a single source: mixing endpoints mid-calculation is how a
 * node that answers historical calls with *current* state stays invisible.
 */
type AprSource = {
  label: string;
  getBlockNumber: () => Promise<bigint>;
  getBlockTimestamp: (blockNumber: bigint) => Promise<number>;
  readAcc: (blockNumber: bigint) => Promise<bigint>;
};

const jsonRpcSource = (url: string, distributor: `0x${string}`, callData: `0x${string}`) => {
  const call = async (method: string, params: unknown[]) => {
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ jsonrpc: '2.0', id: 1, method, params }),
    });
    const body = await response.json();
    if (body.error || body.result === undefined || body.result === null) {
      throw new Error(body.error?.message ?? `${method} failed`);
    }
    return body.result;
  };

  return {
    label: url,
    getBlockNumber: async () => BigInt(await call('eth_blockNumber', [])),
    getBlockTimestamp: async (blockNumber: bigint) => {
      const block = await call('eth_getBlockByNumber', [`0x${blockNumber.toString(16)}`, false]);
      return Number(BigInt(block.timestamp));
    },
    readAcc: async (blockNumber: bigint) => {
      const result = await call('eth_call', [
        { to: distributor, data: callData },
        `0x${blockNumber.toString(16)}`,
      ]);
      // A pruned node answers a historical call with empty data instead of an error
      if (typeof result !== 'string' || result === '0x') {
        throw new Error('Historical state unavailable');
      }
      return BigInt(result);
    },
  } satisfies AprSource;
};

export type RewardsAprResult = {
  /** Annualised rate, percent, as a fixed-2 string. */
  apr: string;
  /** How much history this endpoint actually served — the figure is only as good as this. */
  windowDays: number;
  /** Separate payouts seen in the window. One payout is a sample, not an average. */
  payouts: number;
};

/** `null` when this endpoint cannot support the calculation — the caller then tries the next one. */
async function computeRewardsApr(source: AprSource): Promise<RewardsAprResult | null> {
  const latest = await source.getBlockNumber();
  const [latestTs, probeTs] = await Promise.all([
    source.getBlockTimestamp(latest),
    source.getBlockTimestamp(latest - BLOCK_TIME_PROBE_SPAN),
  ]);
  const secondsPerBlock = (latestTs - probeTs) / Number(BLOCK_TIME_PROBE_SPAN);
  if (!Number.isFinite(secondsPerBlock) || secondsPerBlock <= 0) return null;

  // Nodes keep historical state for a limited depth. Halving from 30 days lands on
  // 7.5 even when the node happily serves 10, and with a 7-day epoch that shortfall
  // decides whether a payout falls inside the window at all — the difference between
  // showing 12% and 0.5% for the same pool. So binary-search the real boundary.
  const maxSpan = BigInt(Math.round((APR_WINDOW_DAYS * 86400) / secondsPerBlock));
  const minSpan = BigInt(Math.round((APR_MIN_WINDOW_DAYS * 86400) / secondsPerBlock));

  const servesState = async (span: bigint) => {
    try {
      return await source.readAcc(latest - span);
    } catch {
      return null;
    }
  };

  let accStart = await servesState(maxSpan);
  let deepest = accStart === null ? null : maxSpan;

  if (accStart === null) {
    let servable = 0n;
    let unservable = maxSpan;
    // Bail out early when even the shortest useful window is out of reach.
    const atMin = await servesState(minSpan);
    if (atMin === null) return null;
    accStart = atMin;
    servable = minSpan;

    while (unservable - servable > BigInt(Math.round(86400 / secondsPerBlock))) {
      const middle = (servable + unservable) / 2n;
      const value = await servesState(middle);
      if (value === null) {
        unservable = middle;
      } else {
        servable = middle;
        accStart = value;
      }
    }
    deepest = servable;
  }

  const startBlock = deepest === null ? null : latest - deepest;

  // A zero index at the window start means the pool only began accruing inside the
  // window. Annualising that cold start invents a 3-digit APR.
  if (startBlock === null || accStart === null || accStart === 0n) return null;

  const windowStart = startBlock;
  const step = (latest - windowStart) / BigInt(APR_SAMPLES);
  const sampleBlocks = Array.from(
    { length: APR_SAMPLES - 1 },
    (_, i) => windowStart + step * BigInt(i + 1)
  );
  const [startTs, samples, accLatest] = await Promise.all([
    source.getBlockTimestamp(windowStart),
    Promise.all(sampleBlocks.map(source.readAcc)),
    source.readAcc(latest),
  ]);

  const series = [accStart, ...samples, accLatest];
  const accruals = series.reduce(
    (count, value, i) => (i > 0 && value > series[i - 1] ? count + 1 : count),
    0
  );
  // Also the tell for an endpoint that serves current state for every past block:
  // the whole series comes back flat, so there is nothing to annualise here.
  if (accruals < APR_MIN_ACCRUALS) return null;

  const windowSeconds = latestTs - startTs;
  if (windowSeconds <= 0) return null;

  const growthPerToken = Number(accLatest - accStart) / 1e18;
  return {
    apr: (growthPerToken * ((365 * 86400) / windowSeconds) * 100).toFixed(2),
    windowDays: windowSeconds / 86400,
    payouts: accruals,
  };
}

export function useK613RewardsAPR(rewardsDistributorAddress: `0x${string}` | undefined) {
  const publicClient = usePublicClient();

  const { data } = useQuery({
    queryKey: ['k613-rewards-apr', rewardsDistributorAddress, publicClient?.chain?.id],
    enabled: Boolean(publicClient && rewardsDistributorAddress),
    staleTime: 10 * 60 * 1000,
    retry: false,
    queryFn: async (): Promise<{ apr: string | null; windowDays?: number; payouts?: number }> => {
      if (!publicClient || !rewardsDistributorAddress) return { apr: null };

      const callData = encodeFunctionData({
        abi: REWARDS_DISTRIBUTOR_ABI as Abi,
        functionName: 'accRewardPerShare',
      });

      const sources: AprSource[] = [
        {
          label: 'app',
          getBlockNumber: () => publicClient.getBlockNumber(),
          getBlockTimestamp: async (blockNumber) =>
            Number((await publicClient.getBlock({ blockNumber })).timestamp),
          readAcc: (blockNumber) =>
            publicClient.readContract({
              address: rewardsDistributorAddress,
              abi: REWARDS_DISTRIBUTOR_ABI,
              functionName: 'accRewardPerShare',
              blockNumber,
            }) as Promise<bigint>,
        },
        ...(publicClient.chain
          ? (networkConfigs[publicClient.chain.id]?.publicJsonRPCUrl ?? []).map((url) =>
              jsonRpcSource(url, rewardsDistributorAddress, callData)
            )
          : []),
      ];

      // Whatever the app's own endpoint does — rejects historical calls, rate-limits
      // mid-window, or hands back today's state for every past block — the figure is
      // still available from the chain's public nodes, so keep asking down the list.
      for (const source of sources) {
        try {
          const result = await computeRewardsApr(source);
          if (result !== null) return result;
        } catch {
          // endpoint unusable for this calculation — try the next
        }
      }

      return { apr: null };
    },
  });

  return {
    apr: data?.apr ?? null,
    /** Days of history the figure is based on — the caller should say so out loud. */
    windowDays: data?.windowDays ?? null,
    /** Payouts observed in that window. One or two is a sample, not a trend. */
    payouts: data?.payouts ?? null,
  };
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

/**
 * Submission date of an exit request, e.g. `10 Aug 2026, 13:38`.
 *
 * Pinned to en-GB rather than the browser locale: the rest of the page is
 * English, so a Russian or German browser would otherwise render one stray
 * localised string in the middle of an English table.
 */
export function formatSubmittedAt(exitInitiatedAt: bigint): string {
  const ms = Number(exitInitiatedAt) * 1000;
  if (!Number.isFinite(ms) || ms <= 0) return '—';
  return new Date(ms).toLocaleString('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  });
}
