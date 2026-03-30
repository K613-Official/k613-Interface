'use client';

import { CircularProgress } from '@mui/material';
import { useEffect, useState } from 'react';

import { K613InfoDialog } from './K613InfoDialog';
import { K613OnboardingDialog } from './K613OnboardingDialog';
import {
  LoadingBox,
  PageRoot,
  PanelShell,
  PausedBanner,
  TabContentColumn,
} from './k613Staking.styles';
import { K613StakingProvider } from './K613StakingContext';
import { K613StakingFooter } from './K613StakingFooter';
import { K613StakingHeader } from './K613StakingHeader';
import { K613StakingStatsGrid } from './K613StakingStatsGrid';
import { K613StakingTabBar } from './K613StakingTabBar';
import { K613ClaimUnstakeTab } from './tabs/K613ClaimUnstakeTab';
import { K613LockStakeTab } from './tabs/K613LockStakeTab';
import { K613ManageExitTab } from './tabs/K613ManageExitTab';
import { useK613StakingController } from './useK613StakingController';

const K613_ONBOARDING_STORAGE_KEY = 'k613:onboardingSeen';

export function K613StakingPanel() {
  const [onboardingStep, setOnboardingStep] = useState<number | null>(null);
  const ctx = useK613StakingController();
  const { mainTab, gate, infoDialog, setInfoDialog, paused, isLoading, hasStakingActivity } = ctx;

  useEffect(() => {
    if (isLoading || hasStakingActivity) return;
    if (typeof window === 'undefined') return;
    const seen = window.localStorage.getItem(K613_ONBOARDING_STORAGE_KEY) === '1';
    if (!seen) {
      setOnboardingStep(0);
    }
  }, [isLoading, hasStakingActivity]);

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
          <PanelShell>
            <K613StakingStatsGrid />
            {paused && <PausedBanner>Staking is paused</PausedBanner>}
            <TabContentColumn>
              <K613StakingTabBar />
              {mainTab === 'lockStake' && <K613LockStakeTab />}
              {mainTab === 'claimUnstake' && <K613ClaimUnstakeTab />}
              {mainTab === 'manageExit' && <K613ManageExitTab />}
            </TabContentColumn>
          </PanelShell>
        )}
        <K613StakingFooter />
      </K613StakingProvider>
      <K613OnboardingDialog
        open={onboardingStep !== null}
        step={onboardingStep ?? 0}
        onNext={() => {
          setOnboardingStep((prev) => {
            if (prev === null) return null;
            if (prev >= 2) {
              if (typeof window !== 'undefined') {
                window.localStorage.setItem(K613_ONBOARDING_STORAGE_KEY, '1');
              }
              return null;
            }
            return prev + 1;
          });
        }}
        onClose={() => {
          if (typeof window !== 'undefined') {
            window.localStorage.setItem(K613_ONBOARDING_STORAGE_KEY, '1');
          }
          setOnboardingStep(null);
        }}
      />
      <K613InfoDialog open={!!infoDialog} kind={infoDialog} onClose={() => setInfoDialog(null)} />
    </PageRoot>
  );
}
