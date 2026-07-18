import { Alert, Box, Snackbar } from '@mui/material';
import { ConnectKitButton } from 'connectkit';
import { useMemo, useState } from 'react';
import { AddTokenToWalletDialog } from 'src/components/AddTokenToWallet';
import { K613_TOKEN_META } from 'src/const/k613Tokens';
import { useAccount } from 'wagmi';

import { SEASON_TRANCHE_COUNT, useSeasonClaim } from './hooks/useSeasonClaim';
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

export function SeasonConvertSection() {
  const { address } = useAccount();
  const {
    config,
    status,
    convert,
    totalAllocation,
    alreadyClaimed,
    availableNow,
    tranches,
    claimDeadline,
    isLoading,
    isPending,
    error,
  } = useSeasonClaim();

  const [localError, setLocalError] = useState<string | null>(null);
  const [toastOpen, setToastOpen] = useState(false);
  const [addTokenPromptOpen, setAddTokenPromptOpen] = useState(false);

  const k613Token = useMemo(
    () => (config?.K613 ? { address: config.K613, ...K613_TOKEN_META } : null),
    [config?.K613]
  );

  const handleConvert = async () => {
    setLocalError(null);
    try {
      const hash = await convert();
      if (hash) {
        setToastOpen(true);
        setAddTokenPromptOpen(true);
      }
    } catch (err) {
      setLocalError(err instanceof Error ? err.message : String(err));
    }
  };

  const nextLockedTranche = tranches.find((tranche) => tranche.status === 'locked') ?? null;

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

        <PrimaryCta
          onClick={handleConvert}
          disabled={availableNow === 0n || isPending}
          sx={{ mt: 2 }}
        >
          {ctaLabel}
        </PrimaryCta>
        {ctaReason && <Small sx={{ mt: 1, display: 'block' }}>{ctaReason}</Small>}
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
