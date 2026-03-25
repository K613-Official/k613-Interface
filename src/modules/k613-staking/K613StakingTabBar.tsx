'use client';

import { TabBar, TabBarInner, TabItem } from './k613Staking.styles';
import { useK613StakingPage } from './K613StakingContext';

export function K613StakingTabBar() {
  const { mainTab, setMainTab } = useK613StakingPage();

  return (
    <TabBar>
      <TabBarInner>
        <TabItem active={mainTab === 'lockStake'} onClick={() => setMainTab('lockStake')}>
          Lock &amp; Stake
        </TabItem>
        <TabItem active={mainTab === 'claimUnstake'} onClick={() => setMainTab('claimUnstake')}>
          Claim &amp; unstake
        </TabItem>
        <TabItem active={mainTab === 'manageExit'} onClick={() => setMainTab('manageExit')}>
          manage exit
        </TabItem>
      </TabBarInner>
    </TabBar>
  );
}
