import {
  API_ETH_MOCK_ADDRESS,
  gasLimitRecommendations,
  InterestRate,
  ProtocolAction,
} from '@aave/contract-helpers';
import {
  calculateHealthFactorFromBalancesBigUnits,
  USD_DECIMALS,
  valueToBigNumber,
} from '@aave/math-utils';
import { Cancel, Close } from '@mui/icons-material';
import { Alert, Button, IconButton, Stack, Typography } from '@mui/material';
import { useQueryClient } from '@tanstack/react-query';
import { parseUnits } from 'ethers/lib/utils';
import { useEffect, useMemo, useState } from 'react';
import { TokenIcon } from 'src/components/primitives/TokenIcon';
import { useAppDataContext } from 'src/hooks/app-data-provider/useAppDataProvider';
import { useWalletBalances } from 'src/hooks/app-data-provider/useWalletBalances';
import { usePoolApprovedAmount } from 'src/hooks/useApprovedAmount';
import { useModalContext } from 'src/hooks/useModal';
import { useWeb3Context } from 'src/libs/hooks/useWeb3Context';
import { useRootStore } from 'src/store/root';
import { getErrorTextFromError, TxAction } from 'src/ui-config/errorMapping';
import { queryKeysFactory } from 'src/ui-config/queries';
import { roundToTokenDecimals } from 'src/utils/utils';
import { useShallow } from 'zustand/shallow';

import { APPROVAL_GAS_LIMIT, checkRequiresApproval } from '../../transactions/utils';
import { SuccessView } from '../SuccessView';
import { BaseModalProps, RepayModalProps } from '../types';
import {
  AmountDisplay,
  AmountInput,
  BalanceRow,
  Dialog,
  Header,
  ModalCard,
  OverviewRow,
  OverviewSection,
  TokenInfo,
  TokenInputRow,
} from './styles';

type Props = BaseModalProps & RepayModalProps;

export default function RepayModal({ open, onClose, underlyingAsset }: Props) {
  const { reserves, user, marketReferencePriceInUsd } = useAppDataContext();
  const [repay, generateApproval, estimateGasLimit, addTransaction, currentMarketData] =
    useRootStore(
      useShallow((s) => [
        s.repay,
        s.generateApproval,
        s.estimateGasLimit,
        s.addTransaction,
        s.currentMarketData,
      ])
    );
  const { sendTx, currentAccount } = useWeb3Context();
  const { walletBalances } = useWalletBalances(currentMarketData);
  const queryClient = useQueryClient();
  const {
    mainTxState,
    approvalTxState,
    txError,
    setMainTxState,
    setApprovalTxState,
    setTxError,
    setGasLimit,
    close: closeContext,
  } = useModalContext();

  const [amount, setAmount] = useState('');
  const [isMaxSelected, setIsMaxSelected] = useState(false);

  const reserve = useMemo(() => {
    const key = underlyingAsset.toLowerCase();
    return reserves.find((r) => {
      if (key === API_ETH_MOCK_ADDRESS.toLowerCase()) return r.isWrappedBaseAsset;
      return r.underlyingAsset.toLowerCase() === key;
    });
  }, [reserves, underlyingAsset]);

  const userReserve = useMemo(
    () =>
      user?.userReservesData.find((ur) => {
        const key = underlyingAsset.toLowerCase();
        if (key === API_ETH_MOCK_ADDRESS.toLowerCase()) return ur.reserve.isWrappedBaseAsset;
        return ur.underlyingAsset.toLowerCase() === key;
      }),
    [user, underlyingAsset]
  );

  const isNative = underlyingAsset.toLowerCase() === API_ETH_MOCK_ADDRESS.toLowerCase();
  const poolAddress = isNative ? API_ETH_MOCK_ADDRESS : reserve?.underlyingAsset || '';

  const { data: approvedAmount } = usePoolApprovedAmount(currentMarketData, poolAddress);

  const handleClose = () => {
    setAmount('');
    setIsMaxSelected(false);
    setMainTxState({});
    setApprovalTxState({});
    setTxError(undefined);
    closeContext();
    onClose();
  };

  if (!reserve || !user || !userReserve) {
    return (
      <Dialog open={open} onClose={handleClose}>
        <ModalCard>
          <Header>
            <Typography variant="h5">Repay</Typography>
            <IconButton size="small" onClick={handleClose}>
              <Close fontSize="small" />
            </IconButton>
          </Header>
          <Typography variant="body2" sx={{ opacity: 0.6 }}>
            Loading reserve…
          </Typography>
        </ModalCard>
      </Dialog>
    );
  }

  const symbol = isNative ? reserve.symbol.replace(/^W/, '') : reserve.symbol;
  const debt = userReserve.variableBorrows;
  const walletBalance = isNative
    ? walletBalances[API_ETH_MOCK_ADDRESS.toLowerCase()]?.amount || '0'
    : walletBalances[reserve.underlyingAsset.toLowerCase()]?.amount || '0';

  const maxRepay = valueToBigNumber(debt).lte(walletBalance)
    ? valueToBigNumber(debt).toFixed()
    : valueToBigNumber(walletBalance).toFixed();
  const canRepayAllDebt = !isNative && valueToBigNumber(walletBalance).gte(debt);

  const handleAmountChange = (value: string) => {
    const truncated = roundToTokenDecimals(value, reserve.decimals);
    setAmount(truncated);
    setIsMaxSelected(false);
  };

  const handleMax = () => {
    setAmount(maxRepay);
    setIsMaxSelected(true);
  };

  const amountInUsd = valueToBigNumber(amount || '0').multipliedBy(reserve.priceInUSD);

  const amountInMarketRef = valueToBigNumber(amount || '0')
    .multipliedBy(reserve.formattedPriceInMarketReferenceCurrency)
    .multipliedBy(marketReferencePriceInUsd)
    .shiftedBy(-USD_DECIMALS);

  const futureHealthFactor = useMemo(() => {
    if (!amount || Number(amount) === 0) return null;
    return calculateHealthFactorFromBalancesBigUnits({
      collateralBalanceMarketReferenceCurrency: user.totalCollateralUSD,
      borrowBalanceMarketReferenceCurrency: valueToBigNumber(user.totalBorrowsUSD).minus(
        amountInMarketRef
      ),
      currentLiquidationThreshold: user.currentLiquidationThreshold,
    }).toString();
  }, [amount, user, amountInMarketRef]);

  const requiresApproval =
    !isNative &&
    Number(amount) > 0 &&
    checkRequiresApproval({
      approvedAmount: approvedAmount?.amount || '0',
      amount,
      signedAmount: '0',
    });

  useEffect(() => {
    let gas = Number(gasLimitRecommendations[ProtocolAction.repay].recommended);
    if (requiresApproval && !approvalTxState.success) {
      gas += Number(APPROVAL_GAS_LIMIT);
    }
    setGasLimit(gas.toString());
  }, [requiresApproval, approvalTxState.success, setGasLimit]);

  const handleApprove = async () => {
    try {
      if (!currentAccount) return;
      setApprovalTxState({ ...approvalTxState, loading: true });
      let tx = generateApproval({
        amount: parseUnits(amount, reserve.decimals).toString(),
        user: currentAccount,
        token: poolAddress,
        spender: currentMarketData.addresses.LENDING_POOL,
      });
      tx = await estimateGasLimit(tx);
      const response = await sendTx(tx);
      await response.wait(1);
      setApprovalTxState({ txHash: response.hash, loading: false, success: true });
    } catch (e) {
      setTxError(getErrorTextFromError(e, TxAction.GAS_ESTIMATION, false));
      setApprovalTxState({ txHash: undefined, loading: false });
    }
  };

  const handleRepay = async () => {
    try {
      setMainTxState({ ...mainTxState, loading: true });
      const amountToRepay =
        isMaxSelected && canRepayAllDebt
          ? '-1'
          : parseUnits(roundToTokenDecimals(amount, reserve.decimals), reserve.decimals).toString();
      let tx = repay({
        amountToRepay,
        poolAddress,
        repayWithATokens: false,
        debtType: InterestRate.Variable,
      });
      tx = await estimateGasLimit(tx);
      const response = await sendTx(tx);
      await response.wait(1);
      setMainTxState({ txHash: response.hash, loading: false, success: true });
      addTransaction(response.hash, {
        action: ProtocolAction.repay,
        txState: 'success',
        asset: poolAddress,
        amount,
        assetName: reserve.name,
      });
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: queryKeysFactory.pool }),
        queryClient.invalidateQueries({ queryKey: queryKeysFactory.gho }),
      ]);
    } catch (e) {
      setTxError(getErrorTextFromError(e, TxAction.GAS_ESTIMATION, false));
      setMainTxState({ txHash: undefined, loading: false });
    }
  };

  const amountNum = Number(amount || '0');
  const exceedsBalance = valueToBigNumber(amount || '0').gt(walletBalance);
  const exceedsDebt = valueToBigNumber(amount || '0').gt(debt);
  const disabled =
    amountNum <= 0 ||
    exceedsBalance ||
    exceedsDebt ||
    mainTxState.loading ||
    approvalTxState.loading;

  const actionLabel = requiresApproval && !approvalTxState.success ? 'Approve' : `Repay ${symbol}`;
  const onAction = requiresApproval && !approvalTxState.success ? handleApprove : handleRepay;

  if (mainTxState.success) {
    return (
      <Dialog open={open} onClose={handleClose}>
        <ModalCard>
          <SuccessView
            action="Repaid"
            amount={amount}
            symbol={symbol}
            iconSymbol={reserve.iconSymbol}
            txHash={mainTxState.txHash}
            onClose={handleClose}
          />
        </ModalCard>
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onClose={handleClose}>
      <ModalCard>
        <Header>
          <Typography variant="h5">Repay {symbol}</Typography>
          <IconButton size="small" onClick={handleClose}>
            <Close fontSize="small" />
          </IconButton>
        </Header>

        <Typography variant="caption" sx={{ opacity: 0.5 }}>
          Amount
        </Typography>

        <TokenInputRow>
          <AmountInput>
            <AmountDisplay>
              <Typography
                variant="h6"
                component="input"
                value={amount}
                onChange={(e) => handleAmountChange((e.target as HTMLInputElement).value)}
                placeholder="0"
                inputMode="decimal"
                sx={{
                  border: 'none',
                  outline: 'none',
                  background: 'transparent',
                  color: 'inherit',
                  font: 'inherit',
                  width: '100%',
                  padding: 0,
                }}
              />
              <Typography variant="caption" sx={{ opacity: 0.5 }}>
                ${amountInUsd.toFormat(2)}
              </Typography>
            </AmountDisplay>
            <TokenInfo>
              <Stack direction="row" spacing={0.5} alignItems="center">
                <TokenIcon symbol={reserve.iconSymbol} sx={{ fontSize: 16 }} />
                <Typography variant="caption">{symbol}</Typography>
              </Stack>
              <BalanceRow>
                <Typography variant="caption">Wallet {Number(walletBalance).toFixed(4)}</Typography>
                <Typography
                  variant="caption"
                  color="primary"
                  sx={{ cursor: 'pointer' }}
                  onClick={handleMax}
                >
                  MAX
                </Typography>
              </BalanceRow>
            </TokenInfo>
            {amount && (
              <IconButton size="small" sx={{ opacity: 0.5 }} onClick={() => setAmount('')}>
                <Cancel fontSize="small" />
              </IconButton>
            )}
          </AmountInput>
        </TokenInputRow>

        <OverviewSection>
          <Typography variant="caption" sx={{ opacity: 0.5 }}>
            Transaction overview
          </Typography>
          <OverviewRow>
            <Typography variant="body2" sx={{ opacity: 0.5 }}>
              Remaining debt
            </Typography>
            <Typography variant="body2">
              {Number(debt).toFixed(4)} {symbol}
              {amountNum > 0 && ` → ${Math.max(0, Number(debt) - amountNum).toFixed(4)} ${symbol}`}
            </Typography>
          </OverviewRow>
          <OverviewRow>
            <Typography variant="body2" sx={{ opacity: 0.5 }}>
              Health factor
            </Typography>
            {futureHealthFactor ? (
              <Typography variant="body2" color="success.main">
                {Number(user.healthFactor) > 0 ? Number(user.healthFactor).toFixed(2) : '∞'} →{' '}
                {Number(futureHealthFactor) > 0 ? Number(futureHealthFactor).toFixed(2) : '∞'}
              </Typography>
            ) : (
              <Typography variant="body2" sx={{ opacity: 0.3 }}>
                —
              </Typography>
            )}
          </OverviewRow>
        </OverviewSection>

        {txError && (
          <Alert severity="error" sx={{ mt: 1 }}>
            {txError.error || 'Transaction failed'}
          </Alert>
        )}
        {exceedsBalance && <Alert severity="warning">Amount exceeds wallet balance.</Alert>}
        {exceedsDebt && <Alert severity="warning">Amount exceeds outstanding debt.</Alert>}

        <Button variant="contained" size="large" fullWidth disabled={disabled} onClick={onAction}>
          {mainTxState.loading || approvalTxState.loading ? 'Processing…' : actionLabel}
        </Button>
      </ModalCard>
    </Dialog>
  );
}
