import { useK613Price } from 'src/hooks/useK613Price';
import { formatUsd } from 'src/utils/formatNumber';
import { formatUnits } from 'viem';

import { BalanceCaption } from './k613Staking.styles';

/**
 * Dollar equivalent under a K613/xK613 figure.
 *
 * K613 and xK613 are 1:1, so one price covers both. Renders nothing while the pool
 * price is unavailable — a stale or missing price is worse than no number at all on
 * a page where people size positions.
 */
export function K613UsdCaption({ amount }: { amount: bigint | undefined }) {
  const { k613Price } = useK613Price();

  if (k613Price === null || amount === undefined) return null;

  return (
    <BalanceCaption>≈ {formatUsd(Number(formatUnits(amount, 18)) * k613Price)}</BalanceCaption>
  );
}
