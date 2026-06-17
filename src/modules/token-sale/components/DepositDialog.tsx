import { Alert, Dialog, DialogContent, DialogTitle } from '@mui/material';
import { useMemo, useState } from 'react';

import {
  formatK613,
  formatUsdc,
  getAllocation,
  getRefund,
  getUsedFunds,
  parseUsdcInput,
  usdcToInputValue,
} from '../constants';
import {
  AmountInput,
  AmountRow,
  AmountSymbol,
  BalanceRow,
  DialogActionsRow,
  EstimateList,
  EstimateRow,
  EstimateValue,
  Label,
  MaxButton,
  PrimaryCta,
  SecondaryCta,
  Small,
} from '../tokenSale.styles';
import { SaleAction } from '../types';

type DepositDialogProps = {
  open: boolean;
  onClose: () => void;
  usdcBalance: bigint;
  usdcAllowance: bigint;
  totalDeposited: bigint;
  hardCap: bigint;
  saleAllocation: bigint;
  pendingAction: SaleAction | null;
  onApprove: (amount: bigint) => Promise<unknown>;
  onDeposit: (amount: bigint) => Promise<unknown>;
  onDeposited: (amount: bigint) => void;
};

export function DepositDialog({
  open,
  onClose,
  usdcBalance,
  usdcAllowance,
  totalDeposited,
  hardCap,
  saleAllocation,
  pendingAction,
  onApprove,
  onDeposit,
  onDeposited,
}: DepositDialogProps) {
  const [input, setInput] = useState('');
  const [error, setError] = useState<string | null>(null);

  const amount = useMemo(() => parseUsdcInput(input) ?? 0n, [input]);

  // Estimates assume the entered amount joins the pool on top of current totals.
  const estimatedTotal = totalDeposited + amount;
  const estimatedAllocation = getAllocation(amount, estimatedTotal, hardCap, saleAllocation);
  const estimatedUsedFunds = getUsedFunds(estimatedAllocation, hardCap, saleAllocation);
  const estimatedRefund = getRefund(amount, estimatedTotal, hardCap, saleAllocation);

  const needsApproval = amount > 0n && usdcAllowance < amount;
  const exceedsBalance = amount > usdcBalance;
  const isApproving = pendingAction === 'approve';
  const isDepositing = pendingAction === 'deposit';
  const busy = isApproving || isDepositing;

  const handleClose = () => {
    if (busy) return;
    setInput('');
    setError(null);
    onClose();
  };

  const handleInputChange = (value: string) => {
    if (value === '' || /^\d*\.?\d*$/.test(value)) {
      setInput(value);
      setError(null);
    }
  };

  const handleMax = () => {
    setInput(usdcToInputValue(usdcBalance));
    setError(null);
  };

  const handleApprove = async () => {
    setError(null);
    try {
      await onApprove(amount);
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    }
  };

  const handleDeposit = async () => {
    setError(null);
    try {
      await onDeposit(amount);
      onDeposited(amount);
      setInput('');
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    }
  };

  const depositDisabled = amount <= 0n || needsApproval || exceedsBalance || busy;

  return (
    <Dialog open={open} onClose={handleClose} fullWidth maxWidth="sm">
      <DialogTitle>Deposit USDC</DialogTitle>
      <DialogContent>
        <Small sx={{ mb: 2 }}>
          Deposits are locked until the sale ends. If the sale is oversubscribed, your allocation is
          reduced pro-rata and the unused portion is refunded to this wallet.
        </Small>

        <Label sx={{ mb: 1 }}>Amount</Label>
        <AmountRow>
          <AmountInput
            type="text"
            inputMode="decimal"
            placeholder="0.00"
            value={input}
            onChange={(event) => handleInputChange(event.target.value)}
            disabled={busy}
          />
          <MaxButton onClick={handleMax} disabled={busy}>
            MAX
          </MaxButton>
          <AmountSymbol>USDC</AmountSymbol>
        </AmountRow>
        <BalanceRow>
          <Small>Wallet Balance</Small>
          <Small>{`${formatUsdc(usdcBalance)} USDC`}</Small>
        </BalanceRow>

        {amount > 0n && (
          <EstimateList>
            <EstimateRow>
              <Small>Estimated Allocation</Small>
              <EstimateValue>{`${formatK613(estimatedAllocation)} K613`}</EstimateValue>
            </EstimateRow>
            <EstimateRow>
              <Small>Estimated Used Funds</Small>
              <EstimateValue>{formatUsdc(estimatedUsedFunds)}</EstimateValue>
            </EstimateRow>
            <EstimateRow>
              <Small>Estimated Refund</Small>
              <EstimateValue>{formatUsdc(estimatedRefund)}</EstimateValue>
            </EstimateRow>
            <Small>
              Final values are calculated after the sale closes and depend on total deposits.
            </Small>
          </EstimateList>
        )}

        {exceedsBalance && (
          <Alert severity="warning" sx={{ mt: 2 }}>
            Amount exceeds your wallet balance.
          </Alert>
        )}
        {error && (
          <Alert severity="error" sx={{ mt: 2 }}>
            {error}
          </Alert>
        )}

        <DialogActionsRow>
          <SecondaryCta
            onClick={handleApprove}
            disabled={amount <= 0n || !needsApproval || exceedsBalance || busy}
          >
            {isApproving
              ? 'Approving…'
              : needsApproval || amount === 0n
              ? 'Approve USDC'
              : 'Approved'}
          </SecondaryCta>
          <PrimaryCta onClick={handleDeposit} disabled={depositDisabled}>
            {isDepositing ? 'Depositing…' : 'Deposit'}
          </PrimaryCta>
        </DialogActionsRow>
      </DialogContent>
    </Dialog>
  );
}
