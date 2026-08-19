'use client';

import { Alert, CircularProgress, Snackbar } from '@mui/material';
import InputAdornment from '@mui/material/InputAdornment';
import { useMemo } from 'react';
import { AddTokenToWalletButton } from 'src/components/AddTokenToWallet';
import { K613_TOKEN_META, XK613_TOKEN_META } from 'src/const/k613Tokens';

import { BuyOnUniswapButton } from '../BuyOnUniswapButton';
import { ExitQueueTable } from '../ExitQueueTable';
import { K613MigrationBlock } from '../K613MigrationBlock';
import {
  AmountFieldWrap,
  BalanceCaption,
  BalanceRow,
  CtaButton,
  ErrorText,
  FieldLabel,
  InputSuffix,
  MaxLink,
  PanelCaptionLeft,
  PanelCard,
  PanelHeading,
  PanelNote,
  PanelSection,
  QueueNotice,
  StatCard,
  StatInner,
  StatLabel,
  StatsOuter,
  StatsRow,
  StatValue,
  StyledAmountField,
  TabBar,
  TabBarInner,
  TabContentColumn,
  TabItem,
  WarningNote,
} from '../k613Staking.styles';
import { useK613StakingPage } from '../K613StakingContext';
import { K613UsdCaption } from '../K613UsdCaption';

export function K613LockExitTab() {
  const {
    paused,
    lockExitSubTab,
    setLockExitSubTab,
    stakeAmount,
    setStakeAmount,
    exitAmount,
    setExitAmount,
    formatted,
    exitQueue,
    maxExitSlots,
    walletK613,
    availableToExit,
    needsPoolWithdrawal,
    globalExitQueue,
    globalQueuedFormatted,
    lockDurationSeconds,
    lockPeriodLabel,
    actionPending,
    isApprovePending,
    error,
    penaltyPercent,
    instantExitRequiresDistributor,
    handleLock,
    handleInitiateExit,
    handleExit,
    handleInstantExit,
    handleCancelExit,
    setMaxStake,
    setMaxExit,
    formatTokenAmount,
    successMessage,
    setSuccessMessage,
    k613Address,
    xk613Address,
  } = useK613StakingPage();

  const k613Token = useMemo(
    () => (k613Address ? { address: k613Address, ...K613_TOKEN_META } : null),
    [k613Address]
  );
  const xk613Token = useMemo(
    () => (xk613Address ? { address: xk613Address, ...XK613_TOKEN_META } : null),
    [xk613Address]
  );

  const lockBusy = actionPending === 'lock' || isApprovePending;
  const initiateBusy = actionPending === 'initiateExit';
  const queueFull = maxExitSlots !== null && exitQueue.length >= maxExitSlots;

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
              <K613UsdCaption amount={walletK613} />
              {/* Nothing to lock yet — point at the pool instead of at the wallet import. */}
              {walletK613 > 0n ? (
                <AddTokenToWalletButton token={k613Token} sx={{ mt: 0.5, ml: -1 }} />
              ) : (
                <BuyOnUniswapButton sx={{ mt: 0.5, ml: -1 }} />
              )}
            </StatInner>
          </StatCard>
          <StatCard>
            <StatInner>
              <StatLabel>Available to exit</StatLabel>
              <StatValue>{formatted.availableToExit} xK613</StatValue>
              <K613UsdCaption amount={availableToExit} />
              <AddTokenToWalletButton token={xk613Token} sx={{ mt: 0.5, ml: -1 }} />
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
              {/* Named "your" on purpose: this is wallet + own queue, not a protocol total. */}
              <StatLabel>Your total</StatLabel>
              <StatValue>{formatted.totalInSystem} xK613</StatValue>
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
                  Exiting takes two steps: submit a request first, then either wait out the lock and
                  press Exit, or use Instant exit on that request. There is no way to exit instantly
                  without submitting a request first.
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
                    Available to exit: <strong>{formatted.availableToExit} xK613</strong>
                  </BalanceCaption>
                  <MaxLink
                    type="button"
                    disabled={paused || queueFull || availableToExit <= 0n}
                    onClick={setMaxExit}
                  >
                    MAX
                  </MaxLink>
                </BalanceRow>
              </PanelSection>

              <PanelSection>
                <WarningNote>
                  {`xK613 will be locked for ${lockPeriodLabel}. Exiting early forfeits ${penaltyPercent}% of the amount, which goes to the reward pool and is shared among its participants.`}
                </WarningNote>
                {needsPoolWithdrawal && (
                  <PanelNote>To exit, first withdraw your xK613 from the Rewards Pool.</PanelNote>
                )}
              </PanelSection>

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
                {initiateBusy ? <CircularProgress color="inherit" size={22} /> : 'Initiate exit'}
              </CtaButton>

              {error && <ErrorText>{error}</ErrorText>}
            </PanelCard>

            <ExitQueueTable
              title="Your exit queue"
              subtitle="Wait out the lock and press Exit, or take the penalty and leave now"
              rows={exitQueue}
              countLabel={`${exitQueue.length}/${maxExitSlots ?? '—'} yours`}
              lockDurationSeconds={lockDurationSeconds}
              penaltyPercent={penaltyPercent}
              disabled={paused}
              actionPending={actionPending}
              keyPrefix="v2"
              formatTokenAmount={formatTokenAmount}
              onExit={handleExit}
              onInstantExit={handleInstantExit}
              onCancel={handleCancelExit}
            />

            {globalExitQueue.error ? (
              <QueueNotice>
                protocol-wide queue unavailable — the RPC endpoint refused the log scan
              </QueueNotice>
            ) : globalExitQueue.isLoading ? (
              <QueueNotice>loading the protocol-wide queue…</QueueNotice>
            ) : (
              <ExitQueueTable
                title="All exit requests"
                subtitle="Every open request across all users, newest first"
                rows={globalExitQueue.rows}
                countLabel={`${globalExitQueue.rows.length} active · ${globalQueuedFormatted} xK613`}
                lockDurationSeconds={lockDurationSeconds}
                actionPending={null}
                keyPrefix="global"
                formatTokenAmount={formatTokenAmount}
              />
            )}

            <K613MigrationBlock />
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
