import { Alert } from '@mui/material';
import { useState } from 'react';
import { useAccount } from 'wagmi';

import { useUserClaim } from './hooks/useUserClaim';
import {
  Card,
  CardHead,
  CardSub,
  CardTitle,
  Label,
  Metric,
  MetricsGrid,
  MetricValue,
  PrimaryCta,
  Small,
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

export function ClaimSection() {
  const { address } = useAccount();
  const {
    isClaimAvailable,
    claim,
    claimable,
    cumulativeAmount,
    alreadyClaimed,
    claimWeek,
    isPending,
    error,
  } = useUserClaim();
  const [localError, setLocalError] = useState<string | null>(null);

  if (!isClaimAvailable) return null;
  if (!address) return null;
  if (cumulativeAmount === 0n) return null;

  const handleClaim = async () => {
    setLocalError(null);
    try {
      await claim();
    } catch (err) {
      setLocalError(err instanceof Error ? err.message : String(err));
    }
  };

  const disabled = claimable === 0n || isPending;

  return (
    <Card elevation={0} sx={{ mt: 2 }}>
      <CardHead>
        <div>
          <CardTitle>Claim K613S1</CardTitle>
          <CardSub>Available cumulative balance via merkle proof.</CardSub>
        </div>
      </CardHead>
      <MetricsGrid>
        <Metric>
          <Label>Total earned (cumulative)</Label>
          <MetricValue>{formatTokens(cumulativeAmount)} K613S1</MetricValue>
          <Small>Across finalized weeks</Small>
        </Metric>
        <Metric>
          <Label>Already claimed</Label>
          <MetricValue>{formatTokens(alreadyClaimed)} K613S1</MetricValue>
          <Small>On-chain claimed total</Small>
        </Metric>
        <Metric>
          <Label>Claimable now</Label>
          <MetricValue>{formatTokens(claimable)} K613S1</MetricValue>
          <Small>
            {claimWeek != null ? `Based on Week ${claimWeek} snapshot` : 'No active snapshot'}
          </Small>
        </Metric>
      </MetricsGrid>
      <PrimaryCta onClick={handleClaim} disabled={disabled} sx={{ mt: 2 }}>
        {isPending ? 'Claiming…' : claimable === 0n ? 'Nothing to claim' : 'Claim'}
      </PrimaryCta>
      {(localError || error) && (
        <Alert severity="error" sx={{ mt: 2 }}>
          {localError ?? String(error)}
        </Alert>
      )}
    </Card>
  );
}
