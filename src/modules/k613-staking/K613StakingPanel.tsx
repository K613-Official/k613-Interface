'use client';

import { CircularProgress } from '@mui/material';
import { useEffect } from 'react';

import { K613InfoDialog } from './K613InfoDialog';
import { LoadingBox, PageRoot, PausedBanner, TabContentColumn } from './k613Staking.styles';
import { K613StakingProvider } from './K613StakingContext';
import { K613StakingFooter } from './K613StakingFooter';
import { K613StakingHeader } from './K613StakingHeader';
import { K613StakingStatsGrid } from './K613StakingStatsGrid';
import { K613StakingTabBar } from './K613StakingTabBar';
import { K613ClaimUnstakeTab } from './tabs/K613ClaimUnstakeTab';
import { K613LockStakeTab } from './tabs/K613LockStakeTab';
import { K613ManageExitTab } from './tabs/K613ManageExitTab';
import { useK613StakingController } from './useK613StakingController';

export function K613StakingPanel() {
  const ctx = useK613StakingController();
  const { mainTab, resetLockFlow, gate, infoDialog, setInfoDialog, paused, isLoading } = ctx;

  useEffect(() => {
    if (mainTab !== 'lockStake') {
      resetLockFlow();
    }
  }, [mainTab, resetLockFlow]);

  if (gate) {
    return <PageRoot>{gate}</PageRoot>;
  }

  const { gate: _gateHandled, ...providerValue } = ctx;
  void _gateHandled;

  return (
    <PageRoot>
      <K613StakingProvider value={providerValue}>
        <K613StakingHeader />
        {isLoading ? (
          <LoadingBox>
            <CircularProgress size={32} />
          </LoadingBox>
        ) : (
          <>
            <K613StakingStatsGrid />
            {paused && <PausedBanner>Staking is paused</PausedBanner>}
            <TabContentColumn>
              <K613StakingTabBar />
              {mainTab === 'lockStake' && <K613LockStakeTab />}
              {mainTab === 'claimUnstake' && <K613ClaimUnstakeTab />}
              {mainTab === 'manageExit' && <K613ManageExitTab />}
            </TabContentColumn>
          </>
        )}
        <K613StakingFooter />
      </K613StakingProvider>
      <K613InfoDialog open={!!infoDialog} kind={infoDialog} onClose={() => setInfoDialog(null)} />
    </PageRoot>
  );
}
