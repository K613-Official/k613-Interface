'use client';

import {
  StatCard,
  StatCardWide,
  StatInner,
  StatLabel,
  StatsOuter,
  StatsRow,
  StatValue,
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
            <StatLabel>Available K613</StatLabel>
            <StatValue>{formatted.walletK613}</StatValue>
          </StatInner>
        </StatCard>
        <StatCard>
          <StatInner>
            <StatLabel>Locked K613</StatLabel>
            <StatValue>{formatted.lockedInExit}</StatValue>
          </StatInner>
        </StatCard>
        <StatCard>
          <StatInner>
            <StatLabel>Staked xK613</StatLabel>
            <StatValue>{formatted.stakedXk613}</StatValue>
          </StatInner>
        </StatCard>
      </StatsRow>
      <StatsRow>
        <StatCard>
          <StatInner>
            <StatLabel>Pending Rewards</StatLabel>
            <StatValue>{formatted.pendingRewards}</StatValue>
          </StatInner>
        </StatCard>
        <StatCardWide>
          <StatInner>
            <StatLabel>Active Exit Requests</StatLabel>
            <StatValue>{formatted.exitSlots}</StatValue>
          </StatInner>
        </StatCardWide>
        <StatCard>
          <StatInner>
            <StatLabel>Lock Period</StatLabel>
            <StatValue>{formatted.lockPeriodShort}</StatValue>
          </StatInner>
        </StatCard>
      </StatsRow>
    </StatsOuter>
  );
}
