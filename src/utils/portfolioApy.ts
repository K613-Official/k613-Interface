import { getTotalApy } from 'src/components/incentives/ApyWithIncentives';
import { ExtendedFormattedUser } from 'src/hooks/pool/useExtendedUserSummaryAndIncentives';

type Incentives = Parameters<typeof getTotalApy>[1];

/**
 * Portfolio APY as plain sums of the per-position figures shown in the lists —
 * protocol rate plus reward emissions for each row, exactly as the row renders it.
 *
 * Deliberately not the balance-weighted `user.earnedAPY` / `user.debtAPY` / `user.netAPY`:
 * the product wants the headline numbers to reconcile with adding up the column
 * underneath them. Those weighted figures are still what the yield math uses.
 */
const sumIncentives = (incentives: Incentives) => {
  const active = (incentives ?? []).filter(
    (incentive) => incentive.incentiveAPR === 'Infinity' || +incentive.incentiveAPR > 0
  );
  if (active.some((incentive) => incentive.incentiveAPR === 'Infinity')) return Infinity;
  return active.reduce((acc, incentive) => acc + +incentive.incentiveAPR, 0);
};

const suppliedPositions = (user: ExtendedFormattedUser | undefined) =>
  (user?.userReservesData ?? []).filter((position) => position.underlyingBalance !== '0');

const borrowedPositions = (user: ExtendedFormattedUser | undefined) =>
  (user?.userReservesData ?? []).filter((position) => position.variableBorrows !== '0');

export const suppliedApySum = (user: ExtendedFormattedUser | undefined) =>
  suppliedPositions(user).reduce(
    (acc, position) =>
      acc + getTotalApy(Number(position.reserve.supplyAPY), position.reserve.aIncentivesData ?? []),
    0
  );

/** What the borrow rows display, summed: interest owed plus the rewards that borrowing earns. */
export const borrowedApySum = (user: ExtendedFormattedUser | undefined) =>
  borrowedPositions(user).reduce(
    (acc, position) =>
      acc +
      getTotalApy(
        Number(position.reserve.variableBorrowAPY),
        position.reserve.vIncentivesData ?? []
      ),
    0
  );

/**
 * Dashboard headline: everything earned minus everything paid.
 *
 * Reward emissions on a borrow position count as earnings, not as cost — only the
 * protocol interest is subtracted. Folding the whole borrow row in with a minus
 * would drag the figure down by rewards the user is in fact collecting, and on this
 * market the debt-side emissions are large enough for that to dominate the number.
 */
export const netApySum = (user: ExtendedFormattedUser | undefined) => {
  const borrowed = borrowedPositions(user);
  const interestPaid = borrowed.reduce(
    (acc, position) => acc + Math.max(Number(position.reserve.variableBorrowAPY), 0),
    0
  );
  const borrowRewards = borrowed.reduce(
    (acc, position) => acc + sumIncentives(position.reserve.vIncentivesData ?? []),
    0
  );
  return suppliedApySum(user) + borrowRewards - interestPaid;
};
