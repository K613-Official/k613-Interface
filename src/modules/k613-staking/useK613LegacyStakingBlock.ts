'use client';

import { useCallback, useMemo, useState } from 'react';
import {
  parseStakingDepositsRead,
  useK613LegacyStakingActions,
  useK613LegacyStakingData,
} from 'src/hooks/useK613Staking';

const LEGACY_KEY_PREFIX = 'legacy';

/**
 * The previous Staking deployment after the cutover.
 *
 * `xK613.setMinter(StakingV2)` lands atomically with seeding V2, and from that
 * block V1 has exactly one working function: `cancelExit`. `stake` reverts on
 * mint, `exit` and `instantExit` revert on burnFrom — V1 no longer holds
 * MINTER_ROLE. So this hook exposes cancel and nothing else: a button that is
 * guaranteed to revert is worse than no button.
 *
 * Cancelling is also the right move on its own — it returns xK613 to the wallet,
 * from where the exit runs through StakingV2 with no penalty at all.
 */
export function useK613LegacyStakingBlock({
  onSettled,
  setError,
  setSuccessMessage,
}: {
  /** Refetches wallet balances and V2 state — a cancel changes both. */
  onSettled: () => void;
  setError: (message: string | null) => void;
  setSuccessMessage: (message: string | null) => void;
}) {
  const { legacyAddress, deposits, exitQueueLength, isCutoverDone, refetch } =
    useK613LegacyStakingData();
  const { cancelExit } = useK613LegacyStakingActions();

  const [actionPending, setActionPending] = useState<string | null>(null);

  const depositData = parseStakingDepositsRead(deposits.data);
  const exitQueue = useMemo(() => depositData?.exitQueue ?? [], [depositData?.exitQueue]);

  const handleCancelExit = useCallback(
    async (index: bigint) => {
      setError(null);
      setActionPending(`${LEGACY_KEY_PREFIX}:cancel:${index.toString()}`);
      try {
        await cancelExit(index);
        refetch();
        onSettled();
        setSuccessMessage(
          'Request cancelled. xK613 is back in your wallet — you can now exit through StakingV2 with no penalty.'
        );
      } catch (e) {
        setError(e instanceof Error ? e.message : 'Cancel failed');
      } finally {
        setActionPending(null);
      }
    },
    [cancelExit, refetch, onSettled, setError, setSuccessMessage]
  );

  return {
    /**
     * Shown only after the cutover — before it, V1 still works normally and needs
     * no migration prompt — and only while the user actually has something queued.
     */
    hasLegacyQueue: Boolean(legacyAddress) && isCutoverDone && exitQueueLength > 0n,
    keyPrefix: LEGACY_KEY_PREFIX,
    exitQueue,
    actionPending,
    handleCancelExit,
  };
}
