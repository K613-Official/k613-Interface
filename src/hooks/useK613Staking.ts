import { useAccount, useReadContract, useWriteContract } from 'wagmi';
import { addressesByChainId } from 'src/utils/addresses';
import k613Artifact from 'src/abis/K613/K613.json';
import stakingArtifact from 'src/abis/Staking/Staking.json';

const STAKING_ABI = (stakingArtifact as unknown as { abi: unknown[] }).abi;
const K613_ABI = (k613Artifact as unknown as { abi: unknown[] }).abi;

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
        if (parsed) exitQueue.push(parsed);
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
        if (parsed) exitQueue.push(parsed);
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

  const maxExitRequests = useReadContract({
    address: stakingAddress as `0x${string}` | undefined,
    abi: STAKING_ABI,
    functionName: 'MAX_EXIT_REQUESTS',
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
    maxExitRequests: maxExitRequests.data as bigint | undefined,
    isLoading:
      deposits.isLoading ||
      lockDuration.isLoading ||
      instantExitPenaltyBps.isLoading ||
      k613Address.isLoading ||
      xk613Address.isLoading ||
      paused.isLoading ||
      maxExitRequests.isLoading,
    refetch: () => {
      deposits.refetch();
      lockDuration.refetch();
      instantExitPenaltyBps.refetch();
      k613Address.refetch();
      xk613Address.refetch();
      paused.refetch();
      maxExitRequests.refetch();
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

  const stake = async (amount: bigint) => {
    if (!stakingAddress) throw new Error('Staking contract not configured');
    return writeContractAsync({
      address: stakingAddress as `0x${string}`,
      abi: STAKING_ABI,
      functionName: 'stake',
      args: [amount],
    });
  };

  const initiateExit = async (amount: bigint) => {
    if (!stakingAddress) throw new Error('Staking contract not configured');
    return writeContractAsync({
      address: stakingAddress as `0x${string}`,
      abi: STAKING_ABI,
      functionName: 'initiateExit',
      args: [amount],
    });
  };

  const exit = async (index: bigint) => {
    if (!stakingAddress) throw new Error('Staking contract not configured');
    return writeContractAsync({
      address: stakingAddress as `0x${string}`,
      abi: STAKING_ABI,
      functionName: 'exit',
      args: [index],
    });
  };

  const instantExit = async (index: bigint) => {
    if (!stakingAddress) throw new Error('Staking contract not configured');
    return writeContractAsync({
      address: stakingAddress as `0x${string}`,
      abi: STAKING_ABI,
      functionName: 'instantExit',
      args: [index],
    });
  };

  const cancelExit = async (index: bigint) => {
    if (!stakingAddress) throw new Error('Staking contract not configured');
    return writeContractAsync({
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

  const approve = async (tokenAddress: `0x${string}`, spender: `0x${string}`, amount: bigint) => {
    return writeContractAsync({
      address: tokenAddress,
      abi: K613_ABI,
      functionName: 'approve',
      args: [spender, amount],
    });
  };

  return { approve, isPending };
}

export function formatLockDuration(seconds: bigint | undefined): string {
  if (!seconds) return '—';
  const days = Number(seconds) / 86400;
  if (days >= 1) return `${days} дн.`;
  const hours = Number(seconds) / 3600;
  if (hours >= 1) return `${hours} ч.`;
  return `${Number(seconds)} сек.`;
}

export function formatLockPeriodMonths(seconds: bigint | undefined): string {
  if (!seconds) return '—';
  const s = Number(seconds);
  const months = Math.max(1, Math.round(s / (30 * 24 * 3600)));
  return `${months} month${months === 1 ? '' : 's'}`;
}

export function formatUnlockCountdown(exitInitiatedAt: bigint, lockDurationSeconds: bigint): string {
  const unlockAt = Number(exitInitiatedAt) + Number(lockDurationSeconds);
  const now = Math.floor(Date.now() / 1000);
  let remaining = unlockAt - now;
  if (remaining <= 0) return 'Ready';
  const d = Math.floor(remaining / 86400);
  remaining %= 86400;
  const h = Math.floor(remaining / 3600);
  remaining %= 3600;
  const m = Math.floor(remaining / 60);
  return `${d}d ${String(h).padStart(2, '0')}h ${String(m).padStart(2, '0')}m`;
}

export function formatExitRequestId(index: number): string {
  return `REQ-${String(index + 1).padStart(3, '0')}`;
}
