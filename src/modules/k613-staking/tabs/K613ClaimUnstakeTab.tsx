'use client';

import { CircularProgress } from '@mui/material';
import InputAdornment from '@mui/material/InputAdornment';

import {
  AmountFieldWrap,
  BalanceCaption,
  BalanceRow,
  ClaimCol,
  ClaimTwoCol,
  CtaButton,
  CtaOutlined,
  ErrorText,
  ExitBadge,
  ExitCard,
  ExitCardHeader,
  ExitCellLabel,
  ExitCellValue,
  ExitGridFixed,
  ExitQueueCaption,
  ExitQueueHeading,
  ExitQueueSection,
  FieldLabel,
  InputSuffix,
  MaxLink,
  PanelCaptionLeft,
  PanelHeading,
  PanelSection,
  QueueNotice,
  RewardCard,
  RewardRow,
  SmallActionButton,
  StyledAmountField,
} from '../k613Staking.styles';
import { useK613StakingPage } from '../K613StakingContext';

export function K613ClaimUnstakeTab() {
  const {
    paused,
    exitAmount,
    setExitAmount,
    formatted,
    exitQueue,
    maxExitSlots,
    availableToUnstakeFormatted,
    lockDurationSeconds,
    actionPending,
    error,
    handleInitiateExit,
    handleExit,
    handleInstantExit,
    handleCancelExit,
    setMaxExit,
    isLockDurationPassed,
    formatUnlockCountdown,
    formatExitRequestId,
    formatTokenAmount,
    penaltyPercent,
  } = useK613StakingPage();

  const parsedPositive =
    exitAmount.trim() !== '' && !Number.isNaN(parseFloat(exitAmount)) && parseFloat(exitAmount) > 0;
  const queueFull = exitQueue.length >= maxExitSlots;
  const initiateBusy = actionPending === 'initiateExit';

  return (
    <>
      <ClaimTwoCol>
        <ClaimCol>
          <RewardCard>
            <PanelHeading>Claim Rewards</PanelHeading>
            <PanelCaptionLeft>
              Claim accrued rewards separately without affecting your staked position
            </PanelCaptionLeft>
            <RewardRow>
              <ExitCellLabel>Pending rewards</ExitCellLabel>
              <ExitCellValue>{formatted.pendingRewards}</ExitCellValue>
            </RewardRow>
            <RewardRow>
              <ExitCellLabel>Last accrual</ExitCellLabel>
              <ExitCellValue>—</ExitCellValue>
            </RewardRow>
            <CtaOutlined variant="outlined" disabled>
              claim rewards
            </CtaOutlined>
          </RewardCard>
        </ClaimCol>
        <ClaimCol>
          <RewardCard>
            <PanelHeading>Request Unstake</PanelHeading>
            <PanelCaptionLeft>
              Create an exit request. Tokens will move into the exit queue and unlock by request
              timer
            </PanelCaptionLeft>
            <PanelSection>
              <FieldLabel>Amount</FieldLabel>
              <AmountFieldWrap>
                <StyledAmountField
                  fullWidth
                  variant="outlined"
                  placeholder="0.00"
                  value={exitAmount}
                  disabled={paused || queueFull}
                  onChange={(e) => setExitAmount(e.target.value)}
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
              <BalanceCaption>Available balance: {availableToUnstakeFormatted} K613</BalanceCaption>
              <MaxLink type="button" disabled={paused || queueFull} onClick={setMaxExit}>
                MAX
              </MaxLink>
            </BalanceRow>
            <RewardRow>
              <ExitCellLabel>Exit queue slots used</ExitCellLabel>
              <ExitCellValue>
                {exitQueue.length} / {maxExitSlots}
              </ExitCellValue>
            </RewardRow>
            <RewardRow>
              <ExitCellLabel>Per-user request limit</ExitCellLabel>
              <ExitCellValue>Up to {maxExitSlots} active requests</ExitCellValue>
            </RewardRow>
            {queueFull && <QueueNotice>queue full - cannot create request</QueueNotice>}
            <CtaButton
              variant="contained"
              color="primary"
              disabled={paused || queueFull || !parsedPositive || initiateBusy}
              onClick={handleInitiateExit}
            >
              {initiateBusy ? <CircularProgress color="inherit" size={22} /> : 'request unstake'}
            </CtaButton>
          </RewardCard>
        </ClaimCol>
      </ClaimTwoCol>

      {exitQueue.length > 0 && (
        <ExitQueueSection>
          <ExitQueueHeading>Active Exit Queue</ExitQueueHeading>
          <ExitQueueCaption>
            Each request has its own timer. Up to {maxExitSlots} exit requests can stay active at
            the same time
          </ExitQueueCaption>
          <ExitBadge>{exitQueue.length} Active</ExitBadge>

          {exitQueue.map((item, index) => {
            const canExit = isLockDurationPassed(item.exitInitiatedAt);
            const countdown = formatUnlockCountdown(item.exitInitiatedAt, lockDurationSeconds);
            const busyExit = actionPending === `exit:${index}`;
            const busyInstant = actionPending === `instant:${index}`;
            const busyCancel = actionPending === `cancel:${index}`;

            return (
              <ExitCard key={`${item.exitInitiatedAt.toString()}-${index}`}>
                <ExitCardHeader>
                  <ExitCellValue>{formatExitRequestId(index)}</ExitCellValue>
                </ExitCardHeader>
                <ExitGridFixed>
                  <PanelSection>
                    <ExitCellLabel>Request ID</ExitCellLabel>
                    <ExitCellValue>{formatExitRequestId(index)}</ExitCellValue>
                  </PanelSection>
                  <PanelSection>
                    <ExitCellLabel>Amount</ExitCellLabel>
                    <ExitCellValue>{formatTokenAmount(item.amount)} xK613</ExitCellValue>
                  </PanelSection>
                  <PanelSection>
                    <ExitCellLabel>Unlocks in</ExitCellLabel>
                    <ExitCellValue>{canExit ? 'Ready' : countdown}</ExitCellValue>
                  </PanelSection>
                  <PanelSection>
                    <ExitCellLabel>Status</ExitCellLabel>
                    <ExitCellValue>{canExit ? 'Unlocked' : 'In queue'}</ExitCellValue>
                  </PanelSection>
                </ExitGridFixed>
                <RewardRow>
                  {canExit && (
                    <SmallActionButton
                      size="small"
                      variant="contained"
                      color="primary"
                      disabled={paused || actionPending !== null}
                      onClick={() => handleExit(BigInt(index))}
                    >
                      {busyExit ? <CircularProgress size={16} color="inherit" /> : 'Exit'}
                    </SmallActionButton>
                  )}
                  <SmallActionButton
                    size="small"
                    variant="outlined"
                    color="warning"
                    disabled={paused || actionPending !== null}
                    onClick={() => handleInstantExit(BigInt(index))}
                  >
                    {busyInstant ? (
                      <CircularProgress size={16} color="inherit" />
                    ) : (
                      `Instant (${penaltyPercent}% fee)`
                    )}
                  </SmallActionButton>
                  {!canExit && (
                    <SmallActionButton
                      size="small"
                      variant="text"
                      disabled={paused || actionPending !== null}
                      onClick={() => handleCancelExit(BigInt(index))}
                    >
                      {busyCancel ? <CircularProgress size={16} color="inherit" /> : 'cancel request'}
                    </SmallActionButton>
                  )}
                </RewardRow>
              </ExitCard>
            );
          })}
        </ExitQueueSection>
      )}

      {error && <ErrorText>{error}</ErrorText>}
    </>
  );
}
