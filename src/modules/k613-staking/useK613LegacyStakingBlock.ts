'use client';

import { useCallback, useMemo, useState } from 'react';
import {
  parseStakingDepositsRead,
  useK613LegacyStakingActions,
  useK613LegacyStakingData,
} from 'src/hooks/useK613Staking';

const LEGACY_KEY_PREFIX = 'legacy';

/**
 * The previous Staking deployment during the migration window.
 *
 * Read-and-drain only: the block appears solely to let anyone already in the old
 * exit queue finish withdrawing. New exit requests always go to V2, so there is
 * no `initiateExit` here. `Cancel` is offered because it returns xK613 to the
 * wallet, from where it can enter V2 with no penalty at all.
 */
export function useK613LegacyStakingBlock({
  onSettled,
  setError,
  setSuccessMessage,
}: {
  /** Refetches wallet balances and V2 state — a legacy exit changes both. */
  onSettled: () => void;
  setError: (message: string | null) => void;
  setSuccessMessage: (message: string | null) => void;
}) {
  const { legacyAddress, deposits, lockDurationSeconds, instantExitPenaltyBps, paused, refetch } =
    useK613LegacyStakingData();
  const { exit, instantExit, cancelExit } = useK613LegacyStakingActions();

  const [actionPending, setActionPending] = useState<string | null>(null);

  const depositData = parseStakingDepositsRead(deposits.data);
  const exitQueue = useMemo(() => depositData?.exitQueue ?? [], [depositData?.exitQueue]);
  const penaltyPercent = (Number(instantExitPenaltyBps) / 100).toFixed(1);

  const run = useCallback(
    async (key: string, action: () => Promise<unknown>, success: string) => {
      setError(null);
      setActionPending(key);
      try {
        await action();
        refetch();
        onSettled();
        setSuccessMessage(success);
      } catch (e) {
        setError(e instanceof Error ? e.message : 'Old staking action failed');
      } finally {
        setActionPending(null);
      }
    },
    [refetch, onSettled, setError, setSuccessMessage]
  );

  const handleExit = useCallback(
    (index: bigint) =>
      run(
        `${LEGACY_KEY_PREFIX}:exit:${index.toString()}`,
        () => exit(index),
        'Withdrawn from old staking. K613 has been credited to your wallet.'
      ),
    [run, exit]
  );

  const handleInstantExit = useCallback(
    (index: bigint) => {
      const confirmed = window.confirm(
        `Instant exit from old staking forfeits ${penaltyPercent}% of this request. Continue?`
      );
      if (!confirmed) return Promise.resolve();
      return run(
        `${LEGACY_KEY_PREFIX}:instant:${index.toString()}`,
        () => instantExit(index),
        `Instant exit completed. ${penaltyPercent}% was forfeited.`
      );
    },
    [run, instantExit, penaltyPercent]
  );

  const handleCancelExit = useCallback(
    (index: bigint) =>
      run(
        `${LEGACY_KEY_PREFIX}:cancel:${index.toString()}`,
        () => cancelExit(index),
        'Request cancelled. xK613 is back in your wallet — you can now exit through StakingV2.'
      ),
    [run, cancelExit]
  );

  return {
    /** Nothing to migrate: no legacy address configured, or an empty queue. */
    hasLegacyQueue: Boolean(legacyAddress) && exitQueue.length > 0,
    keyPrefix: LEGACY_KEY_PREFIX,
    exitQueue,
    lockDurationSeconds,
    penaltyPercent,
    paused,
    actionPending,
    handleExit,
    handleInstantExit,
    handleCancelExit,
  };
}
