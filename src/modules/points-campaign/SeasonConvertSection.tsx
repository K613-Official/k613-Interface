import { Alert, Box, Snackbar } from '@mui/material';
import { ConnectKitButton } from 'connectkit';
import { useMemo, useState } from 'react';
import { AddTokenToWalletDialog } from 'src/components/AddTokenToWallet';
import { K613_TOKEN_META } from 'src/const/k613Tokens';
import { useAccount } from 'wagmi';

import { SEASON_TRANCHE_COUNT, useSeasonClaim } from './hooks/useSeasonClaim';
import { useUserClaim } from './hooks/useUserClaim';
import {
  Card,
  CardHead,
  CardSub,
  CardTitle,
  EmptyDescription,
  EmptyState,
  EmptyTitle,
  Label,
  Metric,
  MetricsGrid,
  MetricValue,
  PrimaryCta,
  Small,
  StatusBadge,
} from './pointsCampaign.styles';

// Turn a raw contract revert into something a user can act on. The common failure
// here is a conversion attempted before the K613S1 points were claimed: the season
// claim burns K613S1 the wallet does not hold, so the ERC20 reverts on burn.
function humanizeConvertError(err: unknown): string {
  const raw = err instanceof Error ? err.message : String(err);
  const msg = raw.toLowerCase();
  if (msg.includes('user rejected') || msg.includes('user denied')) {
    return 'Transaction rejected.';
  }
  if (
    msg.includes('insufficientbalance') ||
    msg.includes('insufficient balance') ||
    msg.includes('exceeds balance') ||
    msg.includes('burn amount exceeds') ||
    msg.includes('safeerc20failedoperation') ||
    msg.includes('erc20:')
  ) {
    return 'You need to claim your K613S1 points first.';
  }
  return raw;
}

const TOKEN_DECIMALS = 18n;

// `**` is transpiled to Math.pow by Next/SWC and throws on BigInt in the
// browser bundle — build 10^n via string instead.
function pow10(decimals: bigint): bigint {
  return BigInt('1' + '0'.repeat(Number(decimals)));
}

function formatTokens(value: bigint): string {
  if (value === 0n) return '0';
  const divisor = pow10(TOKEN_DECIMALS);
  const integer = value / divisor;
  const fraction = value % divisor;
  const integerStr = integer.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  if (fraction === 0n) return integerStr;
  const fractionStr = fraction
    .toString()
    .padStart(Number(TOKEN_DECIMALS), '0')
    .slice(0, 4)
    .replace(/0+$/, '');
  return fractionStr ? `${integerStr}.${fractionStr}` : integerStr;
}

const dateFormatter = new Intl.DateTimeFormat('en-US', {
  month: 'short',
  day: 'numeric',
  timeZone: 'UTC',
});

function formatUnlockDate(ts: number): string {
  return dateFormatter.format(ts * 1000);
}

const TRANCHE_BADGES = {
  converted: { label: 'Converted', color: undefined },
  available: { label: 'Available', color: undefined },
  locked: { label: 'Locked', color: 'warning' as const },
};

type FlowStep = 'idle' | 'claiming-points' | 'converting';

// Two-step progress indicator for the "claim points → convert" flow. Step 1 is the
// distributor points claim, step 2 the season conversion.
function ConvertStepper({ flowStep }: { flowStep: FlowStep }) {
  const step1Done = flowStep === 'converting';
  const steps = [
    { n: 1, label: 'Claim K613S1 points', active: flowStep === 'claiming-points', done: step1Done },
    { n: 2, label: 'Convert to K613', active: flowStep === 'converting', done: false },
  ];

  return (
    <Box sx={{ mt: 2, display: 'flex', alignItems: 'center', gap: 1.5 }}>
      {steps.map((step, index) => (
        <Box key={step.n} sx={{ display: 'flex', alignItems: 'center', gap: 1.5, flex: 1 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Box
              sx={{
                width: 24,
                height: 24,
                flexShrink: 0,
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 13,
                fontWeight: 600,
                color: step.active || step.done ? '#0b0b0b' : '#bdbdbd',
                background: step.active || step.done ? '#61d000' : 'rgba(255,255,255,0.1)',
              }}
            >
              {step.done ? '✓' : step.n}
            </Box>
            <Small sx={{ color: step.active ? 'text.primary' : undefined }}>{step.label}</Small>
          </Box>
          {index === 0 && (
            <Box sx={{ flex: 1, height: '1px', background: 'rgba(255,255,255,0.15)' }} />
          )}
        </Box>
      ))}
    </Box>
  );
}

export function SeasonConvertSection() {
  const { address } = useAccount();
  const {
    config,
    status,
    convert,
    totalAllocation,
    alreadyClaimed,
    availableNow,
    hasEnoughK613S1,
    refetchK613S1Balance,
    tranches,
    claimDeadline,
    isLoading,
    isPending,
    error,
  } = useSeasonClaim();

  // The distributor points claim (Step 1) — the same flow the Overview tab exposes.
  const {
    claim: claimPoints,
    claimable: pointsClaimable,
    isLoading: pointsLoading,
    isPending: pointsPending,
  } = useUserClaim();

  const [localError, setLocalError] = useState<string | null>(null);
  const [toastOpen, setToastOpen] = useState(false);
  const [addTokenPromptOpen, setAddTokenPromptOpen] = useState(false);
  const [flowStep, setFlowStep] = useState<FlowStep>('idle');

  const k613Token = useMemo(
    () => (config?.K613 ? { address: config.K613, ...K613_TOKEN_META } : null),
    [config?.K613]
  );

  const onConvertSuccess = (hash: string | undefined) => {
    if (hash) {
      setToastOpen(true);
      setAddTokenPromptOpen(true);
    }
  };

  const handleConvert = async () => {
    setLocalError(null);
    setFlowStep('converting');
    try {
      onConvertSuccess(await convert());
    } catch (err) {
      setLocalError(humanizeConvertError(err));
    } finally {
      setFlowStep('idle');
    }
  };

  // Step 1 → Step 2 in a single click: mint the K613S1 points, wait for the balance
  // to update, then convert. Used when the wallet has unclaimed distributor points.
  const handleClaimAndConvert = async () => {
    setLocalError(null);
    try {
      setFlowStep('claiming-points');
      await claimPoints();
      await refetchK613S1Balance();
      setFlowStep('converting');
      onConvertSuccess(await convert());
    } catch (err) {
      setLocalError(humanizeConvertError(err));
    } finally {
      setFlowStep('idle');
    }
  };

  const nextLockedTranche = tranches.find((tranche) => tranche.status === 'locked') ?? null;

  // When there is a vested amount to convert but the wallet is short on K613S1, the
  // points must be claimed from the distributor first (Step 1).
  const needsPointsClaim = status === 'claimable' && !hasEnoughK613S1;
  const canClaimPoints = pointsClaimable > 0n;
  const busy = flowStep !== 'idle' || isPending || pointsPending;

  const renderBody = () => {
    if (status === 'not-configured') {
      return (
        <EmptyState>
          <div>
            <EmptyTitle>Conversion opens at TGE</EmptyTitle>
            <EmptyDescription>
              The K613 conversion contract is not live on this network yet. Your K613S1 balance is
              safe — conversion starts at TGE.
            </EmptyDescription>
          </div>
        </EmptyState>
      );
    }

    if (!address) {
      return (
        <EmptyState>
          <div>
            <EmptyTitle>Connect wallet</EmptyTitle>
            <EmptyDescription>
              Connect your wallet to check your season allocation and convert K613S1 to K613.
            </EmptyDescription>
            <ConnectKitButton.Custom>
              {({ show }) => <PrimaryCta onClick={() => show && show()}>Connect wallet</PrimaryCta>}
            </ConnectKitButton.Custom>
          </div>
        </EmptyState>
      );
    }

    if (isLoading) {
      return (
        <EmptyState>
          <div>
            <EmptyTitle>Loading…</EmptyTitle>
            <EmptyDescription>Fetching your season allocation.</EmptyDescription>
          </div>
        </EmptyState>
      );
    }

    if (status === 'not-eligible') {
      return (
        <EmptyState>
          <div>
            <EmptyTitle>Not eligible</EmptyTitle>
            <EmptyDescription>
              Your address is not in the season-final snapshot, so there is nothing to convert.
            </EmptyDescription>
          </div>
        </EmptyState>
      );
    }

    const ctaLabel = isPending
      ? 'Converting…'
      : status === 'before-tge'
      ? 'Conversion opens at TGE'
      : status === 'fully-claimed'
      ? 'All converted'
      : status === 'awaiting-next-tranche'
      ? 'Nothing to convert yet'
      : `Convert ${formatTokens(availableNow)} K613S1`;

    const ctaReason =
      status === 'before-tge'
        ? 'The first 20% unlocks at TGE.'
        : status === 'fully-claimed'
        ? 'Your entire allocation has been converted to K613.'
        : status === 'awaiting-next-tranche' && nextLockedTranche
        ? `Next tranche unlocks on ${formatUnlockDate(nextLockedTranche.unlockTs)}.`
        : null;

    return (
      <>
        <MetricsGrid>
          <Metric>
            <Label>Your allocation</Label>
            <MetricValue>{formatTokens(totalAllocation)} K613</MetricValue>
            <Small>Total from the season-final snapshot</Small>
          </Metric>
          <Metric>
            <Label>Already converted</Label>
            <MetricValue>{formatTokens(alreadyClaimed)} K613</MetricValue>
            <Small>Paid out on-chain so far</Small>
          </Metric>
          <Metric>
            <Label>Available now</Label>
            <MetricValue>{formatTokens(availableNow)} K613</MetricValue>
            <Small>Vested and not yet converted</Small>
          </Metric>
        </MetricsGrid>

        {tranches.length > 0 && (
          <Box
            sx={{
              mt: 2,
              display: 'grid',
              gap: 1.5,
              gridTemplateColumns: {
                xs: '1fr',
                sm: 'repeat(2, 1fr)',
                md: `repeat(${SEASON_TRANCHE_COUNT}, 1fr)`,
              },
            }}
          >
            {tranches.map((tranche) => (
              <Metric key={tranche.index} sx={{ minHeight: 0 }}>
                <Box
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: 1,
                  }}
                >
                  <Label>{`${100 / SEASON_TRANCHE_COUNT}%`}</Label>
                  <StatusBadge
                    size="small"
                    label={TRANCHE_BADGES[tranche.status].label}
                    color={TRANCHE_BADGES[tranche.status].color}
                  />
                </Box>
                <Small sx={{ mt: 1 }}>{formatUnlockDate(tranche.unlockTs)}</Small>
                <Small>{`${formatTokens(tranche.amount)} K613`}</Small>
              </Metric>
            ))}
          </Box>
        )}

        <Alert severity="warning" sx={{ mt: 2 }}>
          Converting burns the equivalent amount of your K613S1. This cannot be undone.
        </Alert>

        {needsPointsClaim ? (
          pointsLoading ? (
            <PrimaryCta disabled sx={{ mt: 2 }}>
              Checking your K613S1 points…
            </PrimaryCta>
          ) : canClaimPoints ? (
            <>
              <ConvertStepper flowStep={flowStep} />
              <PrimaryCta onClick={handleClaimAndConvert} disabled={busy} sx={{ mt: 2 }}>
                {flowStep === 'claiming-points'
                  ? 'Step 1 of 2: Claiming points…'
                  : flowStep === 'converting'
                  ? 'Step 2 of 2: Converting…'
                  : 'Claim & Convert'}
              </PrimaryCta>
              <Small sx={{ mt: 1, display: 'block' }}>
                Your K613S1 points are not claimed yet. We&apos;ll claim them, then convert — two
                wallet confirmations, one after another.
              </Small>
            </>
          ) : (
            <>
              <Alert severity="info" sx={{ mt: 2 }}>
                Not enough K613S1 to convert. Your wallet balance is below the amount this
                conversion would burn, and there are no unclaimed points to top it up.
              </Alert>
              <PrimaryCta disabled sx={{ mt: 2 }}>
                Convert {formatTokens(availableNow)} K613S1
              </PrimaryCta>
            </>
          )
        ) : (
          <>
            <PrimaryCta
              onClick={handleConvert}
              disabled={availableNow === 0n || busy}
              sx={{ mt: 2 }}
            >
              {flowStep === 'converting' ? 'Converting…' : ctaLabel}
            </PrimaryCta>
            {ctaReason && <Small sx={{ mt: 1, display: 'block' }}>{ctaReason}</Small>}
          </>
        )}
        {claimDeadline != null && claimDeadline > 0 && status !== 'fully-claimed' && (
          <Small sx={{ mt: 0.5, display: 'block' }}>
            {`Conversion is open until ${formatUnlockDate(claimDeadline)}.`}
          </Small>
        )}

        {(localError || error) && (
          <Alert severity="error" sx={{ mt: 2 }}>
            {localError ?? String(error)}
          </Alert>
        )}
      </>
    );
  };

  return (
    <>
      <Card elevation={0}>
        <CardHead>
          <div>
            <CardTitle>Convert to K613</CardTitle>
            <CardSub>
              Convert your K613S1 season points into K613. 20% unlocks at TGE, then 20% every 15
              days across 5 tranches.
            </CardSub>
          </div>
        </CardHead>
        {renderBody()}
      </Card>

      <AddTokenToWalletDialog
        open={addTokenPromptOpen}
        token={k613Token}
        description="Track your K613 balance in your wallet to see the converted tokens."
        onClose={() => setAddTokenPromptOpen(false)}
      />

      <Snackbar
        open={toastOpen}
        onClose={() => setToastOpen(false)}
        autoHideDuration={2200}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert
          onClose={() => setToastOpen(false)}
          severity="success"
          variant="filled"
          sx={{ width: '100%' }}
        >
          Conversion successful
        </Alert>
      </Snackbar>
    </>
  );
}
