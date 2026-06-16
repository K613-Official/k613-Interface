import {
  formatMultiple,
  formatShare,
  formatUsdc,
  getAllocationRatio,
  getOversubscription,
  HARD_CAP_USDC,
} from '../constants';
import {
  Card,
  CardHead,
  CardSub,
  CardTitle,
  Label,
  Metric,
  MetricsGrid,
  MetricValue,
  ProgressFill,
  ProgressLegend,
  ProgressTrack,
  Small,
} from '../tokenSale.styles';
import { SaleStats } from '../types';

const numberFormatter = new Intl.NumberFormat('en-US');

type SaleStatsPanelProps = {
  stats: SaleStats;
};

export function SaleStatsPanel({ stats }: SaleStatsPanelProps) {
  const { totalDeposited, participantCount } = stats;

  const oversubscription = getOversubscription(totalDeposited);
  const allocationRatio = getAllocationRatio(totalDeposited);
  const progressPercent = Math.min(100, oversubscription * 100);
  const averageDeposit = participantCount > 0 ? totalDeposited / BigInt(participantCount) : 0n;

  return (
    <Card elevation={0}>
      <CardHead>
        <div>
          <CardTitle>Sale Statistics</CardTitle>
          <CardSub>Live totals across all participants. Updated every 30 seconds.</CardSub>
        </div>
      </CardHead>

      <ProgressTrack>
        <ProgressFill sx={{ width: `${progressPercent}%` }} />
      </ProgressTrack>
      <ProgressLegend>
        <Small>{`${(oversubscription * 100).toFixed(0)}% of ${formatUsdc(
          HARD_CAP_USDC,
          0
        )} target`}</Small>
        <Small>{`${formatUsdc(totalDeposited)} committed`}</Small>
      </ProgressLegend>

      <MetricsGrid sx={{ mt: 2 }}>
        <Metric>
          <Label>Total Deposited</Label>
          <MetricValue>{formatUsdc(totalDeposited)}</MetricValue>
          <Small>Held by the sale contract until finalization</Small>
        </Metric>
        <Metric>
          <Label>Raise Target</Label>
          <MetricValue>{formatUsdc(HARD_CAP_USDC, 0)}</MetricValue>
          <Small>Hard cap — excess is refunded pro-rata</Small>
        </Metric>
        <Metric>
          <Label>Oversubscription</Label>
          <MetricValue>{formatMultiple(oversubscription)}</MetricValue>
          <Small>Current oversubscription multiple</Small>
        </Metric>
        <Metric>
          <Label>Participants</Label>
          <MetricValue>{numberFormatter.format(participantCount)}</MetricValue>
          <Small>Unique depositor wallets</Small>
        </Metric>
        <Metric>
          <Label>Average Deposit</Label>
          <MetricValue>{formatUsdc(averageDeposit)}</MetricValue>
          <Small>Total deposited / participants</Small>
        </Metric>
        <Metric>
          <Label>Current Allocation Ratio</Label>
          <MetricValue>{formatShare(allocationRatio)}</MetricValue>
          <Small>Share of each deposit converted into K613</Small>
        </Metric>
      </MetricsGrid>
    </Card>
  );
}
