'use client';

import { Button } from '@mui/material';

import {
  DialogActionsStyled,
  DialogBodyStyled,
  DialogTitleStyled,
  OnboardingBodyText,
  OnboardingCaption,
  OnboardingHead,
  OnboardingHeadingText,
  OnboardingStepPill,
  OnboardingStepRow,
  OnboardingTitle,
  StyledDialog,
} from './k613Staking.styles';

const SLIDES = [
  {
    title: 'Stake',
    heading: 'Deposit K613 and receive xK613',
    body: 'Enter the amount of K613 you want to stake and confirm the transaction. Your tokens are locked in the protocol, and you immediately receive xK613 at a 1:1 ratio.',
    caption:
      'xK613 represents your share in the staking pool. To activate rewards, send xK613 to the reward pool and confirm the transaction.',
    cta: 'continue',
  },
  {
    title: 'Earn',
    heading: 'Earn automatically from protocol activity',
    body: 'Once xK613 is in the reward pool, you start earning. Income from protocol fees is distributed automatically among all xK613 holders.',
    caption:
      'No manual actions are required - rewards accumulate over time. Yield is not fixed and depends on overall activity in the protocol.',
    cta: 'continue',
  },
  {
    title: 'Unstake',
    heading: 'Withdraw your funds anytime',
    body: 'You can exit staking in two ways depending on your priority.',
    caption: 'Choose between maximum profit or instant liquidity',
    cta: 'Start staking',
  },
] as const;

export function K613OnboardingDialog({
  open,
  step,
  onNext,
  onClose,
}: {
  open: boolean;
  step: number;
  onNext: () => void;
  onClose: () => void;
}) {
  if (!open) return null;
  const slide = SLIDES[Math.max(0, Math.min(step, SLIDES.length - 1))];

  return (
    <StyledDialog open={open} onClose={onClose} fullWidth>
      <DialogTitleStyled>
        <OnboardingHead>
          <OnboardingTitle>{slide.title}</OnboardingTitle>
        </OnboardingHead>
      </DialogTitleStyled>
      <DialogBodyStyled>
        <OnboardingStepRow>
          {SLIDES.map((_, index) => (
            <OnboardingStepPill key={index} active={index === step} />
          ))}
        </OnboardingStepRow>
        <OnboardingHeadingText>{slide.heading}</OnboardingHeadingText>
        <OnboardingBodyText>{slide.body}</OnboardingBodyText>
        <OnboardingCaption>{slide.caption}</OnboardingCaption>
      </DialogBodyStyled>
      <DialogActionsStyled>
        <Button variant="contained" color="primary" fullWidth onClick={onNext}>
          {slide.cta}
        </Button>
      </DialogActionsStyled>
    </StyledDialog>
  );
}
