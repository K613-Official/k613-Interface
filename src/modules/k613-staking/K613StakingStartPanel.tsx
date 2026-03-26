'use client';

import {
  StakingStartCard,
  StakingStartCta,
  StakingStartSubtitle,
  StakingStartTextCol,
  StakingStartTitle,
} from './k613Staking.styles';

type K613StakingStartPanelProps = {
  onStart: () => void;
};

export function K613StakingStartPanel({ onStart }: K613StakingStartPanelProps) {
  return (
    <StakingStartCard>
      <StakingStartTextCol>
        <StakingStartTitle>K613 Staking</StakingStartTitle>
        <StakingStartSubtitle>
          Stake assets to receive xK613. Claim rewards and convert into K613
        </StakingStartSubtitle>
      </StakingStartTextCol>
      <StakingStartCta variant="contained" color="primary" size="small" onClick={onStart}>
        Start
      </StakingStartCta>
    </StakingStartCard>
  );
}
