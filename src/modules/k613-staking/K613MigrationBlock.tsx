'use client';

import { ExitQueueTable } from './ExitQueueTable';
import {
  MigrationCaption,
  MigrationHeader,
  MigrationSection,
  MigrationTitle,
} from './k613Staking.styles';
import { useK613StakingPage } from './K613StakingContext';

/**
 * Requests still sitting in the previous Staking deployment. Rendered only while
 * that queue is non-empty, so it disappears on its own once everyone has migrated.
 */
export function K613MigrationBlock() {
  const { legacyStaking, formatTokenAmount } = useK613StakingPage();

  if (!legacyStaking.hasLegacyQueue) return null;

  return (
    <MigrationSection>
      <MigrationHeader>
        <MigrationTitle>Old staking — finish your withdrawal</MigrationTitle>
        <MigrationCaption>
          These requests are held by the previous staking contract. Complete them here — new exit
          requests always go to StakingV2. Cancelling returns xK613 to your wallet, from where you
          can exit through StakingV2 with no penalty.
        </MigrationCaption>
      </MigrationHeader>

      <ExitQueueTable
        title="Exit queue"
        subtitle="Lock period and penalty are read from the old contract and may differ from StakingV2"
        rows={legacyStaking.exitQueue}
        lockDurationSeconds={legacyStaking.lockDurationSeconds}
        penaltyPercent={legacyStaking.penaltyPercent}
        disabled={legacyStaking.paused}
        actionPending={legacyStaking.actionPending}
        keyPrefix={legacyStaking.keyPrefix}
        embedded
        formatTokenAmount={formatTokenAmount}
        onExit={legacyStaking.handleExit}
        onInstantExit={legacyStaking.handleInstantExit}
        onCancel={legacyStaking.handleCancelExit}
      />
    </MigrationSection>
  );
}
