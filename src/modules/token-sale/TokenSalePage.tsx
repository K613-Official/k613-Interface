import { Alert, Snackbar } from '@mui/material';
import { ConnectKitButton } from 'connectkit';
import { useEffect, useRef, useState } from 'react';
import { useAccount } from 'wagmi';

import { DepositDialog } from './components/DepositDialog';
import { RiskDisclaimer } from './components/RiskDisclaimer';
import { SaleFaq } from './components/SaleFaq';
import { SaleStagesTimeline } from './components/SaleStagesTimeline';
import { SaleStatsPanel } from './components/SaleStatsPanel';
import { UserDashboard } from './components/UserDashboard';
import {
  formatUsdc,
  getCurrentStage,
  HARD_CAP_USDC,
  STAGE_LABELS,
  TOKEN_PRICE_USD,
} from './constants';
import { useSaleActions } from './hooks/useSaleActions';
import { useSaleData } from './hooks/useSaleData';
import {
  Card,
  CardHead,
  CardSub,
  CardTitle,
  Dot,
  Eyebrow,
  FormulaBlock,
  Hero,
  HeroActions,
  HeroSide,
  HeroSubtitle,
  HeroTitle,
  Label,
  Metric,
  MetricsGrid,
  MetricValue,
  PageRoot,
  PrimaryCta,
  SecondaryCta,
  Small,
  StatCard,
  StepNumber,
  StepsGrid,
  Value,
} from './tokenSale.styles';
import { SaleStageKey } from './types';

const steps = [
  {
    title: 'Connect Wallet',
    text: 'Connect a wallet on Monad to access the sale and view your participation dashboard.',
  },
  {
    title: 'Approve USDC',
    text: 'Approve the sale contract to spend the amount of USDC you wish to deposit.',
  },
  {
    title: 'Deposit',
    text: 'Deposit any amount of USDC during the contribution period. Multiple deposits are supported and automatically combined.',
  },
  {
    title: 'Wait for Sale End',
    text: 'Funds stay locked in the sale contract. Allocations and refunds are finalized after the contribution window closes.',
  },
  {
    title: 'Claim K613',
    text: 'Once claiming opens, claim your full allocation — 100% unlocked, with no vesting.',
  },
  {
    title: 'Claim Refund',
    text: 'If the sale was oversubscribed, claim the unused part of your deposit back to the same wallet.',
  },
];

export function TokenSalePage() {
  const { address } = useAccount();
  const connected = Boolean(address);

  const { isSaleConfigured, schedule, stats, user, refetchAll } = useSaleData();
  const { approve, deposit, claimTokens, claimRefund, pendingAction } = useSaleActions(refetchAll);

  // nowMs stays null during SSR/hydration so the first client render matches
  // the server; the countdown starts ticking right after mount.
  const [nowMs, setNowMs] = useState<number | null>(null);
  const [depositOpen, setDepositOpen] = useState(false);
  const [toast, setToast] = useState<{ open: boolean; message: string }>({
    open: false,
    message: '',
  });

  const dashboardRef = useRef<HTMLDivElement | null>(null);
  const faqRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    setNowMs(Date.now());
    const intervalId = window.setInterval(() => setNowMs(Date.now()), 1000);
    return () => window.clearInterval(intervalId);
  }, []);

  const stage: SaleStageKey | null = nowMs == null ? null : getCurrentStage(schedule, nowMs);

  const handleDeposited = () => {
    setToast({ open: true, message: 'Deposit successful' });
  };

  const scrollTo = (ref: typeof dashboardRef) => {
    ref.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const renderHeroCta = () => {
    if (!connected) {
      return (
        <ConnectKitButton.Custom>
          {({ show }) => <PrimaryCta onClick={() => show && show()}>Connect Wallet</PrimaryCta>}
        </ConnectKitButton.Custom>
      );
    }
    switch (stage) {
      case 'contribution':
        return (
          <PrimaryCta onClick={() => setDepositOpen(true)} disabled={!isSaleConfigured}>
            Deposit USDC
          </PrimaryCta>
        );
      case 'claim':
        return <PrimaryCta onClick={() => scrollTo(dashboardRef)}>Claim K613</PrimaryCta>;
      case 'upcoming':
        return <PrimaryCta disabled>Sale Not Started</PrimaryCta>;
      case 'closed':
      case 'finalized':
        return <PrimaryCta onClick={() => scrollTo(dashboardRef)}>View Your Position</PrimaryCta>;
      default:
        return <PrimaryCta disabled>Deposit USDC</PrimaryCta>;
    }
  };

  return (
    <>
      <PageRoot>
        <Hero>
          <div>
            <Eyebrow>
              <Dot />
              <span>{stage ? STAGE_LABELS[stage] : 'Token Sale'}</span>
            </Eyebrow>
            <HeroTitle>K613 Public Token Sale</HeroTitle>
            <HeroSubtitle>
              K613 is the utility and governance token of the K613 lending protocol built on Monad.
              The public sale offers 10,000,000 K613 tokens at a fixed price of $0.01 per token,
              with a total raise target of $100,000.
              <br />
              <br />
              There are no deposit limits and no KYC requirements. Participants can contribute using
              USDC throughout the subscription period.
              <br />
              <br />
              If the sale is oversubscribed, token allocations will be distributed on a pro-rata
              basis. Any unused funds will be automatically refunded and made available for claim
              alongside purchased tokens.
              <br />
              <br />
              100% of purchased K613 tokens will be unlocked at TGE and available to claim
              immediately once claiming opens.
            </HeroSubtitle>
            <HeroActions>
              {renderHeroCta()}
              <SecondaryCta onClick={() => scrollTo(faqRef)}>View FAQ</SecondaryCta>
            </HeroActions>
          </div>

          <HeroSide>
            <StatCard elevation={0}>
              <Label>Token Price</Label>
              <Value>${TOKEN_PRICE_USD}</Value>
              <Small>Fixed price per K613 token.</Small>
            </StatCard>
            <StatCard elevation={0}>
              <Label>Sale Allocation</Label>
              <Value>10,000,000 K613</Value>
              <Small>Total tokens available in this sale.</Small>
            </StatCard>
            <StatCard elevation={0}>
              <Label>Hard Cap</Label>
              <Value>{formatUsdc(HARD_CAP_USDC, 0)}</Value>
              <Small>
                Maximum raise target for this sale.
                <br />
                Oversubscription is handled pro-rata with automatic refunds.
              </Small>
            </StatCard>
          </HeroSide>
        </Hero>

        {!isSaleConfigured && (
          <Alert severity="info" sx={{ mb: 3 }}>
            The sale contract is not deployed on this network yet. Live statistics and deposits will
            be enabled once the contract address is configured.
          </Alert>
        )}

        <SaleStagesTimeline schedule={schedule} nowMs={nowMs} />

        <Card elevation={0}>
          <CardHead>
            <div>
              <CardTitle>Sale Terms</CardTitle>
              <CardSub>Parameters are fixed and cannot change after the sale starts.</CardSub>
            </div>
          </CardHead>
          <MetricsGrid>
            <Metric>
              <Label>Token Price</Label>
              <MetricValue>$0.01</MetricValue>
              <Small>Fixed price for the entire sale.</Small>
            </Metric>
            <Metric>
              <Label>Sale Allocation</Label>
              <MetricValue>10,000,000 K613</MetricValue>
              <Small>100% unlocked at claim</Small>
            </Metric>
            <Metric>
              <Label>Hard Cap</Label>
              <MetricValue>{formatUsdc(HARD_CAP_USDC, 0)}</MetricValue>
              <Small>Maximum raise target for this sale.</Small>
            </Metric>
            <Metric>
              <Label>Network</Label>
              <MetricValue>Monad</MetricValue>
              <Small>Deposits are accepted in USDC</Small>
            </Metric>
            <Metric>
              <Label>Allocation Model</Label>
              <MetricValue>Pro-rata</MetricValue>
              <Small>Excess deposits are refunded automatically.</Small>
            </Metric>
            <Metric>
              <Label>Limits</Label>
              <MetricValue>None</MetricValue>
              <Small>No individual deposit limits or KYC requirements.</Small>
            </Metric>
          </MetricsGrid>
        </Card>

        <SaleStatsPanel stats={stats} />

        <div ref={dashboardRef}>
          <UserDashboard
            connected={connected}
            stage={stage}
            stats={stats}
            user={user}
            pendingAction={pendingAction}
            onOpenDeposit={() => setDepositOpen(true)}
            onClaimTokens={claimTokens}
            onClaimRefund={claimRefund}
          />
        </div>

        <Card elevation={0}>
          <CardHead>
            <div>
              <CardTitle>How It Works</CardTitle>
              <CardSub>
                No tokens are distributed before the sale ends — all figures are finalized after the
                contribution window closes.
              </CardSub>
            </div>
          </CardHead>
          <StepsGrid>
            {steps.map((step, index) => (
              <Metric key={step.title}>
                <StepNumber>{index + 1}</StepNumber>
                <Label>{step.title}</Label>
                <Small sx={{ mt: 1 }}>{step.text}</Small>
              </Metric>
            ))}
          </StepsGrid>
          <FormulaBlock>
            {`User Allocation = User Deposit / Total Deposits × 10,000,000 K613
User Used Funds = User Allocation × $0.01
Refund          = User Deposit − User Used Funds

If Total Deposits ≤ $100,000 the full deposit converts into K613 and the refund is zero.`}
          </FormulaBlock>
        </Card>

        <div ref={faqRef}>
          <SaleFaq />
        </div>

        <RiskDisclaimer />
      </PageRoot>

      <DepositDialog
        open={depositOpen}
        onClose={() => setDepositOpen(false)}
        usdcBalance={user.usdcBalance}
        usdcAllowance={user.usdcAllowance}
        totalDeposited={stats.totalDeposited}
        pendingAction={pendingAction}
        onApprove={approve}
        onDeposit={deposit}
        onDeposited={handleDeposited}
      />

      <Snackbar
        open={toast.open}
        onClose={() => setToast((prev) => ({ ...prev, open: false }))}
        autoHideDuration={2200}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert
          onClose={() => setToast((prev) => ({ ...prev, open: false }))}
          severity="success"
          variant="filled"
          sx={{ width: '100%' }}
        >
          {toast.message}
        </Alert>
      </Snackbar>
    </>
  );
}
