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
 * Requests left in the previous Staking deployment after the cutover.
 *
 * Cancel is the only action offered, because it is the only one V1 still honours:
 * `exit` and `instantExit` burn xK613 and V1 no longer holds MINTER_ROLE. It is
 * also the better outcome — cancelling costs nothing, while the old instant exit
 * would have taken a penalty.
 */
export function K613MigrationBlock() {
  const { legacyStaking, formatTokenAmount } = useK613StakingPage();

  if (!legacyStaking.hasLegacyQueue) return null;

  return (
    <MigrationSection>
      <MigrationHeader>
        <MigrationTitle>Old staking — finish your withdrawal</MigrationTitle>
        <MigrationCaption>
          Cancel the request — your xK613 returns to your wallet, and from there you exit through
          StakingV2 with no penalty.
        </MigrationCaption>
      </MigrationHeader>

      <ExitQueueTable
        title="Exit queue"
        subtitle="These requests are held by the previous staking contract and can only be cancelled"
        rows={legacyStaking.exitQueue}
        actionPending={legacyStaking.actionPending}
        keyPrefix={legacyStaking.keyPrefix}
        embedded
        formatTokenAmount={formatTokenAmount}
        onCancel={legacyStaking.handleCancelExit}
      />
    </MigrationSection>
  );
}
