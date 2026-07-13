import { Alert, Box } from '@mui/material';
import { ConnectKitButton } from 'connectkit';
import { useState } from 'react';
import { AddTokenToWalletButton } from 'src/components/AddTokenToWallet';
import { ROUTES } from 'src/components/primitives/Link';
import { WatchableToken } from 'src/hooks/useAddTokenToWallet';

import {
  formatK613,
  formatShare,
  formatUsdc,
  getAllocation,
  getPoolShare,
  getRefund,
} from '../constants';
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
  SecondaryCta,
  Small,
  StatusBadge,
} from '../tokenSale.styles';
import { SaleAction, SaleStageKey, SaleStats, UserSaleState } from '../types';

type UserDashboardProps = {
  connected: boolean;
  stage: SaleStageKey | null;
  claimsClosed: boolean;
  stats: SaleStats;
  user: UserSaleState;
  /** `null` until the sale contract reports its token address. */
  k613Token: WatchableToken | null;
  pendingAction: SaleAction | null;
  onOpenDeposit: () => void;
  onClaimTokens: () => Promise<unknown>;
  onClaimRefund: () => Promise<unknown>;
};

function getClaimStatusLabel(
  stage: SaleStageKey | null,
  user: UserSaleState,
  hasRefund: boolean,
  claimsClosed: boolean
): string {
  if (user.deposit === 0n) return 'Not participating';
  if (stage === 'upcoming' || stage === 'contribution') return 'Sale in progress';
  if (stage === 'closed') return 'Awaiting finalization';
  if (stage === 'finalized') return 'Claim opens soon';
  if (user.tokensClaimed && (!hasRefund || user.refundClaimed)) return 'Claimed';
  if (claimsClosed) return 'Claim window closed';
  return 'Claim open';
}

export function UserDashboard({
  connected,
  stage,
  claimsClosed,
  stats,
  user,
  k613Token,
  pendingAction,
  onOpenDeposit,
  onClaimTokens,
  onClaimRefund,
}: UserDashboardProps) {
  const [error, setError] = useState<string | null>(null);

  // Pre-finalization values are estimates from current totals; once the sale
  // is finalized the contract-reported values take over.
  const allocation =
    user.finalAllocation ??
    getAllocation(user.deposit, stats.totalDeposited, stats.hardCap, stats.saleAllocation);
  const refund =
    user.finalRefund ??
    getRefund(user.deposit, stats.totalDeposited, stats.hardCap, stats.saleAllocation);
  const poolShare = getPoolShare(user.deposit, stats.totalDeposited);
  const isFinal = user.finalAllocation != null;

  const claimOpen = stage === 'claim';
  // Claimable amounts come straight from the contract (userInfo): they already
  // account for finalization, the claim window, and what's been claimed.
  const claimableTokens = user.claimableTokens;
  const claimableRefund = user.claimableRefund;
  const hasRefund = refund > 0n;
  const fullyClaimed = user.tokensClaimed && (!hasRefund || user.refundClaimed);

  const handleClaim = async (action: () => Promise<unknown>) => {
    setError(null);
    try {
      await action();
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    }
  };

  return (
    <Card elevation={0}>
      <CardHead>
        <div>
          <CardTitle>Your Participation</CardTitle>
          <CardSub>
            {connected
              ? 'Your deposit, allocation and claim status for this sale.'
              : 'Connect wallet to view your deposit, allocation and claim status.'}
          </CardSub>
        </div>
        {connected ? (
          <StatusBadge label={getClaimStatusLabel(stage, user, hasRefund, claimsClosed)} />
        ) : (
          <StatusBadge color="warning" label="Wallet not connected" />
        )}
      </CardHead>

      {!connected ? (
        <EmptyState>
          <div>
            <EmptyTitle>Connect wallet</EmptyTitle>
            <EmptyDescription>
              Sale statistics are public. Connect wallet to see your personal participation details
              and available actions.
            </EmptyDescription>
            <ConnectKitButton.Custom>
              {({ show }) => <PrimaryCta onClick={() => show && show()}>Connect Wallet</PrimaryCta>}
            </ConnectKitButton.Custom>
          </div>
        </EmptyState>
      ) : user.deposit === 0n && stage !== 'contribution' ? (
        <EmptyState>
          <div>
            <EmptyTitle>No deposit yet</EmptyTitle>
            <EmptyDescription>
              {stage === 'upcoming'
                ? 'The contribution window has not opened yet. Come back once the sale starts.'
                : 'This wallet did not participate in the sale.'}
            </EmptyDescription>
          </div>
        </EmptyState>
      ) : (
        <>
          <MetricsGrid>
            <Metric>
              <Label>Your Deposit</Label>
              <MetricValue>{formatUsdc(user.deposit)}</MetricValue>
              <Small>Total across all your deposits</Small>
            </Metric>
            <Metric>
              <Label>Your Share Of Pool</Label>
              <MetricValue>{formatShare(poolShare)}</MetricValue>
              <Small>Of all deposits in the sale</Small>
            </Metric>
            <Metric>
              <Label>{isFinal ? 'Final Allocation' : 'Estimated Allocation'}</Label>
              <MetricValue>{`${formatK613(allocation)} K613`}</MetricValue>
              <Small>{isFinal ? 'Finalized on-chain' : 'Based on current total deposits'}</Small>
            </Metric>
            <Metric>
              <Label>{isFinal ? 'Final Refund' : 'Estimated Refund'}</Label>
              <MetricValue>{formatUsdc(refund)}</MetricValue>
              <Small>
                {isFinal ? 'Finalized on-chain' : 'Unused funds if the sale is oversubscribed'}
              </Small>
            </Metric>
            <Metric>
              <Label>Claimable K613</Label>
              <MetricValue>{`${formatK613(claimableTokens)} K613`}</MetricValue>
              <Small>
                {user.tokensClaimed
                  ? 'Already claimed'
                  : claimsClosed
                  ? 'Claim window closed'
                  : 'Available once claim opens'}
              </Small>
              <AddTokenToWalletButton token={k613Token} sx={{ mt: 1, ml: -1 }} />
            </Metric>
            <Metric>
              <Label>Claimable Refund</Label>
              <MetricValue>{formatUsdc(claimableRefund)}</MetricValue>
              <Small>
                {user.refundClaimed
                  ? 'Already claimed'
                  : claimsClosed
                  ? 'Claim window closed'
                  : 'Available once claim opens'}
              </Small>
            </Metric>
          </MetricsGrid>

          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1.5, mt: 2 }}>
            {stage === 'contribution' && (
              <PrimaryCta onClick={onOpenDeposit}>Deposit USDC</PrimaryCta>
            )}
            {claimOpen && !claimsClosed && (
              <>
                <PrimaryCta
                  onClick={() => handleClaim(onClaimTokens)}
                  disabled={claimableTokens === 0n || pendingAction === 'claimTokens'}
                >
                  {pendingAction === 'claimTokens'
                    ? 'Claiming…'
                    : user.tokensClaimed
                    ? 'K613 Claimed'
                    : 'Claim K613'}
                </PrimaryCta>
                {hasRefund && (
                  <SecondaryCta
                    onClick={() => handleClaim(onClaimRefund)}
                    disabled={claimableRefund === 0n || pendingAction === 'claimRefund'}
                  >
                    {pendingAction === 'claimRefund'
                      ? 'Claiming…'
                      : user.refundClaimed
                      ? 'Refund Claimed'
                      : 'Claim Refund'}
                  </SecondaryCta>
                )}
              </>
            )}
          </Box>

          {claimOpen && claimsClosed && !fullyClaimed && (
            <Alert severity="warning" sx={{ mt: 2 }}>
              The claim window has closed. Unclaimed allocations and refunds can no longer be
              claimed.
            </Alert>
          )}

          {fullyClaimed && (
            <Alert severity="success" sx={{ mt: 2 }}>
              Stake your K613 and start earning protocol revenue.
              <Box sx={{ mt: 1.5 }}>
                <PrimaryCta href={ROUTES.stakingK613}>Stake K613</PrimaryCta>
              </Box>
            </Alert>
          )}

          {error && (
            <Alert severity="error" sx={{ mt: 2 }}>
              {error}
            </Alert>
          )}
        </>
      )}
    </Card>
  );
}
