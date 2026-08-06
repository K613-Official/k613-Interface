'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { ConnectWalletButton } from 'src/components/WalletConnection/ConnectWalletButton';
import {
  formatStakeLockPeriod,
  parseStakingDepositsRead,
  useK613Approve,
  useK613RewardsActions,
  useK613RewardsAPR,
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
import { useK613LegacyStakingBlock } from './useK613LegacyStakingBlock';

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
  const stakingNetworkName = useMemo(() => getNetworkConfig(stakingChainId).name, [stakingChainId]);

  const [mainTab, setMainTab] = useState<K613MainTab>('rewardPool');
  const [rewardPoolSubTab, setRewardPoolSubTab] = useState<K613RewardPoolSubTab>('claimRewards');
  const [lockExitSubTab, setLockExitSubTab] = useState<K613LockExitSubTab>('lock');

  const [stakeAmount, setStakeAmount] = useState('');
  const [exitAmount, setExitAmount] = useState('');
  const [depositAmount, setDepositAmount] = useState('');
  const [withdrawAmount, setWithdrawAmount] = useState('');

  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [actionPending, setActionPending] = useState<string | null>(null);
  const [infoDialog, setInfoDialog] = useState<K613InfoDialogKind>(null);
  // Re-renders the tree once a second so the per-request unlock countdowns tick.
  const [, setUnlockCountdownTick] = useState(0);

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
    exitPendingSum,
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
  const { apr: calculatedApr } = useK613RewardsAPR(rewardsDistributor);

  const {
    stake,
    initiateExit,
    exit,
    instantExit,
    cancelExit,
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
  const exitQueue = useMemo(() => depositData?.exitQueue ?? [], [depositData?.exitQueue]);
  const lockDurationSeconds = (lockDuration.data as bigint | undefined) ?? BigInt(0);
  const penaltyBps = Number((instantExitPenaltyBps.data as bigint | undefined) ?? 0);
  const penaltyPercent = (penaltyBps / 100).toFixed(1);
  // Both come off the contract — governance can change either one.
  const lockPeriodLabel = formatStakeLockPeriod(lockDurationSeconds);
  // Read from the contract — no numeric fallback: inventing a limit would both
  // show a wrong cap and block new requests once the queue reaches it.
  const maxExitSlots = maxExitRequests !== undefined ? Number(maxExitRequests) : null;
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

  const queuedTotal = exitPendingSum ?? BigInt(0);

  // In V2 there is no separate stake position: the position *is* the xK613 the
  // wallet holds. `initiateExit` moves those tokens into the contract, so the
  // balance already excludes anything queued — subtracting the queue again would
  // hide funds the user can actually withdraw.
  const availableToExit = walletXk613;
  const totalInSystem = walletXk613 + queuedTotal;

  // xK613 parked in the reward pool is not in the wallet, so there is nothing to
  // exit until it is withdrawn. Worth saying out loud — otherwise a user with a
  // full pool deposit sees a zero balance and no explanation.
  const needsPoolWithdrawal = walletXk613 === 0n && userPoolBalance > 0n;

  const hasStakingActivity = walletXk613 > 0n || queuedTotal > 0n || userPoolBalance > 0n;

  const displayApy = calculatedApr || '—';

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
      availableToExit: formatTokenAmount(availableToExit),
      totalInSystem: formatTokenAmount(totalInSystem),
      pendingRewards: formatTokenAmount(pendingRewardsAmount),
      exitSlots: `${exitQueue.length} / ${maxExitSlots ?? '—'}`,
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
      availableToExit,
      totalInSystem,
      pendingRewardsAmount,
      exitQueue.length,
      maxExitSlots,
      lockDurationSeconds,
      penaltyPercent,
      userPoolBalance,
      totalPoolDeposits,
      poolPendingRewards,
      protocolTVL,
    ]
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
    if (maxExitSlots !== null && exitQueue.length >= maxExitSlots) {
      setError('Exit queue is full');
      return;
    }
    if (amount > availableToExit) {
      setError('Amount exceeds available xK613');
      return;
    }

    const confirmed = window.confirm(
      `xK613 will be locked for ${lockPeriodLabel}. Exiting early forfeits ${penaltyPercent}% of the amount, which is redistributed to the remaining stakers.`
    );
    if (!confirmed) return;

    setActionPending('initiateExit');
    try {
      const currentXk613Allowance = BigInt((xk613Allowance.data as bigint | undefined) ?? 0);
      if (currentXk613Allowance < amount && xk613Address && stakingAddress) {
        await approve(xk613Address, stakingAddress as `0x${string}`, MAX_UINT256);
        await xk613Allowance.refetch();
      }
      await initiateExit(amount);
      setExitAmount('');
      await Promise.all([
        refetch(),
        xk613Balance.refetch(),
        xk613Allowance.refetch(),
        k613Balance.refetch(),
      ]);
      setSuccessMessage(
        `Exit request created. Wait out the ${lockPeriodLabel} lock and press Exit, or use Instant exit on the request to withdraw now for a ${penaltyPercent}% fee.`
      );
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to create exit request');
    } finally {
      setActionPending(null);
    }
  }, [
    exitAmount,
    exitQueue.length,
    maxExitSlots,
    availableToExit,
    penaltyPercent,
    lockPeriodLabel,
    initiateExit,
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
      const key = `v2:exit:${index.toString()}`;
      setActionPending(key);
      try {
        await exit(index);
        refetch();
        k613Balance.refetch();
        setSuccessMessage('Exit completed. K613 has been credited to your wallet.');
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
      if (instantExitRequiresDistributor) {
        setError('Instant exit is unavailable until the rewards distributor is configured');
        return;
      }
      const confirmed = window.confirm(
        `Instant exit forfeits ${penaltyPercent}% of this request, which is redistributed to the remaining stakers. Continue?`
      );
      if (!confirmed) return;

      const key = `v2:instant:${index.toString()}`;
      setActionPending(key);
      try {
        await instantExit(index);
        refetch();
        k613Balance.refetch();
        setSuccessMessage(`Instant exit completed. ${penaltyPercent}% was forfeited.`);
      } catch (e) {
        setError(e instanceof Error ? e.message : 'Instant exit failed');
      } finally {
        setActionPending(null);
      }
    },
    [instantExit, refetch, k613Balance, penaltyPercent, instantExitRequiresDistributor]
  );

  const handleCancelExit = useCallback(
    async (index: bigint) => {
      setError(null);
      const key = `v2:cancel:${index.toString()}`;
      setActionPending(key);
      try {
        await cancelExit(index);
        refetch();
        xk613Balance.refetch();
        setSuccessMessage('Request cancelled. xK613 is back in your wallet.');
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

  // Rewards are paid in xK613 and stay xK613. There is no redeem step any more —
  // getting back to K613 means going through the exit queue like any other xK613.
  const handleClaimRewards = useCallback(async () => {
    setError(null);
    setSuccessMessage(null);
    if (pendingRewardsAmount <= 0n) {
      setError('Nothing to claim');
      return;
    }

    const claimed = pendingRewardsAmount;
    setActionPending('claimRewards:claim');
    try {
      await claimRewards();
      refetchAllRewardsState();
      setSuccessMessage(`Claimed ${formatTokenAmount(claimed)} xK613 to your wallet.`);
    } catch (e) {
      refetchAllRewardsState();
      setError(e instanceof Error ? e.message : 'Claim failed');
    } finally {
      setActionPending(null);
    }
  }, [pendingRewardsAmount, claimRewards, refetchAllRewardsState]);

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
    setExitAmount(availableToExit <= 0n ? '0' : formatUnits(availableToExit, 18));
  }, [availableToExit]);

  const setMaxDeposit = useCallback(() => {
    setDepositAmount(walletXk613 <= 0n ? '0' : formatUnits(walletXk613, 18));
  }, [walletXk613]);

  const setMaxWithdraw = useCallback(() => {
    setWithdrawAmount(userPoolBalance <= 0n ? '0' : formatUnits(userPoolBalance, 18));
  }, [userPoolBalance]);

  const legacyStaking = useK613LegacyStakingBlock({
    onSettled: refetchAllRewardsState,
    setError,
    setSuccessMessage,
  });

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
            StakingV2 is not configured for this chain yet. Staking and new exit requests are
            unavailable — any request already in the previous contract can still be completed below.
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
    k613Address,
    xk613Address,
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
    infoDialog,
    setInfoDialog,
    formatted,
    displayApy,
    lockDurationSeconds,
    lockPeriodLabel,
    exitQueue,
    maxExitSlots,
    availableToExit,
    needsPoolWithdrawal,
    penaltyPercent,
    hasStakingActivity,
    instantExitRequiresDistributor,
    legacyStaking,
    pendingRewardsAmount,
    lastAccrualDisplay,
    actionPending,
    isApprovePending,
    isClaimPending: isStakingActionPending || isClaimPending,
    handleClaimRewards,
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
    formatTokenAmount: (a: bigint) => formatTokenAmount(a),
    refetch,
  };
}
