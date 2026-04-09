'use client';

import { CircularProgress } from '@mui/material';
import { SyntheticEvent, useEffect, useState } from 'react';
import { K613InfoDialog } from 'src/modules/k613-staking/K613InfoDialog';
import { K613OnboardingDialog } from 'src/modules/k613-staking/K613OnboardingDialog';
import {
  LoadingBox,
  MainTab,
  MainTabs,
  PageRoot,
  PanelShell,
  PausedBanner,
  TabSectionHeader,
  TabSectionSubtitle,
  TabSectionTitle,
} from 'src/modules/k613-staking/k613Staking.styles';
import { K613StakingProvider } from 'src/modules/k613-staking/K613StakingContext';
import { K613StakingFooter } from 'src/modules/k613-staking/K613StakingFooter';
import { K613LockExitTab } from 'src/modules/k613-staking/tabs/K613LockExitTab';
import { K613RewardPoolTab } from 'src/modules/k613-staking/tabs/K613RewardPoolTab';
import { useK613StakingController } from 'src/modules/k613-staking/useK613StakingController';

const K613_ONBOARDING_STORAGE_KEY = 'k613:onboardingSeen';

export function K613StakingPanel() {
  const [onboardingStep, setOnboardingStep] = useState<number | null>(null);
  const ctx = useK613StakingController();
  const {
    mainTab,
    setMainTab,
    gate,
    infoDialog,
    setInfoDialog,
    paused,
    isLoading,
    hasStakingActivity,
  } = ctx;

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

  const handleTabChange = (_: SyntheticEvent, newValue: number) => {
    setMainTab(newValue === 0 ? 'rewardPool' : 'lockExit');
  };

  const tabIndex = mainTab === 'rewardPool' ? 0 : 1;

  return (
    <PageRoot>
      <K613StakingProvider value={providerValue}>
        {isLoading ? (
          <LoadingBox>
            <CircularProgress size={32} />
          </LoadingBox>
        ) : (
          <PanelShell>
            {/* Top-level primary tabs */}
            <MainTabs value={tabIndex} onChange={handleTabChange}>
              <MainTab label="Reward Pool" />
              <MainTab label="Lock & Exit" />
            </MainTabs>

            {/* Per-tab section header */}
            {mainTab === 'rewardPool' && (
              <TabSectionHeader>
                <TabSectionTitle>Reward Pool</TabSectionTitle>
                <TabSectionSubtitle>
                  Deposit xK613 to earn rewards from the protocol
                </TabSectionSubtitle>
              </TabSectionHeader>
            )}
            {mainTab === 'lockExit' && (
              <TabSectionHeader>
                <TabSectionTitle>Lock &amp; Exit</TabSectionTitle>
                <TabSectionSubtitle>Convert K613 to xK613 and manage your exit</TabSectionSubtitle>
              </TabSectionHeader>
            )}

            {paused && <PausedBanner>Staking is paused</PausedBanner>}

            {mainTab === 'rewardPool' && <K613RewardPoolTab />}
            {mainTab === 'lockExit' && <K613LockExitTab />}
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
