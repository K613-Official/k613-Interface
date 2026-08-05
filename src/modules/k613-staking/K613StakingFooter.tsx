'use client';

import { FooterNote } from './k613Staking.styles';
import { useK613StakingPage } from './K613StakingContext';

export function K613StakingFooter() {
  const { maxExitSlots } = useK613StakingPage();
  const queueLimit = maxExitSlots === null ? 'a limited number of' : `up to ${maxExitSlots}`;

  return (
    <FooterNote>
      xK613 is a staking representation of locked K613. Rewards can be claimed without unstaking.
      Unstaking works through an exit queue with {queueLimit} active requests, and each request
      keeps its own timer and cancel action
    </FooterNote>
  );
}
