'use client';

import { Alert, CircularProgress, Snackbar } from '@mui/material';
import InputAdornment from '@mui/material/InputAdornment';

import {
  AmountFieldWrap,
  BalanceCaption,
  BalanceRow,
  CtaButton,
  ErrorText,
  ExitQueueCount,
  ExitQueueHeader,
  ExitQueueSection,
  ExitQueueSubtitle,
  ExitQueueTableHead,
  ExitQueueTableRow,
  ExitQueueTdCell,
  ExitQueueThCell,
  ExitQueueTitle,
  FieldLabel,
  InputSuffix,
  InstantExitLabel,
  InstantExitRow,
  MaxLink,
  PanelCaptionLeft,
  PanelCard,
  PanelHeading,
  PanelSection,
  QueueCancelButton,
  QueueExitButton,
  QueueNotice,
  StatCard,
  StatInner,
  StatLabel,
  StatsOuter,
  StatsRow,
  StatusChip,
  StatValue,
  StyledAmountField,
  StyledCheckbox,
  TabBar,
  TabBarInner,
  TabContentColumn,
  TabItem,
} from '../k613Staking.styles';
import { useK613StakingPage } from '../K613StakingContext';

export function K613LockExitTab() {
  const {
    paused,
    lockExitSubTab,
    setLockExitSubTab,
    stakeAmount,
    setStakeAmount,
    exitAmount,
    setExitAmount,
    instantExitMode,
    setInstantExitMode,
    formatted,
    exitQueue,
    maxExitSlots,
    availableToUnstakeFormatted,
    lockDurationSeconds,
    actionPending,
    isApprovePending,
    error,
    earliestUnlockRemaining,
    penaltyPercent,
    instantExitRequiresDistributor,
    handleLock,
    handleInitiateExit,
    handleExit,
    handleCancelExit,
    setMaxStake,
    setMaxExit,
    isLockDurationPassed,
    formatUnlockCountdown,
    formatExitRequestId,
    formatTokenAmount,
    successMessage,
    setSuccessMessage,
  } = useK613StakingPage();

  const lockBusy = actionPending === 'lock' || isApprovePending;
  const initiateBusy = actionPending === 'initiateExit';
  const queueFull = exitQueue.length >= maxExitSlots;

  const lockParsedPositive =
    stakeAmount.trim() !== '' &&
    !Number.isNaN(parseFloat(stakeAmount)) &&
    parseFloat(stakeAmount) > 0;

  const exitParsedPositive =
    exitAmount.trim() !== '' && !Number.isNaN(parseFloat(exitAmount)) && parseFloat(exitAmount) > 0;

  return (
    <>
      {/* Lock & Exit stats: 2×2 grid */}
      <StatsOuter>
        <StatsRow>
          <StatCard>
            <StatInner>
              <StatLabel>Available to lock</StatLabel>
              <StatValue>{formatted.walletK613} K613</StatValue>
            </StatInner>
          </StatCard>
          <StatCard>
            <StatInner>
              <StatLabel>Locked</StatLabel>
              <StatValue>{formatted.stakedXk613} xK613</StatValue>
            </StatInner>
          </StatCard>
        </StatsRow>
        <StatsRow>
          <StatCard>
            <StatInner>
              <StatLabel>In exit queue</StatLabel>
              <StatValue>{formatted.lockedInExit} xK613</StatValue>
            </StatInner>
          </StatCard>
          <StatCard>
            <StatInner>
              <StatLabel>Next unlock</StatLabel>
              <StatValue>{earliestUnlockRemaining}</StatValue>
            </StatInner>
          </StatCard>
        </StatsRow>
      </StatsOuter>

      {/* Sub-tab bar */}
      <TabBar>
        <TabBarInner>
          <TabItem active={lockExitSubTab === 'lock'} onClick={() => setLockExitSubTab('lock')}>
            Lock
          </TabItem>
          <TabItem active={lockExitSubTab === 'exit'} onClick={() => setLockExitSubTab('exit')}>
            Exit
          </TabItem>
        </TabBarInner>
      </TabBar>

      <TabContentColumn>
        {/* ─── LOCK ─── */}
        {lockExitSubTab === 'lock' && (
          <PanelCard>
            <PanelSection>
              <PanelHeading>Lock</PanelHeading>
              <PanelCaptionLeft>Lock K613 and receive xK613 at a 1:1 ratio</PanelCaptionLeft>
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
              <BalanceRow>
                <BalanceCaption>
                  Available to lock: <strong>{formatted.walletK613} K613</strong>
                </BalanceCaption>
                <MaxLink type="button" disabled={paused} onClick={setMaxStake}>
                  MAX
                </MaxLink>
              </BalanceRow>
            </PanelSection>

            <CtaButton
              variant="contained"
              disabled={paused || !lockParsedPositive || lockBusy}
              onClick={handleLock}
            >
              {lockBusy ? <CircularProgress color="inherit" size={22} /> : 'Lock'}
            </CtaButton>

            {error && <ErrorText>{error}</ErrorText>}
          </PanelCard>
        )}

        {/* ─── EXIT ─── */}
        {lockExitSubTab === 'exit' && (
          <>
            <PanelCard>
              <PanelSection>
                <PanelHeading>Exit xK613</PanelHeading>
                <PanelCaptionLeft>
                  Request an exit, track its status, or withdraw instantly
                </PanelCaptionLeft>
              </PanelSection>

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
                          <InputSuffix>xK613</InputSuffix>
                        </InputAdornment>
                      ),
                    }}
                  />
                </AmountFieldWrap>
                <BalanceRow>
                  <BalanceCaption>
                    Available to exit: <strong>{availableToUnstakeFormatted} xK613</strong>
                  </BalanceCaption>
                  <MaxLink type="button" disabled={paused || queueFull} onClick={setMaxExit}>
                    MAX
                  </MaxLink>
                </BalanceRow>
              </PanelSection>

              <InstantExitRow
                onClick={() => {
                  if (!paused && !instantExitRequiresDistributor) {
                    setInstantExitMode(!instantExitMode);
                  }
                }}
              >
                <StyledCheckbox
                  checked={instantExitMode}
                  disabled={paused || instantExitRequiresDistributor}
                  onChange={(e) => setInstantExitMode(e.target.checked)}
                  onClick={(e) => e.stopPropagation()}
                />
                <InstantExitLabel>
                  Instant Exit
                  {instantExitMode && penaltyPercent !== '0.0' ? ` (${penaltyPercent}% fee)` : ''}
                </InstantExitLabel>
              </InstantExitRow>

              {instantExitRequiresDistributor && (
                <QueueNotice>
                  instant exit disabled until rewards distributor is configured
                </QueueNotice>
              )}

              {queueFull && <QueueNotice>queue full — cannot create request</QueueNotice>}

              <CtaButton
                variant="contained"
                disabled={paused || queueFull || !exitParsedPositive || initiateBusy}
                onClick={handleInitiateExit}
              >
                {initiateBusy ? (
                  <CircularProgress color="inherit" size={22} />
                ) : instantExitMode ? (
                  'Instant Exit'
                ) : (
                  'Request Exit'
                )}
              </CtaButton>

              {error && <ErrorText>{error}</ErrorText>}
            </PanelCard>

            {/* Exit queue table */}
            {exitQueue.length > 0 && (
              <ExitQueueSection>
                <ExitQueueHeader>
                  <ExitQueueTitle>Exit queue</ExitQueueTitle>
                  <ExitQueueCount>
                    {exitQueue.length}/{maxExitSlots}
                  </ExitQueueCount>
                </ExitQueueHeader>
                <ExitQueueSubtitle>Track your exit requests</ExitQueueSubtitle>

                <ExitQueueTableHead>
                  <ExitQueueThCell>Request ID</ExitQueueThCell>
                  <ExitQueueThCell>Amount</ExitQueueThCell>
                  <ExitQueueThCell>Time left</ExitQueueThCell>
                  <ExitQueueThCell>Status</ExitQueueThCell>
                  <ExitQueueThCell />
                </ExitQueueTableHead>

                {exitQueue.map((item, index) => {
                  const canExit = isLockDurationPassed(item.exitInitiatedAt);
                  const timer = canExit
                    ? 'Ready'
                    : formatUnlockCountdown(item.exitInitiatedAt, lockDurationSeconds);
                  const exitBusy = actionPending === `exit:${index}`;
                  const cancelBusy = actionPending === `cancel:${index}`;
                  const anyBusy = actionPending !== null;

                  return (
                    <ExitQueueTableRow key={`${item.exitInitiatedAt.toString()}-${index}`}>
                      <ExitQueueTdCell>{formatExitRequestId(index)}</ExitQueueTdCell>
                      <ExitQueueTdCell>{formatTokenAmount(item.amount)} xK613</ExitQueueTdCell>
                      <ExitQueueTdCell>{timer}</ExitQueueTdCell>
                      <ExitQueueTdCell>
                        <StatusChip ready={canExit}>{canExit ? 'Ready' : 'In queue'}</StatusChip>
                      </ExitQueueTdCell>
                      <ExitQueueTdCell>
                        {canExit ? (
                          <QueueExitButton
                            size="small"
                            disabled={paused || anyBusy}
                            onClick={() => handleExit(BigInt(index))}
                          >
                            {exitBusy ? <CircularProgress size={14} color="inherit" /> : 'Exit'}
                          </QueueExitButton>
                        ) : (
                          <QueueCancelButton
                            size="small"
                            disabled={paused || anyBusy}
                            onClick={() => handleCancelExit(BigInt(index))}
                          >
                            {cancelBusy ? (
                              <CircularProgress size={14} color="inherit" />
                            ) : (
                              'Cancel Request'
                            )}
                          </QueueCancelButton>
                        )}
                      </ExitQueueTdCell>
                    </ExitQueueTableRow>
                  );
                })}
              </ExitQueueSection>
            )}
          </>
        )}
      </TabContentColumn>

      <Snackbar
        open={!!successMessage}
        autoHideDuration={8000}
        onClose={() => setSuccessMessage(null)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert
          onClose={() => setSuccessMessage(null)}
          severity="success"
          variant="filled"
          sx={{ width: '100%' }}
        >
          {successMessage}
        </Alert>
      </Snackbar>
    </>
  );
}
