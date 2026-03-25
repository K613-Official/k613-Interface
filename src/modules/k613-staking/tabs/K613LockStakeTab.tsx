'use client';

import { CircularProgress } from '@mui/material';
import InputAdornment from '@mui/material/InputAdornment';
import { parseUnits } from 'viem';
import { formatLockPeriodMonths } from 'src/hooks/useK613Staking';

import {
  BalanceCaption,
  BalanceRow,
  CtaButton,
  CtaOutlined,
  ErrorText,
  FieldLabel,
  InputSuffix,
  MaxLink,
  MiniStatsRow,
  PanelCaptionLeft,
  PanelCard,
  PanelHeading,
  PanelSection,
  SendPanel,
  StatCard,
  StatInner,
  StatLabel,
  StatValue,
  StatValueAccent,
  StepCaption,
  StepCircle,
  StepRow,
  StepStrip,
  StepTextCol,
  StepTitle,
  StyledAmountField,
  SuccessBanner,
  SuccessSubtitle,
  SuccessTitle,
  AmountFieldWrap,
} from '../k613Staking.styles';
import { useK613StakingPage } from '../K613StakingContext';

function safeFormatStakeAmount(raw: string, fmt: (a: bigint) => string): string {
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
    lockPhase,
    formatted,
    displayApy,
    lockDurationSeconds,
    actionPending,
    isApprovePending,
    error,
    handleLockTokens,
    handleSendToStaking,
    setMaxStake,
    formatTokenAmount,
  } = useK613StakingPage();

  const prepared = lockPhase === 'tokensPrepared';
  const lockBusy = actionPending === 'lock' || isApprovePending;
  const stakeBusy = actionPending === 'stake';
  const parsedPositive =
    stakeAmount.trim() !== '' && !Number.isNaN(parseFloat(stakeAmount)) && parseFloat(stakeAmount) > 0;

  const lockedDisplay = safeFormatStakeAmount(stakeAmount, formatTokenAmount);

  return (
    <>
      <StepStrip>
        <StepRow>
          <StepCircle active>{1}</StepCircle>
          <StepTextCol>
            <StepTitle>Lock Tokens</StepTitle>
            <StepCaption>Lock tokens first to prepare them for staking</StepCaption>
          </StepTextCol>
        </StepRow>
        <StepRow>
          <StepCircle active={prepared}>{2}</StepCircle>
          <StepTextCol>
            <StepTitle>Send to Staking</StepTitle>
            <StepCaption>Activate staking to start earning rewards</StepCaption>
          </StepTextCol>
        </StepRow>
      </StepStrip>

      <PanelCard>
        <PanelSection>
          <PanelHeading>Lock K613</PanelHeading>
          <PanelCaptionLeft>
            Lock tokens first, then send them to staking to activate rewards
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
              disabled={paused || prepared}
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
          <MaxLink type="button" disabled={paused || prepared} onClick={setMaxStake}>
            MAX
          </MaxLink>
        </BalanceRow>

        {!prepared && (
          <CtaOutlined
            variant="outlined"
            disabled={paused || !parsedPositive || lockBusy || stakeBusy}
            onClick={handleLockTokens}
          >
            {lockBusy ? <CircularProgress color="inherit" size={22} /> : 'lock tokens'}
          </CtaOutlined>
        )}

        {prepared && (
          <SuccessBanner>
            <div>
              <SuccessTitle>Tokens locked successfully</SuccessTitle>
              <SuccessSubtitle>
                Send locked tokens to staking to start earning rewards
              </SuccessSubtitle>
            </div>
          </SuccessBanner>
        )}

        {error && <ErrorText>{error}</ErrorText>}
      </PanelCard>

      <SendPanel>
        <PanelSection>
          <PanelHeading>Send to Staking</PanelHeading>
          <PanelCaptionLeft>
            Move locked tokens into staking. Rewards will start accruing after activation
          </PanelCaptionLeft>
        </PanelSection>

        <MiniStatsRow>
          <StatCard>
            <StatInner>
              <StatLabel>Locked amount</StatLabel>
              <StatValue>{lockedDisplay} K613</StatValue>
            </StatInner>
          </StatCard>
          <StatCard>
            <StatInner>
              <StatLabel>Lock period</StatLabel>
              <StatValue>{formatLockPeriodMonths(lockDurationSeconds)}</StatValue>
            </StatInner>
          </StatCard>
          <StatCard>
            <StatInner>
              <StatLabel>Estimated APY</StatLabel>
              <StatValueAccent>{displayApy}</StatValueAccent>
            </StatInner>
          </StatCard>
        </MiniStatsRow>

        <CtaButton
          variant="contained"
          color="primary"
          disabled={paused || !prepared || !parsedPositive || stakeBusy || lockBusy}
          onClick={handleSendToStaking}
        >
          {stakeBusy ? <CircularProgress color="inherit" size={22} /> : 'send to staking'}
        </CtaButton>
      </SendPanel>
    </>
  );
}
