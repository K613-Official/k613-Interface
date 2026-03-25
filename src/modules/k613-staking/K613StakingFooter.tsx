'use client';

import { FooterNote } from './k613Staking.styles';

export function K613StakingFooter() {
  return (
    <FooterNote>
      xK613 is a staking representation of locked K613. Rewards can be claimed without unstaking.
      Unstaking works through an exit queue with up to 10 active requests, and each request keeps
      its own timer and cancel action
    </FooterNote>
  );
}
