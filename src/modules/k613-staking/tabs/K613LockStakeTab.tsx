'use client';

import { CircularProgress } from '@mui/material';
import InputAdornment from '@mui/material/InputAdornment';
import { formatLockPeriodMonths } from 'src/hooks/useK613Staking';
import { parseUnits } from 'viem';

import {
  AmountFieldWrap,
  BalanceCaption,
  BalanceRow,
  CtaButton,
  ErrorText,
  ExitCellLabel,
  ExitCellValue,
  FieldLabel,
  InputSuffix,
  MaxLink,
  PanelCaptionLeft,
  PanelCard,
  PanelHeading,
  PanelSection,
  RewardRow,
  StyledAmountField,
} from '../k613Staking.styles';
import { useK613StakingPage } from '../K613StakingContext';

function safeFormatAmount(raw: string, fmt: (a: bigint) => string): string {
  try {
    return fmt(parseUnits(raw || '0', 18));
  } catch {
    return '0';
  }
}

export function K613LockStakeTab() {
  const {
    paused,
    stakeAmount,
    setStakeAmount,
    formatted,
    lockDurationSeconds,
    actionPending,
    isApprovePending,
    error,
    handleSendToStaking,
    setMaxStake,
    formatTokenAmount,
  } = useK613StakingPage();

  const stakeBusy = actionPending === 'stake' || isApprovePending;
  const parsedPositive =
    stakeAmount.trim() !== '' &&
    !Number.isNaN(parseFloat(stakeAmount)) &&
    parseFloat(stakeAmount) > 0;
  const amountDisplay = safeFormatAmount(stakeAmount, formatTokenAmount);

  return (
    <PanelCard>
      <PanelSection>
        <PanelHeading>Send to Staking</PanelHeading>
        <PanelCaptionLeft>
          Move locked tokens into staking. Rewards will start accruing after activation
        </PanelCaptionLeft>
      </PanelSection>

      <PanelSection>
        <FieldLabel>Amount</FieldLabel>
        <AmountFieldWrap>
          <StyledAmountField
            fullWidth
            variant="outlined"
            placeholder="0.00"
            value={stakeAmount}
            disabled={paused}
            onChange={(e) => setStakeAmount(e.target.value)}
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <InputSuffix>K613</InputSuffix>
                </InputAdornment>
              ),
            }}
          />
        </AmountFieldWrap>
      </PanelSection>

      <BalanceRow>
        <BalanceCaption>Available balance: {formatted.walletK613} K613</BalanceCaption>
        <MaxLink type="button" disabled={paused} onClick={setMaxStake}>
          MAX
        </MaxLink>
      </BalanceRow>

      <RewardRow>
        <ExitCellLabel>Locked for Staking</ExitCellLabel>
        <ExitCellValue>{amountDisplay} K613</ExitCellValue>
      </RewardRow>
      <RewardRow>
        <ExitCellLabel>Staking Period</ExitCellLabel>
        <ExitCellValue>{formatLockPeriodMonths(lockDurationSeconds)}</ExitCellValue>
      </RewardRow>

      <CtaButton
        variant="contained"
        color="primary"
        disabled={paused || !parsedPositive || stakeBusy}
        onClick={handleSendToStaking}
      >
        {stakeBusy ? <CircularProgress color="inherit" size={22} /> : 'send to staking'}
      </CtaButton>

      {error && <ErrorText>{error}</ErrorText>}
    </PanelCard>
  );
}
