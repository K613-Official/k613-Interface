'use client';

import { CircularProgress } from '@mui/material';
import {
  type StakingExitRequest,
  formatSubmittedAt,
  formatUnlockCountdown,
} from 'src/hooks/useK613Staking';

import {
  ExitQueueCount,
  ExitQueueHeader,
  ExitQueueSection,
  ExitQueueSubtitle,
  ExitQueueTableHead,
  ExitQueueTableRow,
  ExitQueueTdCell,
  ExitQueueThCell,
  ExitQueueTitle,
  QueueActionsCell,
  QueueCancelButton,
  QueueExitButton,
  QueuePenaltyButton,
  StatusChip,
} from './k613Staking.styles';

export type ExitQueueTableProps = {
  title: string;
  subtitle: string;
  rows: StakingExitRequest[];
  /** Rendered next to the title, e.g. `2 / 4`. Omitted for the migration block, which has no slot budget to show. */
  countLabel?: string;
  lockDurationSeconds: bigint;
  /** Instant-exit penalty of the contract this queue belongs to, e.g. `50.0`. */
  penaltyPercent: string;
  disabled: boolean;
  /** Key of the row action currently running, e.g. `v2:exit:0`. */
  actionPending: string | null;
  /** Namespaces the action keys so the V2 and migration tables never share a spinner. */
  keyPrefix: string;
  /** Drops the table's own frame when it sits inside a section that already draws one. */
  embedded?: boolean;
  formatTokenAmount: (amount: bigint) => string;
  onExit: (index: bigint) => void;
  onInstantExit: (index: bigint) => void;
  onCancel: (index: bigint) => void;
};

export function ExitQueueTable({
  title,
  subtitle,
  rows,
  countLabel,
  lockDurationSeconds,
  penaltyPercent,
  disabled,
  actionPending,
  keyPrefix,
  embedded,
  formatTokenAmount,
  onExit,
  onInstantExit,
  onCancel,
}: ExitQueueTableProps) {
  if (rows.length === 0) return null;

  const anyBusy = actionPending !== null;

  return (
    <ExitQueueSection embedded={embedded}>
      <ExitQueueHeader>
        <ExitQueueTitle>{title}</ExitQueueTitle>
        {countLabel && <ExitQueueCount>{countLabel}</ExitQueueCount>}
      </ExitQueueHeader>
      <ExitQueueSubtitle>{subtitle}</ExitQueueSubtitle>

      <ExitQueueTableHead>
        <ExitQueueThCell>Amount</ExitQueueThCell>
        <ExitQueueThCell>Submitted</ExitQueueThCell>
        <ExitQueueThCell>Unlocks in</ExitQueueThCell>
        <ExitQueueThCell>Status</ExitQueueThCell>
        <ExitQueueThCell />
      </ExitQueueTableHead>

      {rows.map((row, index) => {
        const now = BigInt(Math.floor(Date.now() / 1000));
        const unlocked = now >= row.exitInitiatedAt + lockDurationSeconds;
        const exitBusy = actionPending === `${keyPrefix}:exit:${index}`;
        const instantBusy = actionPending === `${keyPrefix}:instant:${index}`;
        const cancelBusy = actionPending === `${keyPrefix}:cancel:${index}`;

        return (
          <ExitQueueTableRow key={`${keyPrefix}-${row.exitInitiatedAt.toString()}-${index}`}>
            <ExitQueueTdCell>{formatTokenAmount(row.amount)} xK613</ExitQueueTdCell>
            <ExitQueueTdCell>{formatSubmittedAt(row.exitInitiatedAt)}</ExitQueueTdCell>
            <ExitQueueTdCell>
              {unlocked ? '—' : formatUnlockCountdown(row.exitInitiatedAt, lockDurationSeconds)}
            </ExitQueueTdCell>
            <ExitQueueTdCell>
              <StatusChip ready={unlocked}>{unlocked ? 'Ready' : 'Locked'}</StatusChip>
            </ExitQueueTdCell>
            <ExitQueueTdCell>
              <QueueActionsCell>
                <QueueExitButton
                  size="small"
                  disabled={disabled || anyBusy || !unlocked}
                  onClick={() => onExit(BigInt(index))}
                >
                  {exitBusy ? <CircularProgress size={14} color="inherit" /> : 'Exit'}
                </QueueExitButton>
                {/* The contract reverts `instantExit` with `Unlocked()` once the lock
                    has elapsed — and by then `Exit` returns the full amount anyway. */}
                <QueuePenaltyButton
                  size="small"
                  disabled={disabled || anyBusy || unlocked}
                  onClick={() => onInstantExit(BigInt(index))}
                >
                  {instantBusy ? (
                    <CircularProgress size={14} color="inherit" />
                  ) : (
                    `Instant exit −${penaltyPercent}%`
                  )}
                </QueuePenaltyButton>
                <QueueCancelButton
                  size="small"
                  disabled={disabled || anyBusy}
                  onClick={() => onCancel(BigInt(index))}
                >
                  {cancelBusy ? <CircularProgress size={14} color="inherit" /> : 'Cancel'}
                </QueueCancelButton>
              </QueueActionsCell>
            </ExitQueueTdCell>
          </ExitQueueTableRow>
        );
      })}
    </ExitQueueSection>
  );
}
