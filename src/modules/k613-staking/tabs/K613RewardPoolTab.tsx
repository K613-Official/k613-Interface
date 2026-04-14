'use client';

import { Alert, CircularProgress, Snackbar } from '@mui/material';
import InputAdornment from '@mui/material/InputAdornment';

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
    claimAmount,
    setClaimAmount,
    actionPending,
    isClaimPending,
    error,
    pendingRewardsAmount,
    displayApy,
    handleClaimRewards,
    handleDeposit,
    handleWithdraw,
    setMaxDeposit,
    setMaxWithdraw,
    setMaxClaim,
    successMessage,
    setSuccessMessage,
  } = useK613StakingPage();

  const claimBusy = actionPending === 'claimRewards' || isClaimPending;
  const depositBusy = actionPending === 'deposit';
  const withdrawBusy = actionPending === 'withdraw';

  const claimParsedPositive =
    claimAmount.trim() !== '' &&
    !Number.isNaN(parseFloat(claimAmount)) &&
    parseFloat(claimAmount) > 0;

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
              <StatLabel>TVL</StatLabel>
              <StatValue>{formatted.protocolTVL} K613</StatValue>
            </StatInner>
          </StatCard>
          <StatCard>
            <StatInner>
              <StatLabel>Total deposited</StatLabel>
              <StatValue>{formatted.totalPoolDeposits} xK613</StatValue>
            </StatInner>
          </StatCard>
          <StatCard>
            <StatInner>
              <StatLabel>Total Rewards</StatLabel>
              <StatValue>{formatted.poolPendingRewards} K613</StatValue>
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
              </RewardStatCard>
              <RewardStatCard>
                <RewardStatLabel>APR</RewardStatLabel>
                <RewardStatValue>{displayApy !== '—' ? `${displayApy}%` : '—'}</RewardStatValue>
              </RewardStatCard>
            </RewardStatsRow>

            <PanelSection>
              <FieldLabel>Amount</FieldLabel>
              <AmountFieldWrap>
                <StyledAmountField
                  fullWidth
                  variant="outlined"
                  placeholder="0.00"
                  value={claimAmount}
                  disabled={paused || pendingRewardsAmount <= 0n}
                  onChange={(e) => setClaimAmount(e.target.value)}
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
                  Available to claim: <strong>{formatted.pendingRewards} xK613</strong>
                </BalanceCaption>
                <MaxLink
                  type="button"
                  disabled={paused || pendingRewardsAmount <= 0n}
                  onClick={setMaxClaim}
                >
                  MAX
                </MaxLink>
              </BalanceRow>
            </PanelSection>

            <CtaButton
              variant="contained"
              disabled={paused || claimBusy || !claimParsedPositive || pendingRewardsAmount <= 0n}
              onClick={handleClaimRewards}
            >
              {claimBusy ? <CircularProgress color="inherit" size={22} /> : 'Claim rewards'}
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
