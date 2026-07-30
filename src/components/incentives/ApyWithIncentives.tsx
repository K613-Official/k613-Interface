import { ReserveIncentiveResponse } from '@aave/math-utils/dist/esm/formatters/incentive/calculate-reserve-incentives';
import { Box, Divider, Tooltip, Typography } from '@mui/material';
import { ReactNode } from 'react';

import { PopperComponent } from '../ContentWithTooltip';
import { TokenIcon } from '../primitives/TokenIcon';
import { getSymbolMap } from './IncentivesTooltipContent';

interface ApyWithIncentivesProps {
  /** Base protocol rate as a fraction, e.g. 0.0234 for 2.34%. Pass a negative value for "no data". */
  value: number;
  incentives?: ReserveIncentiveResponse[];
  symbol: string;
  /** Caption for the base rate row inside the tooltip. */
  baseLabel?: string;
}

const MAX_ICONS = 3;

const activeIncentives = (incentives?: ReserveIncentiveResponse[]) =>
  (incentives ?? []).filter(
    (incentive) => incentive.incentiveAPR === 'Infinity' || +incentive.incentiveAPR > 0
  );

/**
 * Combined protocol + rewards rate, as a fraction. Returns `Infinity` when a reserve emits
 * rewards against zero liquidity. Exported so the table can sort by the figure it displays.
 */
export const getTotalApy = (value: number, incentives?: ReserveIncentiveResponse[]): number => {
  const active = activeIncentives(incentives);
  if (active.length === 0) return value;
  if (active.some((incentive) => incentive.incentiveAPR === 'Infinity')) return Infinity;
  return Math.max(value, 0) + active.reduce((acc, incentive) => acc + +incentive.incentiveAPR, 0);
};

/**
 * Ranks two total-APY figures. Plain subtraction breaks here because reserves with rewards but
 * no liquidity total to `Infinity`, and `Infinity - Infinity` is NaN. Missing rates sink to the
 * bottom.
 */
export const compareApy = (a: number, b: number) => {
  const rank = (value: number) => (Number.isNaN(value) ? -Infinity : value);
  const left = rank(a);
  const right = rank(b);
  if (left === right) return 0;
  return left < right ? -1 : 1;
};

const formatPercent = (fraction: number) =>
  `${(fraction * 100).toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })} %`;

const TooltipRow = ({
  caption,
  value,
  bold,
}: {
  caption: ReactNode;
  value: string;
  bold?: boolean;
}) => (
  <Box
    sx={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: 4,
      minHeight: 28,
    }}
  >
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>{caption}</Box>
    <Typography variant="caption" fontWeight={bold ? 600 : 400} whiteSpace="nowrap">
      {value} APY
    </Typography>
  </Box>
);

/**
 * Shows the combined rate (protocol + reward emissions) as a single figure with the reward
 * token icon underneath, and moves the breakdown into a hover tooltip. Keeps the assets table
 * narrow: reward APRs on this market run to five digits and would blow out the column.
 */
export const ApyWithIncentives = ({
  value,
  incentives,
  symbol,
  baseLabel = 'Protocol APY',
}: ApyWithIncentivesProps) => {
  const active = activeIncentives(incentives);
  const baseValue = value < 0 ? '—' : formatPercent(value);

  if (active.length === 0) {
    return <>{baseValue}</>;
  }

  const totalApy = getTotalApy(value, active);
  const total = Number.isFinite(totalApy) ? formatPercent(totalApy) : '∞ %';
  const mapped = active.map(getSymbolMap);

  return (
    <Tooltip
      arrow
      placement="top"
      enterTouchDelay={0}
      leaveTouchDelay={5000}
      PopperComponent={PopperComponent}
      title={
        <Box sx={{ py: 3, px: 4, minWidth: 240 }}>
          <Typography variant="caption" color="text.secondary" component="p" mb={3}>
            Participating in this {symbol} reserve gives annualized xK613 rewards on top of the
            protocol rate.
          </Typography>

          <TooltipRow
            caption={<Typography variant="caption">{baseLabel}</Typography>}
            value={baseValue}
          />

          {mapped.map((incentive) => (
            <TooltipRow
              key={incentive.rewardTokenAddress}
              caption={
                <>
                  <TokenIcon
                    aToken={incentive.aToken}
                    symbol={incentive.tokenIconSymbol}
                    sx={{ fontSize: '16px' }}
                  />
                  <Typography variant="caption">{incentive.symbol} (+)</Typography>
                </>
              }
              value={
                incentive.incentiveAPR === 'Infinity'
                  ? '∞ %'
                  : formatPercent(+incentive.incentiveAPR)
              }
            />
          ))}

          <Divider sx={{ my: 2 }} />

          <TooltipRow
            caption={<Typography variant="caption">Total APY</Typography>}
            value={total}
            bold
          />
        </Box>
      }
    >
      {/* Spans, not divs: this renders inside <Typography> wrappers that default to a span. */}
      <Box
        component="span"
        sx={{
          display: 'inline-flex',
          flexDirection: 'column',
          alignItems: 'center',
          lineHeight: 1.3,
          cursor: 'help',
          whiteSpace: 'nowrap',
        }}
      >
        {total}
        <Box component="span" sx={{ display: 'inline-flex' }}>
          {mapped.slice(0, MAX_ICONS).map((incentive) => (
            <TokenIcon
              aToken={incentive.aToken}
              symbol={incentive.tokenIconSymbol}
              sx={{ fontSize: '14px', ml: mapped.length > 1 ? -0.5 : 0 }}
              key={incentive.rewardTokenAddress}
            />
          ))}
        </Box>
      </Box>
    </Tooltip>
  );
};
