'use client';

import { Alert, CircularProgress, Snackbar } from '@mui/material';
import InputAdornment from '@mui/material/InputAdornment';
import { formatPercentValue } from 'src/utils/formatNumber';

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
  PanelSection,
  QueueNotice,
  RewardStatCard,
  RewardStatLabel,
  RewardStatsRow,
  RewardStatValue,
  StatCard,
  StatInner,
  StatLabel,
  StatsCaption,
  StatsOuter,
  StatsRow,
  StatValue,
  StyledAmountField,
  TabBar,
  TabBarInner,
  TabContentColumn,
  TabItem,
} from '../k613Staking.styles';
import { useK613StakingPage } from '../K613StakingContext';
import { K613UsdCaption } from '../K613UsdCaption';

export function K613RewardPoolTab() {
  const {
    paused,
    rewardPoolSubTab,
    setRewardPoolSubTab,
    formatted,
    depositAmount,
    setDepositAmount,
    withdrawAmount,
    setWithdrawAmount,
    actionPending,
    isClaimPending,
    error,
    pendingRewardsAmount,
    protocolTVL,
    totalPoolDeposits,
    displayApy,
    handleClaimRewards,
    handleDeposit,
    handleWithdraw,
    setMaxDeposit,
    setMaxWithdraw,
    successMessage,
    setSuccessMessage,
  } = useK613StakingPage();

  const claimBusy = isClaimPending || actionPending === 'claimRewards:claim';
  // Weekly epochs, so the compounded figure is the APR re-deposited 52 times a year.
  const EPOCHS_PER_YEAR = 52;
  const apyLabel =
    displayApy === '—'
      ? '—'
      : formatPercentValue(
          (Math.pow(1 + Number(displayApy) / 100 / EPOCHS_PER_YEAR, EPOCHS_PER_YEAR) - 1) * 100
        );

  const claimButtonLabel =
    actionPending === 'claimRewards:claim' ? 'Confirm in wallet' : 'Claim rewards';
  const onClaimClick = handleClaimRewards;
  const depositBusy = actionPending === 'deposit';
  const withdrawBusy = actionPending === 'withdraw';

  const depositParsedPositive =
    depositAmount.trim() !== '' &&
    !Number.isNaN(parseFloat(depositAmount)) &&
    parseFloat(depositAmount) > 0;

  const withdrawParsedPositive =
    withdrawAmount.trim() !== '' &&
    !Number.isNaN(parseFloat(withdrawAmount)) &&
    parseFloat(withdrawAmount) > 0;

  return (
    <>
      {/* Pool-level stats */}
      <StatsOuter>
        <StatsRow>
          <StatCard>
            <StatInner>
              {/* Named for what it is: everything locked in staking, the pool is a subset of it. */}
              <StatLabel>TVL (locked in staking)</StatLabel>
              <StatValue>{formatted.protocolTVL} K613</StatValue>
              <BalanceCaption>Backs the whole xK613 supply 1:1</BalanceCaption>
              <K613UsdCaption amount={protocolTVL} />
            </StatInner>
          </StatCard>
          <StatCard>
            <StatInner>
              <StatLabel>Total deposited (reward pool)</StatLabel>
              <StatValue>{formatted.totalPoolDeposits} xK613</StatValue>
              <K613UsdCaption amount={totalPoolDeposits} />
            </StatInner>
          </StatCard>
          <StatCard>
            <StatInner>
              {/* Owed to depositors, not "left in the contract": claiming must not move this. */}
              <StatLabel>Rewards next epoch</StatLabel>
              <StatValue>{formatted.queuedForNextEpoch} xK613</StatValue>
              <BalanceCaption>Buybacks + instant-exit penalties</BalanceCaption>
            </StatInner>
          </StatCard>
        </StatsRow>
        <StatsCaption>Rewards accrue over time based on pool activity</StatsCaption>
      </StatsOuter>

      {/* Sub-tab bar */}
      <TabBar>
        <TabBarInner>
          <TabItem
            active={rewardPoolSubTab === 'claimRewards'}
            onClick={() => setRewardPoolSubTab('claimRewards')}
          >
            Claim Rewards
          </TabItem>
          <TabItem
            active={rewardPoolSubTab === 'deposit'}
            onClick={() => setRewardPoolSubTab('deposit')}
          >
            Deposit
          </TabItem>
          <TabItem
            active={rewardPoolSubTab === 'withdraw'}
            onClick={() => setRewardPoolSubTab('withdraw')}
          >
            Withdraw
          </TabItem>
        </TabBarInner>
      </TabBar>

      <TabContentColumn>
        {/* ─── CLAIM REWARDS ─── */}
        {rewardPoolSubTab === 'claimRewards' && (
          <PanelCard>
            <PanelSection>
              <PanelHeading>Rewards and Stats</PanelHeading>
              <PanelCaptionLeft>Track rewards and performance in the reward pool</PanelCaptionLeft>
            </PanelSection>

            <RewardStatsRow>
              <RewardStatCard>
                <RewardStatLabel>Available rewards</RewardStatLabel>
                <RewardStatValue>{formatted.pendingRewards} xK613</RewardStatValue>
                <K613UsdCaption amount={pendingRewardsAmount} />
              </RewardStatCard>
              <RewardStatCard>
                <RewardStatLabel>APR / APY</RewardStatLabel>
                <RewardStatValue>
                  {displayApy !== '—' ? `${formatPercentValue(displayApy)} / ${apyLabel}` : '—'}
                </RewardStatValue>
              </RewardStatCard>
            </RewardStatsRow>

            <PanelSection>
              {displayApy === '—' && (
                <BalanceCaption>APR appears after several buyback cycles</BalanceCaption>
              )}
            </PanelSection>

            <CtaButton
              variant="contained"
              disabled={paused || claimBusy || pendingRewardsAmount <= 0n}
              onClick={onClaimClick}
            >
              {claimBusy ? <CircularProgress color="inherit" size={22} /> : claimButtonLabel}
            </CtaButton>

            {error && <ErrorText>{error}</ErrorText>}
          </PanelCard>
        )}

        {/* ─── DEPOSIT ─── */}
        {rewardPoolSubTab === 'deposit' && (
          <PanelCard>
            <PanelSection>
              <PanelHeading>Deposit xK613</PanelHeading>
              <PanelCaptionLeft>
                Deposit xK613 into the reward pool to start earning rewards
              </PanelCaptionLeft>
            </PanelSection>

            <PanelSection>
              <FieldLabel>Amount</FieldLabel>
              <AmountFieldWrap>
                <StyledAmountField
                  fullWidth
                  variant="outlined"
                  placeholder="0.00"
                  value={depositAmount}
                  disabled={paused}
                  onChange={(e) => setDepositAmount(e.target.value)}
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
                  Available to deposit: <strong>{formatted.stakedXk613} xK613</strong>
                </BalanceCaption>
                <MaxLink type="button" disabled={paused} onClick={setMaxDeposit}>
                  MAX
                </MaxLink>
              </BalanceRow>
            </PanelSection>

            <CtaButton
              variant="contained"
              disabled={paused || !depositParsedPositive || depositBusy}
              onClick={handleDeposit}
            >
              {depositBusy ? <CircularProgress color="inherit" size={22} /> : 'Deposit'}
            </CtaButton>

            {paused && <QueueNotice>deposits are paused</QueueNotice>}
            {error && <ErrorText>{error}</ErrorText>}
          </PanelCard>
        )}

        {/* ─── WITHDRAW ─── */}
        {rewardPoolSubTab === 'withdraw' && (
          <PanelCard>
            <PanelSection>
              <PanelHeading>Withdraw xK613</PanelHeading>
              <PanelCaptionLeft>
                Withdraw your xK613 from the reward pool at any time
              </PanelCaptionLeft>
            </PanelSection>

            <PanelSection>
              <FieldLabel>Amount</FieldLabel>
              <AmountFieldWrap>
                <StyledAmountField
                  fullWidth
                  variant="outlined"
                  placeholder="0.00"
                  value={withdrawAmount}
                  disabled={paused}
                  onChange={(e) => setWithdrawAmount(e.target.value)}
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
                  Available to withdraw: <strong>{formatted.userPoolBalance} xK613</strong>
                </BalanceCaption>
                <MaxLink type="button" disabled={paused} onClick={setMaxWithdraw}>
                  MAX
                </MaxLink>
              </BalanceRow>
            </PanelSection>

            <CtaButton
              variant="contained"
              disabled={paused || !withdrawParsedPositive || withdrawBusy}
              onClick={handleWithdraw}
            >
              {withdrawBusy ? <CircularProgress color="inherit" size={22} /> : 'Withdraw'}
            </CtaButton>

            {error && <ErrorText>{error}</ErrorText>}
          </PanelCard>
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
