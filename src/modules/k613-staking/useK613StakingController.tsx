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
import { useRootStore } from 'src/store/root';
import { getNetworkConfig } from 'src/utils/marketsAndNetworksConfig';
import { formatUnits, parseUnits } from 'viem';
import { useAccount, useSwitchChain } from 'wagmi';

import { CtaButton, StatePaper, StateText } from './k613Staking.styles';
import type {
  K613InfoDialogKind,
  K613LockExitSubTab,
  K613MainTab,
  K613RewardPoolSubTab,
} from './k613Staking.types';

const MAX_UINT256 = BigInt('0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff');

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
  const stakingChainId = useRootStore((s) => s.currentMarketData.chainId) as number;
  const stakingNetworkName = useMemo(
    () => getNetworkConfig(stakingChainId).name,
    [stakingChainId]
  );

  const [mainTab, setMainTab] = useState<K613MainTab>('rewardPool');
  const [rewardPoolSubTab, setRewardPoolSubTab] = useState<K613RewardPoolSubTab>('claimRewards');
  const [lockExitSubTab, setLockExitSubTab] = useState<K613LockExitSubTab>('lock');

  const [stakeAmount, setStakeAmount] = useState('');
  const [exitAmount, setExitAmount] = useState('');
  const [depositAmount, setDepositAmount] = useState('');
  const [withdrawAmount, setWithdrawAmount] = useState('');
  const [instantExitMode, setInstantExitMode] = useState(false);

  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [actionPending, setActionPending] = useState<string | null>(null);
  const [infoDialog, setInfoDialog] = useState<K613InfoDialogKind>(null);
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
    totalBacking,
    isLoading,
    refetch,
  } = useK613StakingData();

  const k613Balance = useK613TokenBalance(k613Address);
  const xk613Balance = useK613TokenBalance(xk613Address);
  const allowance = useK613TokenAllowance(k613Address, stakingAddress as `0x${string}` | undefined);
  const xk613Allowance = useK613TokenAllowance(
    xk613Address,
    stakingAddress as `0x${string}` | undefined
  );
  const xk613AllowanceForDistributor = useK613TokenAllowance(
    xk613Address,
    rewardsDistributor as `0x${string}` | undefined
  );
  const rewardsData = useK613RewardsData(rewardsDistributor);

  const {
    stake,
    initiateExit,
    exit,
    instantExit,
    cancelExit,
    redeemRewards,
    isPending: isStakingActionPending,
  } = useK613StakingActions();
  const { approve, isPending: isApprovePending } = useK613Approve();
  const {
    claimRewards,
    deposit,
    withdraw,
    isPending: isClaimPending,
  } = useK613RewardsActions(rewardsDistributor);

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
  const userPoolBalance =
    typeof rewardsData.userPoolBalance === 'bigint' ? rewardsData.userPoolBalance : BigInt(0);
  const totalPoolDeposits =
    typeof rewardsData.totalDeposits === 'bigint' ? rewardsData.totalDeposits : BigInt(0);
  const poolPendingRewards =
    typeof rewardsData.poolPendingRewards === 'bigint' ? rewardsData.poolPendingRewards : BigInt(0);
  const protocolTVL = typeof totalBacking === 'bigint' ? totalBacking : BigInt(0);

  const queuedTotal = useMemo(
    () => exitQueue.reduce((acc, row) => acc + row.amount, BigInt(0)),
    [exitQueue]
  );

  const availableToUnstake = stakedAmount > queuedTotal ? stakedAmount - queuedTotal : BigInt(0);
  const orphanXk613 = walletXk613 > stakedAmount ? walletXk613 - stakedAmount : BigInt(0);
  const claimableTotal = pendingRewardsAmount + orphanXk613;
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
      claimableTotal: formatTokenAmount(claimableTotal),
      orphanXk613: formatTokenAmount(orphanXk613),
      exitSlots: `${exitQueue.length} / ${maxExitSlots}`,
      lockPeriodShort: formatStakeLockPeriod(lockDurationSeconds),
      penaltyPercent,
      userPoolBalance: formatTokenAmount(userPoolBalance),
      totalPoolDeposits: formatTokenAmount(totalPoolDeposits),
      poolPendingRewards: formatTokenAmount(poolPendingRewards),
      protocolTVL: formatTokenAmount(protocolTVL),
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
      userPoolBalance,
      totalPoolDeposits,
      poolPendingRewards,
      protocolTVL,
      claimableTotal,
      orphanXk613,
    ]
  );

  const isLockDurationPassed = useCallback(
    (exitInitiatedAt: bigint): boolean => {
      const now = BigInt(Math.floor(Date.now() / 1000));
      return now >= exitInitiatedAt + lockDurationSeconds;
    },
    [lockDurationSeconds]
  );

  const handleLock = useCallback(async () => {
    setError(null);
    setSuccessMessage(null);
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
      }
      await stake(amount);
      setStakeAmount('');
      refetch();
      k613Balance.refetch();
      xk613Balance.refetch();
      allowance.refetch();
      setInfoDialog('stakingActivated');
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Lock failed');
    } finally {
      setActionPending(null);
    }
  }, [
    stakeAmount,
    walletK613,
    allowance,
    k613Address,
    stakingAddress,
    approve,
    stake,
    refetch,
    k613Balance,
    xk613Balance,
  ]);

  const handleInitiateExit = useCallback(async () => {
    setError(null);
    setSuccessMessage(null);
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
      setError('Amount exceeds available xK613');
      return;
    }

    if (instantExitMode && !instantExitRequiresDistributor) {
      const confirmed = window.confirm(
        `Instant exit will incur a ${penaltyPercent}% fee. Continue?`
      );
      if (!confirmed) return;
    }

    setActionPending('initiateExit');
    try {
      const currentXk613Allowance = BigInt((xk613Allowance.data as bigint | undefined) ?? 0);
      if (currentXk613Allowance < amount && xk613Address && stakingAddress) {
        await approve(xk613Address, stakingAddress as `0x${string}`, MAX_UINT256);
        await xk613Allowance.refetch();
      }
      await initiateExit(amount);

      if (instantExitMode && !instantExitRequiresDistributor) {
        const newIndex = BigInt(exitQueue.length);
        await instantExit(newIndex);
        setExitAmount('');
        await Promise.all([
          refetch(),
          xk613Balance.refetch(),
          xk613Allowance.refetch(),
          k613Balance.refetch(),
        ]);
        setSuccessMessage('Instant exit completed successfully.');
      } else {
        setExitAmount('');
        await Promise.all([
          refetch(),
          xk613Balance.refetch(),
          xk613Allowance.refetch(),
          k613Balance.refetch(),
        ]);
        setSuccessMessage(
          'Exit request created. Your tokens are now in the exit queue. You can track status below or cancel the exit request.'
        );
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to create exit request');
    } finally {
      setActionPending(null);
    }
  }, [
    exitAmount,
    exitQueue.length,
    maxExitSlots,
    availableToUnstake,
    penaltyPercent,
    initiateExit,
    instantExit,
    instantExitMode,
    instantExitRequiresDistributor,
    refetch,
    xk613Allowance,
    xk613Address,
    stakingAddress,
    approve,
    xk613Balance,
    k613Balance,
  ]);

  const handleExit = useCallback(
    async (index: bigint) => {
      setError(null);
      const key = `exit:${index.toString()}`;
      setActionPending(key);
      try {
        await exit(index);
        refetch();
        k613Balance.refetch();
        setSuccessMessage('Exit completed. Tokens have been credited to your wallet.');
      } catch (e) {
        setError(e instanceof Error ? e.message : 'Exit failed');
      } finally {
        setActionPending(null);
      }
    },
    [exit, refetch, k613Balance, setSuccessMessage]
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
        xk613Balance.refetch();
      } catch (e) {
        setError(e instanceof Error ? e.message : 'Cancel failed');
      } finally {
        setActionPending(null);
      }
    },
    [cancelExit, refetch, xk613Balance]
  );

  const refetchAllRewardsState = useCallback(() => {
    rewardsData.refetch();
    refetch();
    xk613Balance.refetch();
    k613Balance.refetch();
    xk613Allowance.refetch();
  }, [rewardsData, refetch, xk613Balance, k613Balance, xk613Allowance]);

  const handleClaimRewards = useCallback(async () => {
    setError(null);
    setSuccessMessage(null);
    if (claimableTotal <= 0n) {
      setError('Nothing to claim');
      return;
    }
    if (!stakingAddress || !xk613Address) {
      setError('Staking contract not configured');
      return;
    }

    const amountToRedeem = claimableTotal;
    setActionPending('claimRewards:approve');
    try {
      const currentAllowance = BigInt((xk613Allowance.data as bigint | undefined) ?? 0);
      if (currentAllowance < amountToRedeem) {
        await approve(xk613Address, stakingAddress as `0x${string}`, MAX_UINT256);
        await xk613Allowance.refetch();
      }

      if (pendingRewardsAmount > 0n) {
        setActionPending('claimRewards:claim');
        await claimRewards();
      }

      setActionPending('claimRewards:redeem');
      await redeemRewards(amountToRedeem);

      refetchAllRewardsState();
      setSuccessMessage(`Claimed ${formatTokenAmount(amountToRedeem)} K613.`);
    } catch (e) {
      refetchAllRewardsState();
      setError(e instanceof Error ? e.message : 'Claim failed');
    } finally {
      setActionPending(null);
    }
  }, [
    claimableTotal,
    pendingRewardsAmount,
    stakingAddress,
    xk613Address,
    xk613Allowance,
    approve,
    claimRewards,
    redeemRewards,
    refetchAllRewardsState,
  ]);

  const handleDeposit = useCallback(async () => {
    setError(null);
    setSuccessMessage(null);
    const amount = parseUnits(depositAmount || '0', 18);
    if (amount <= 0n) {
      setError('Enter an amount');
      return;
    }
    if (amount > walletXk613) {
      setError('Insufficient xK613 balance');
      return;
    }
    if (!rewardsDistributor || isZeroAddress) {
      setError('Rewards distributor is not configured');
      return;
    }

    setActionPending('deposit');
    try {
      const currentAllowance = BigInt(
        (xk613AllowanceForDistributor.data as bigint | undefined) ?? 0
      );
      if (currentAllowance < amount && xk613Address && rewardsDistributor) {
        await approve(xk613Address, rewardsDistributor as `0x${string}`, MAX_UINT256);
        await xk613AllowanceForDistributor.refetch();
      }
      await deposit(amount);
      setDepositAmount('');
      rewardsData.refetch();
      xk613Balance.refetch();
      xk613AllowanceForDistributor.refetch();
      setSuccessMessage('Deposit completed successfully.');
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Deposit failed');
    } finally {
      setActionPending(null);
    }
  }, [
    depositAmount,
    walletXk613,
    rewardsDistributor,
    isZeroAddress,
    xk613AllowanceForDistributor,
    xk613Address,
    approve,
    deposit,
    rewardsData,
    xk613Balance,
  ]);

  const handleWithdraw = useCallback(async () => {
    setError(null);
    setSuccessMessage(null);
    const amount = parseUnits(withdrawAmount || '0', 18);
    if (amount <= 0n) {
      setError('Enter an amount');
      return;
    }
    if (amount > userPoolBalance) {
      setError('Insufficient pool balance');
      return;
    }
    if (!rewardsDistributor || isZeroAddress) {
      setError('Rewards distributor is not configured');
      return;
    }

    setActionPending('withdraw');
    try {
      await withdraw(amount);
      setWithdrawAmount('');
      rewardsData.refetch();
      xk613Balance.refetch();
      setSuccessMessage('Withdrawal completed successfully.');
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Withdraw failed');
    } finally {
      setActionPending(null);
    }
  }, [
    withdrawAmount,
    userPoolBalance,
    rewardsDistributor,
    isZeroAddress,
    withdraw,
    rewardsData,
    xk613Balance,
  ]);

  const setMaxStake = useCallback(() => {
    setStakeAmount(walletK613 <= 0n ? '0' : formatUnits(walletK613, 18));
  }, [walletK613]);

  const setMaxExit = useCallback(() => {
    setExitAmount(availableToUnstake <= 0n ? '0' : formatUnits(availableToUnstake, 18));
  }, [availableToUnstake]);

  const setMaxDeposit = useCallback(() => {
    setDepositAmount(walletXk613 <= 0n ? '0' : formatUnits(walletXk613, 18));
  }, [walletXk613]);

  const setMaxWithdraw = useCallback(() => {
    setWithdrawAmount(userPoolBalance <= 0n ? '0' : formatUnits(userPoolBalance, 18));
  }, [userPoolBalance]);

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

  const gate = useMemo(() => {
    if (!userAddress) {
      return (
        <StatePaper>
          <StateText variant="body2">Connect your wallet to use K613 staking.</StateText>
          <ConnectWalletButton funnel="K613 Staking" />
        </StatePaper>
      );
    }
    if (chainId !== stakingChainId) {
      return (
        <StatePaper>
          <StateText variant="body2">
            {`K613 staking uses ${stakingNetworkName} (chain ID ${stakingChainId}). Switch network to continue.`}
          </StateText>
          <CtaButton
            variant="contained"
            color="primary"
            disabled={!switchChainAsync || isSwitchChainPending}
            onClick={() => switchChainAsync?.({ chainId: stakingChainId })}
          >
            {isSwitchChainPending ? 'Switching…' : `Switch to ${stakingNetworkName}`}
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
  }, [
    userAddress,
    chainId,
    stakingChainId,
    stakingNetworkName,
    stakingAddress,
    switchChainAsync,
    isSwitchChainPending,
  ]);

  return {
    gate,
    paused: Boolean(paused),
    isLoading: combinedLoading,
    error,
    setError,
    successMessage,
    setSuccessMessage,
    mainTab,
    setMainTab,
    rewardPoolSubTab,
    setRewardPoolSubTab,
    lockExitSubTab,
    setLockExitSubTab,
    stakeAmount,
    setStakeAmount,
    exitAmount,
    setExitAmount,
    depositAmount,
    setDepositAmount,
    withdrawAmount,
    setWithdrawAmount,
    instantExitMode,
    setInstantExitMode,
    infoDialog,
    setInfoDialog,
    formatted,
    displayApy,
    lockDurationSeconds,
    exitQueue,
    maxExitSlots,
    availableToUnstakeFormatted: formatTokenAmount(availableToUnstake),
    earliestUnlockRemaining,
    penaltyPercent,
    hasStakingActivity,
    instantExitRequiresDistributor,
    pendingRewardsAmount,
    lastAccrualDisplay,
    actionPending,
    isApprovePending,
    isClaimPending: isStakingActionPending || isClaimPending,
    handleClaimRewards,
    claimableTotal,
    orphanXk613,
    handleLock,
    handleInitiateExit,
    handleExit,
    handleInstantExit,
    handleCancelExit,
    handleDeposit,
    handleWithdraw,
    setMaxStake,
    setMaxExit,
    setMaxDeposit,
    setMaxWithdraw,
    isLockDurationPassed,
    formatUnlockCountdown,
    formatExitRequestId,
    formatTokenAmount: (a: bigint) => formatTokenAmount(a),
    refetch,
  };
}
