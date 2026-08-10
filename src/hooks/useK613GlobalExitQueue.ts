import { useQuery } from '@tanstack/react-query';
import { type PublicClient, parseAbiItem } from 'viem';
import { usePublicClient } from 'wagmi';

import type { StakingExitRequest } from './useK613Staking';

const EXIT_INITIATED = parseAbiItem(
  'event ExitInitiated(address indexed account, uint256 index, uint256 amount, uint256 exitInitiatedAt)'
);

const DEPOSITS = parseAbiItem(
  'function deposits(address user) view returns (uint256 amount, (uint256 amount, uint256 exitInitiatedAt)[] exitQueue)'
);

/** Largest window we try first; halved whenever the node rejects the range. */
const MAX_LOG_SPAN = 100_000n;
const MIN_LOG_SPAN = 500n;
const LOG_CONCURRENCY = 4;

/**
 * First block where the contract has code. Saves scanning from genesis — the
 * staking deployments are ~1.4M blocks old while the chain is past 94M — and
 * avoids having to hardcode a deploy block per network in config.
 */
async function findDeployBlock(
  client: PublicClient,
  address: `0x${string}`,
  latest: bigint
): Promise<bigint> {
  let low = 0n;
  let high = latest;
  while (low < high) {
    const mid = (low + high) / 2n;
    const code = await client.getCode({ address, blockNumber: mid });
    if (code && code !== '0x') high = mid;
    else low = mid + 1n;
  }
  return low;
}

async function runPool<T>(tasks: Array<() => Promise<T>>, size: number): Promise<T[]> {
  const results: T[] = new Array(tasks.length);
  let cursor = 0;
  await Promise.all(
    Array.from({ length: Math.min(size, tasks.length) }, async () => {
      while (cursor < tasks.length) {
        const index = cursor++;
        results[index] = await tasks[index]();
      }
    })
  );
  return results;
}

/**
 * Every address that ever opened an exit request. Providers cap `eth_getLogs`
 * ranges and disagree on the cap — public Monad nodes allow 100 blocks, dRPC's
 * free tier a couple of thousand — so the span is probed once by halving on
 * rejection and then reused for the whole scan.
 */
async function collectParticipants(
  client: PublicClient,
  address: `0x${string}`,
  fromBlock: bigint,
  toBlock: bigint
): Promise<`0x${string}`[]> {
  let span = MAX_LOG_SPAN;

  while (span >= MIN_LOG_SPAN) {
    const probeTo = fromBlock + span - 1n > toBlock ? toBlock : fromBlock + span - 1n;
    try {
      await client.getLogs({ address, event: EXIT_INITIATED, fromBlock, toBlock: probeTo });
      break;
    } catch {
      span /= 2n;
    }
  }
  if (span < MIN_LOG_SPAN) throw new Error('RPC does not allow a usable eth_getLogs range');

  const windows: Array<[bigint, bigint]> = [];
  for (let start = fromBlock; start <= toBlock; start += span) {
    const end = start + span - 1n > toBlock ? toBlock : start + span - 1n;
    windows.push([start, end]);
  }

  const batches = await runPool(
    windows.map(
      ([start, end]) =>
        () =>
          client.getLogs({ address, event: EXIT_INITIATED, fromBlock: start, toBlock: end })
    ),
    LOG_CONCURRENCY
  );

  const seen = new Set<string>();
  for (const batch of batches) {
    for (const log of batch) {
      const account = log.args.account;
      if (account) seen.add(account.toLowerCase());
    }
  }
  return [...seen] as `0x${string}`[];
}

export type GlobalExitQueue = {
  rows: StakingExitRequest[];
  totalAmount: bigint;
};

/**
 * The protocol-wide exit queue: every open request, from every user.
 *
 * Logs are used only to discover *who* has ever queued an exit; the rows
 * themselves come from `deposits()` on current state. Replaying the events
 * instead would be wrong the moment `cancelExit` reorders the on-chain array,
 * since request indices in older events would no longer refer to the same entry.
 */
export function useK613GlobalExitQueue(stakingAddress: `0x${string}` | undefined) {
  const publicClient = usePublicClient();

  const query = useQuery({
    queryKey: ['k613-global-exit-queue', stakingAddress, publicClient?.chain?.id],
    enabled: Boolean(publicClient && stakingAddress),
    staleTime: 5 * 60 * 1000,
    retry: false,
    queryFn: async (): Promise<GlobalExitQueue> => {
      if (!publicClient || !stakingAddress) return { rows: [], totalAmount: 0n };

      const latest = await publicClient.getBlockNumber();
      const deployBlock = await findDeployBlock(publicClient, stakingAddress, latest);
      const participants = await collectParticipants(
        publicClient,
        stakingAddress,
        deployBlock,
        latest
      );
      if (participants.length === 0) return { rows: [], totalAmount: 0n };

      const deposits = await publicClient.multicall({
        contracts: participants.map((account) => ({
          address: stakingAddress,
          abi: [DEPOSITS] as const,
          functionName: 'deposits' as const,
          args: [account] as const,
        })),
        allowFailure: true,
      });

      const rows: StakingExitRequest[] = [];
      let totalAmount = 0n;
      for (const entry of deposits) {
        if (entry.status !== 'success') continue;
        const [, exitQueue] = entry.result as readonly [
          bigint,
          readonly { amount: bigint; exitInitiatedAt: bigint }[]
        ];
        for (const request of exitQueue) {
          if (request.amount <= 0n) continue;
          rows.push({ amount: request.amount, exitInitiatedAt: request.exitInitiatedAt });
          totalAmount += request.amount;
        }
      }

      rows.sort((a, b) => (a.exitInitiatedAt < b.exitInitiatedAt ? 1 : -1));
      return { rows, totalAmount };
    },
  });

  return {
    rows: query.data?.rows ?? [],
    totalAmount: query.data?.totalAmount ?? 0n,
    isLoading: query.isLoading,
    /** Set when the RPC refuses the scan — the table then says so instead of showing an empty queue. */
    error:
      query.error instanceof Error ? query.error.message : query.error ? 'Failed to load' : null,
    refetch: query.refetch,
  };
}
