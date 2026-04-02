'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { ConnectWalletButton } from 'src/components/WalletConnection/ConnectWalletButton';
import {
  formatExitRequestId,
  formatStakeLockPeriod,
  formatUnlockCountdown,
  parseStakingDepositsRead,
  useK613Approve,
  useK613RewardsActions,
  useK613RewardsData,
  useK613StakingActions,
  useK613StakingData,
  useK613TokenAllowance,
  useK613TokenBalance,
} from 'src/hooks/useK613Staking';
import { formatUnits, parseUnits } from 'viem';
import { useAccount, useSwitchChain } from 'wagmi';

import { CtaButton, StatePaper, StateText } from './k613Staking.styles';
import type { K613InfoDialogKind, K613StakingMainTab, LockStakePhase } from './k613Staking.types';

const MAX_UINT256 = BigInt('0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff');
const K613_STAKING_CHAIN_ID = 421614;

function formatTokenAmount(amount: bigint): string {
  const negative = amount < 0n;
  const normalized = negative ? -amount : amount;
  const formatted = formatUnits(normalized, 18);
  const [integerPart, fractionPartRaw = ''] = formatted.split('.');
  const fractionPart = fractionPartRaw.replace(/0+$/, '').slice(0, 4);
  const integerWithGroups = integerPart.replace(/\B(?=(\d{3})+(?!\d))/g, ',');

  if (!fractionPart) {
    return `${negative ? '-' : ''}${integerWithGroups}`;
  }

  return `${negative ? '-' : ''}${integerWithGroups}.${fractionPart}`;
}

export function useK613StakingController() {
  const { address: userAddress, chainId } = useAccount();
  const { switchChainAsync, isPending: isSwitchChainPending } = useSwitchChain();

  const [mainTab, setMainTab] = useState<K613StakingMainTab>('lockStake');
  const [stakeAmount, setStakeAmount] = useState('');
  const [exitAmount, setExitAmount] = useState('');
  const [lockPhase, setLockPhase] = useState<LockStakePhase>('enterAmount');
  const [error, setError] = useState<string | null>(null);
  const [actionPending, setActionPending] = useState<string | null>(null);
  const [infoDialog, setInfoDialog] = useState<K613InfoDialogKind>(null);
  const [manageSelectedIndex, setManageSelectedIndex] = useState(0);
  const [unlockCountdownTick, setUnlockCountdownTick] = useState(0);

  useEffect(() => {
    const id = window.setInterval(() => {
      setUnlockCountdownTick((n) => n + 1);
    }, 1000);
    return () => window.clearInterval(id);
  }, []);

  const {
    stakingAddress,
    deposits,
    lockDuration,
    instantExitPenaltyBps,
    k613Address,
    xk613Address,
    paused,
    rewardsDistributor,
    maxExitRequests,
    isLoading,
    refetch,
  } = useK613StakingData();

  const k613Balance = useK613TokenBalance(k613Address);
  const xk613Balance = useK613TokenBalance(xk613Address);
  const allowance = useK613TokenAllowance(k613Address, stakingAddress as `0x${string}` | undefined);
  const rewardsData = useK613RewardsData(rewardsDistributor);

  const { stake, initiateExit, exit, instantExit, cancelExit } = useK613StakingActions();
  const { approve, isPending: isApprovePending } = useK613Approve();
  const { claimRewards, isPending: isClaimPending } = useK613RewardsActions(rewardsDistributor);

  const depositData = parseStakingDepositsRead(deposits.data);
  const stakedAmount = depositData?.amount ?? BigInt(0);
  const exitQueue = depositData?.exitQueue ?? [];
  const lockDurationSeconds = (lockDuration.data as bigint | undefined) ?? BigInt(0);
  const penaltyBps = Number((instantExitPenaltyBps.data as bigint | undefined) ?? 0);
  const penaltyPercent = (penaltyBps / 100).toFixed(1);
  const maxExitSlots = maxExitRequests !== undefined ? Number(maxExitRequests) : 10;
  const isZeroAddress =
    !rewardsDistributor || rewardsDistributor === '0x0000000000000000000000000000000000000000';
  const instantExitRequiresDistributor = penaltyBps > 0 && isZeroAddress;

  const walletK613 = typeof k613Balance.data === 'bigint' ? k613Balance.data : BigInt(0);
  const walletXk613 = typeof xk613Balance.data === 'bigint' ? xk613Balance.data : BigInt(0);
  const pendingRewardsAmount =
    typeof rewardsData.pendingRewardsOf.data === 'bigint'
      ? rewardsData.pendingRewardsOf.data
      : BigInt(0);

  const queuedTotal = useMemo(
    () => exitQueue.reduce((acc, row) => acc + row.amount, BigInt(0)),
    [exitQueue]
  );

  const availableToUnstake = stakedAmount > queuedTotal ? stakedAmount - queuedTotal : BigInt(0);
  const hasStakingActivity = stakedAmount > 0n || walletXk613 > 0n || queuedTotal > 0n;

  const displayApy =
    typeof process !== 'undefined' && process.env.NEXT_PUBLIC_K613_DISPLAY_APY
      ? process.env.NEXT_PUBLIC_K613_DISPLAY_APY
      : '—';

  const lastAccrualDisplay = useMemo(() => {
    const lastEpoch = rewardsData.lastEpochFlushAt;
    if (!lastEpoch || lastEpoch <= 0n) return '—';
    const now = Math.floor(Date.now() / 1000);
    const diff = now - Number(lastEpoch);
    if (!Number.isFinite(diff) || diff < 0) return 'just now';
    if (diff < 60) return 'just now';
    if (diff < 3600) return `${Math.floor(diff / 60)} min ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)} hours ago`;
    return `${Math.floor(diff / 86400)} days ago`;
  }, [rewardsData.lastEpochFlushAt]);

  const combinedLoading = isLoading || rewardsData.isLoading;

  const formatted = useMemo(
    () => ({
      walletK613: formatTokenAmount(walletK613),
      lockedInExit: formatTokenAmount(queuedTotal),
      stakedXk613: formatTokenAmount(walletXk613),
      stakedPosition: formatTokenAmount(stakedAmount),
      pendingRewards: formatTokenAmount(pendingRewardsAmount),
      exitSlots: `${exitQueue.length} / ${maxExitSlots}`,
      lockPeriodShort: formatStakeLockPeriod(lockDurationSeconds),
      penaltyPercent,
    }),
    [
      walletK613,
      queuedTotal,
      walletXk613,
      stakedAmount,
      pendingRewardsAmount,
      exitQueue.length,
      maxExitSlots,
      lockDurationSeconds,
      penaltyPercent,
    ]
  );

  const isLockDurationPassed = useCallback(
    (exitInitiatedAt: bigint): boolean => {
      const now = BigInt(Math.floor(Date.now() / 1000));
      return now >= exitInitiatedAt + lockDurationSeconds;
    },
    [lockDurationSeconds]
  );

  const resetLockFlow = useCallback(() => {
    setLockPhase('enterAmount');
    setStakeAmount('');
  }, []);

  const handleLockTokens = useCallback(async () => {
    setError(null);
    const amount = parseUnits(stakeAmount || '0', 18);
    if (amount <= 0n) {
      setError('Enter an amount');
      return;
    }
    if (amount > walletK613) {
      setError('Insufficient K613 balance');
      return;
    }

    setActionPending('lock');
    try {
      const currentAllowance = BigInt((allowance.data as bigint | undefined) ?? 0);
      if (currentAllowance < amount && k613Address && stakingAddress) {
        await approve(k613Address, stakingAddress as `0x${string}`, MAX_UINT256);
        allowance.refetch();
      }
      setLockPhase('tokensPrepared');
      setInfoDialog('tokensLocked');
      k613Balance.refetch();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Approval failed');
    } finally {
      setActionPending(null);
    }
  }, [stakeAmount, walletK613, allowance, k613Address, stakingAddress, approve, k613Balance]);

  const handleSendToStaking = useCallback(async () => {
    setError(null);
    const amount = parseUnits(stakeAmount || '0', 18);
    if (amount <= 0n) {
      setError('Enter an amount');
      return;
    }

    setActionPending('stake');
    try {
      const currentAllowance = BigInt((allowance.data as bigint | undefined) ?? 0);
      if (currentAllowance < amount && k613Address && stakingAddress) {
        await approve(k613Address, stakingAddress as `0x${string}`, MAX_UINT256);
      }
      await stake(amount);
      resetLockFlow();
      refetch();
      k613Balance.refetch();
      xk613Balance.refetch();
      allowance.refetch();
      setInfoDialog('stakingActivated');
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Stake failed');
    } finally {
      setActionPending(null);
    }
  }, [
    stakeAmount,
    stake,
    resetLockFlow,
    refetch,
    k613Balance,
    xk613Balance,
    allowance,
    k613Address,
    stakingAddress,
    approve,
  ]);

  const handleInitiateExit = useCallback(async () => {
    setError(null);
    const amount = parseUnits(exitAmount || '0', 18);
    if (amount <= 0n) {
      setError('Enter an amount');
      return;
    }
    if (exitQueue.length >= maxExitSlots) {
      setError('Exit queue is full');
      return;
    }
    if (amount > availableToUnstake) {
      setError('Amount exceeds available staked balance');
      return;
    }

    setActionPending('initiateExit');
    try {
      await initiateExit(amount);
      setExitAmount('');
      refetch();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to create exit request');
    } finally {
      setActionPending(null);
    }
  }, [exitAmount, exitQueue.length, maxExitSlots, availableToUnstake, initiateExit, refetch]);

  const handleExit = useCallback(
    async (index: bigint) => {
      setError(null);
      const key = `exit:${index.toString()}`;
      setActionPending(key);
      try {
        await exit(index);
        refetch();
      } catch (e) {
        setError(e instanceof Error ? e.message : 'Exit failed');
      } finally {
        setActionPending(null);
      }
    },
    [exit, refetch]
  );

  const handleInstantExit = useCallback(
    async (index: bigint) => {
      setError(null);
      const key = `instant:${index.toString()}`;
      setActionPending(key);
      try {
        await instantExit(index);
        refetch();
        k613Balance.refetch();
      } catch (e) {
        setError(e instanceof Error ? e.message : 'Instant exit failed');
      } finally {
        setActionPending(null);
      }
    },
    [instantExit, refetch, k613Balance]
  );

  const handleCancelExit = useCallback(
    async (index: bigint) => {
      setError(null);
      const key = `cancel:${index.toString()}`;
      setActionPending(key);
      try {
        await cancelExit(index);
        refetch();
      } catch (e) {
        setError(e instanceof Error ? e.message : 'Cancel failed');
      } finally {
        setActionPending(null);
      }
    },
    [cancelExit, refetch]
  );

  const handleClaimRewards = useCallback(async () => {
    setError(null);
    if (!rewardsDistributor || isZeroAddress) {
      setError('Rewards distributor is not configured');
      return;
    }
    if (pendingRewardsAmount <= 0n) {
      setError('No rewards to claim');
      return;
    }

    setActionPending('claimRewards');
    try {
      await claimRewards();
      rewardsData.refetch();
      refetch();
      xk613Balance.refetch();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Claim failed');
    } finally {
      setActionPending(null);
    }
  }, [
    rewardsDistributor,
    isZeroAddress,
    pendingRewardsAmount,
    claimRewards,
    rewardsData,
    refetch,
    xk613Balance,
  ]);

  const setMaxStake = useCallback(() => {
    if (walletK613 <= 0n) {
      setStakeAmount('0');
      return;
    }
    setStakeAmount(formatUnits(walletK613, 18));
  }, [walletK613]);

  const setMaxExit = useCallback(() => {
    if (availableToUnstake <= 0n) {
      setExitAmount('0');
      return;
    }
    setExitAmount(formatUnits(availableToUnstake, 18));
  }, [availableToUnstake]);

  const earliestUnlockRemaining = useMemo(() => {
    if (exitQueue.length === 0) return '—';
    const now = BigInt(Math.floor(Date.now() / 1000));
    let best: bigint | null = null;
    for (const row of exitQueue) {
      const unlock = row.exitInitiatedAt + lockDurationSeconds;
      const remaining = unlock - now;
      if (remaining <= 0n) continue;
      if (best === null || remaining < best) best = remaining;
    }
    if (best === null) return 'Ready';
    const s = Number(best);
    if (s < 60) return `${s}s`;
    if (s < 3600) {
      const mm = Math.floor(s / 60);
      const ss = s % 60;
      return `${mm}m ${String(ss).padStart(2, '0')}s`;
    }
    const d = Math.floor(s / 86400);
    const rem = s % 86400;
    const h = Math.floor(rem / 3600);
    const m = Math.floor((rem % 3600) / 60);
    if (d > 0) return `${d}d ${String(h).padStart(2, '0')}h ${String(m).padStart(2, '0')}m`;
    return `${h}h ${String(m).padStart(2, '0')}m`;
  }, [exitQueue, lockDurationSeconds, unlockCountdownTick]);

  const totalQueuedFormatted = formatTokenAmount(queuedTotal);

  useEffect(() => {
    if (exitQueue.length === 0) {
      setManageSelectedIndex(0);
      return;
    }
    setManageSelectedIndex((i) => Math.min(i, exitQueue.length - 1));
  }, [exitQueue.length]);

  const selectedRow = exitQueue[manageSelectedIndex];
  const selectedReceive =
    selectedRow && penaltyBps < 10000
      ? formatTokenAmount((selectedRow.amount * BigInt(10000 - penaltyBps)) / BigInt(10000))
      : selectedRow
      ? formatTokenAmount(selectedRow.amount)
      : '0';

  const gate = useMemo(() => {
    if (!userAddress) {
      return (
        <StatePaper>
          <StateText variant="body2">Connect your wallet to use K613 staking.</StateText>
          <ConnectWalletButton funnel="K613 Staking" />
        </StatePaper>
      );
    }
    if (chainId !== K613_STAKING_CHAIN_ID) {
      return (
        <StatePaper>
          <StateText variant="body2">
            {`K613 staking uses Arbitrum Sepolia (chain ID ${K613_STAKING_CHAIN_ID}). Switch network to continue.`}
          </StateText>
          <CtaButton
            variant="contained"
            color="primary"
            disabled={!switchChainAsync || isSwitchChainPending}
            onClick={() => switchChainAsync?.({ chainId: K613_STAKING_CHAIN_ID })}
          >
            {isSwitchChainPending ? 'Switching…' : 'Switch to Arbitrum Sepolia'}
          </CtaButton>
        </StatePaper>
      );
    }
    if (!stakingAddress) {
      return (
        <StatePaper>
          <StateText variant="body2">
            Staking contract address is missing for this chain. Check addresses configuration.
          </StateText>
        </StatePaper>
      );
    }
    return null;
  }, [userAddress, chainId, stakingAddress, switchChainAsync, isSwitchChainPending]);

  return {
    gate,
    paused: Boolean(paused),
    isLoading: combinedLoading,
    error,
    setError,
    mainTab,
    setMainTab,
    stakeAmount,
    setStakeAmount,
    exitAmount,
    setExitAmount,
    lockPhase,
    resetLockFlow,
    infoDialog,
    setInfoDialog,
    manageSelectedIndex,
    setManageSelectedIndex,
    formatted,
    displayApy,
    lockDurationSeconds,
    exitQueue,
    maxExitSlots,
    availableToUnstakeFormatted: formatTokenAmount(availableToUnstake),
    totalQueuedFormatted,
    earliestUnlockRemaining,
    penaltyPercent,
    hasStakingActivity,
    instantExitRequiresDistributor,
    pendingRewardsAmount,
    lastAccrualDisplay,
    selectedRow,
    selectedReceive,
    actionPending,
    isApprovePending,
    isClaimPending,
    handleClaimRewards,
    handleLockTokens,
    handleSendToStaking,
    handleInitiateExit,
    handleExit,
    handleInstantExit,
    handleCancelExit,
    setMaxStake,
    setMaxExit,
    isLockDurationPassed,
    formatUnlockCountdown,
    formatExitRequestId,
    formatTokenAmount: (a: bigint) => formatTokenAmount(a),
    refetch,
  };
}
