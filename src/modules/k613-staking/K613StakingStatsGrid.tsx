'use client';

import {
  StatCard,
  StatInner,
  StatLabel,
  StatsOuter,
  StatsRow,
  StatValue
} from './k613Staking.styles';
import { useK613StakingPage } from './K613StakingContext';

export function K613StakingStatsGrid() {
  const { formatted, isLoading } = useK613StakingPage();

  if (isLoading) {
    return null;
  }

  return (
    <StatsOuter>
      <StatsRow>
        <StatCard>
          <StatInner>
            <StatLabel>Available for Staking</StatLabel>
            <StatValue>{formatted.walletK613}</StatValue>
          </StatInner>
        </StatCard>
        <StatCard>
          <StatInner>
            <StatLabel>Locked for Staking</StatLabel>
            <StatValue>{formatted.lockedInExit}</StatValue>
          </StatInner>
        </StatCard>
        <StatCard>
          <StatInner>
            <StatLabel>Minted xK613</StatLabel>
            <StatValue>{formatted.stakedXk613}</StatValue>
          </StatInner>
        </StatCard>
      </StatsRow>
      <StatsRow>
        <StatCard>
          <StatInner>
            <StatLabel>Staking Rewards (Unclaimed)</StatLabel>
            <StatValue>{formatted.pendingRewards}</StatValue>
          </StatInner>
        </StatCard>
        <StatCard>
          <StatInner>
            <StatLabel>Unstaking Queue</StatLabel>
            <StatValue>{formatted.exitSlots}</StatValue>
          </StatInner>
        </StatCard>
        <StatCard>
          <StatInner>
            <StatLabel>Staking Period</StatLabel>
            <StatValue>{formatted.lockPeriodShort}</StatValue>
          </StatInner>
        </StatCard>
      </StatsRow>
    </StatsOuter>
  );
}
