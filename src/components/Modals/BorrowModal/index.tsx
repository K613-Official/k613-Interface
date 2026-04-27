import {
  API_ETH_MOCK_ADDRESS,
  ApproveDelegationType,
  gasLimitRecommendations,
  InterestRate,
  MAX_UINT_AMOUNT,
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
import { useCallback, useEffect, useMemo, useState } from 'react';
import { TokenIcon } from 'src/components/primitives/TokenIcon';
import { useAppDataContext } from 'src/hooks/app-data-provider/useAppDataProvider';
import { useModalContext } from 'src/hooks/useModal';
import { useWeb3Context } from 'src/libs/hooks/useWeb3Context';
import { useRootStore } from 'src/store/root';
import { getErrorTextFromError, TxAction } from 'src/ui-config/errorMapping';
import { queryKeysFactory } from 'src/ui-config/queries';
import { getMaxAmountAvailableToBorrow } from 'src/utils/getMaxAmountAvailableToBorrow';
import { roundToTokenDecimals } from 'src/utils/utils';
import { useShallow } from 'zustand/shallow';

import { APPROVE_DELEGATION_GAS_LIMIT, checkRequiresApproval } from '../../transactions/utils';
import { SuccessView } from '../SuccessView';
import { BaseModalProps, BorrowModalProps } from '../types';
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

type Props = BaseModalProps & BorrowModalProps;

export default function BorrowModal({ open, onClose, underlyingAsset }: Props) {
  const { reserves, user, marketReferencePriceInUsd } = useAppDataContext();
  const [
    borrow,
    getCreditDelegationApprovedAmount,
    currentMarketData,
    generateApproveDelegation,
    estimateGasLimit,
    addTransaction,
  ] = useRootStore(
    useShallow((state) => [
      state.borrow,
      state.getCreditDelegationApprovedAmount,
      state.currentMarketData,
      state.generateApproveDelegation,
      state.estimateGasLimit,
      state.addTransaction,
    ])
  );
  const { sendTx } = useWeb3Context();
  const queryClient = useQueryClient();
  const {
    mainTxState,
    approvalTxState,
    txError,
    setMainTxState,
    setApprovalTxState,
    setTxError,
    setGasLimit,
    setLoadingTxns,
    close: closeContext,
  } = useModalContext();

  const [amount, setAmount] = useState('');
  const [requiresApproval, setRequiresApproval] = useState(false);
  const [approvedAmount, setApprovedAmount] = useState<ApproveDelegationType | undefined>();

  const reserve = useMemo(() => {
    const key = underlyingAsset.toLowerCase();
    return reserves.find((r) => {
      if (key === API_ETH_MOCK_ADDRESS.toLowerCase()) return r.isWrappedBaseAsset;
      return r.underlyingAsset.toLowerCase() === key;
    });
  }, [reserves, underlyingAsset]);

  const handleClose = () => {
    setAmount('');
    setMainTxState({});
    setApprovalTxState({});
    setTxError(undefined);
    closeContext();
    onClose();
  };

  if (!reserve || !user) {
    return (
      <Dialog open={open} onClose={handleClose}>
        <ModalCard>
          <Header>
            <Typography variant="h5">Borrow</Typography>
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

  const symbol = reserve.symbol;
  const maxAmountToBorrow = getMaxAmountAvailableToBorrow(reserve, user);
  const isMaxSelected = amount !== '' && amount === maxAmountToBorrow;

  const handleAmountChange = (value: string) => {
    const truncated = roundToTokenDecimals(value, reserve.decimals);
    setAmount(truncated);
  };

  const handleMax = () => setAmount(maxAmountToBorrow);

  const amountInUsd = valueToBigNumber(amount || '0').multipliedBy(reserve.priceInUSD);

  const amountToBorrowInMarketRef = valueToBigNumber(amount || '0')
    .multipliedBy(reserve.formattedPriceInMarketReferenceCurrency)
    .multipliedBy(marketReferencePriceInUsd)
    .shiftedBy(-USD_DECIMALS);

  const futureHealthFactor = useMemo(() => {
    if (!amount || Number(amount) === 0) return null;
    return calculateHealthFactorFromBalancesBigUnits({
      collateralBalanceMarketReferenceCurrency: user.totalCollateralUSD,
      borrowBalanceMarketReferenceCurrency: valueToBigNumber(user.totalBorrowsUSD).plus(
        amountToBorrowInMarketRef
      ),
      currentLiquidationThreshold: user.currentLiquidationThreshold,
    }).toString();
  }, [amount, user, amountToBorrowInMarketRef]);

  const isNativeBorrow = underlyingAsset.toLowerCase() === API_ETH_MOCK_ADDRESS.toLowerCase();

  const fetchApprovedAmount = useCallback(
    async (forceCheck?: boolean) => {
      if (isNativeBorrow && (approvedAmount === undefined || forceCheck)) {
        setLoadingTxns(true);
        const data = await getCreditDelegationApprovedAmount({
          debtTokenAddress: reserve.variableDebtTokenAddress,
          delegatee: currentMarketData.addresses.WETH_GATEWAY ?? '',
        });
        setApprovedAmount(data);
        setLoadingTxns(false);
      }

      if (approvedAmount && isNativeBorrow) {
        setRequiresApproval(
          checkRequiresApproval({
            approvedAmount: approvedAmount.amount,
            amount,
            signedAmount: '0',
          })
        );
      } else if (!isNativeBorrow) {
        setRequiresApproval(false);
        setApprovalTxState({});
      }
    },
    [
      amount,
      approvedAmount,
      currentMarketData.addresses.WETH_GATEWAY,
      getCreditDelegationApprovedAmount,
      isNativeBorrow,
      reserve.variableDebtTokenAddress,
      setApprovalTxState,
      setLoadingTxns,
    ]
  );

  useEffect(() => {
    fetchApprovedAmount();
  }, [fetchApprovedAmount]);

  useEffect(() => {
    let gas = Number(gasLimitRecommendations[ProtocolAction.borrow].recommended);
    if (requiresApproval && !approvalTxState.success) {
      gas += Number(APPROVE_DELEGATION_GAS_LIMIT);
    }
    setGasLimit(gas.toString());
  }, [requiresApproval, approvalTxState.success, setGasLimit]);

  const handleApprove = async () => {
    try {
      setApprovalTxState({ ...approvalTxState, loading: true });
      let tx = generateApproveDelegation({
        debtTokenAddress: reserve.variableDebtTokenAddress,
        delegatee: currentMarketData.addresses.WETH_GATEWAY ?? '',
        amount: MAX_UINT_AMOUNT,
      });
      tx = await estimateGasLimit(tx);
      const response = await sendTx(tx);
      await response.wait(1);
      setApprovalTxState({ txHash: response.hash, loading: false, success: true });
      fetchApprovedAmount(true);
    } catch (e) {
      setTxError(getErrorTextFromError(e, TxAction.GAS_ESTIMATION, false));
      setApprovalTxState({ txHash: undefined, loading: false });
    }
  };

  const handleBorrow = async () => {
    try {
      setMainTxState({ ...mainTxState, loading: true });
      let tx = borrow({
        amount: parseUnits(amount, reserve.decimals).toString(),
        reserve: underlyingAsset,
        interestRateMode: InterestRate.Variable,
        debtTokenAddress: reserve.variableDebtTokenAddress,
      });
      tx = await estimateGasLimit(tx);
      const response = await sendTx(tx);
      await response.wait(1);
      setMainTxState({ txHash: response.hash, loading: false, success: true });
      addTransaction(response.hash, {
        action: ProtocolAction.borrow,
        txState: 'success',
        asset: underlyingAsset,
        amount,
        assetName: reserve.name,
      });
      queryClient.invalidateQueries({ queryKey: queryKeysFactory.pool });
    } catch (e) {
      setTxError(getErrorTextFromError(e, TxAction.GAS_ESTIMATION, false));
      setMainTxState({ txHash: undefined, loading: false });
    }
  };

  const amountNum = Number(amount || '0');
  const exceedsLiquidity = amountNum > Number(reserve.formattedAvailableLiquidity);
  const blocked = !reserve.borrowingEnabled || exceedsLiquidity;
  const disabled = blocked || amountNum <= 0 || mainTxState.loading || approvalTxState.loading;

  const actionLabel = requiresApproval && !approvalTxState.success ? 'Approve' : `Borrow ${symbol}`;
  const onAction = requiresApproval && !approvalTxState.success ? handleApprove : handleBorrow;

  if (mainTxState.success) {
    return (
      <Dialog open={open} onClose={handleClose}>
        <ModalCard>
          <SuccessView
            action="Borrowed"
            amount={amount}
            symbol={symbol}
            txHash={mainTxState.txHash}
            onClose={handleClose}
            addToWalletAddress={reserve.variableDebtTokenAddress}
            addToWalletSymbol={`variableDebt${symbol}`}
            addToWalletDecimals={reserve.decimals}
          />
        </ModalCard>
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onClose={handleClose}>
      <ModalCard>
        <Header>
          <Typography variant="h5">Borrow {symbol}</Typography>
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
                <Typography variant="caption">
                  Available {Number(maxAmountToBorrow).toFixed(4)}
                </Typography>
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

        {isMaxSelected && (
          <Typography variant="caption" color="primary">
            MAX selected
          </Typography>
        )}

        <OverviewSection>
          <Typography variant="caption" sx={{ opacity: 0.5 }}>
            Transaction overview
          </Typography>
          <OverviewRow>
            <Typography variant="body2" sx={{ opacity: 0.5 }}>
              Health factor
            </Typography>
            <Typography
              variant="body2"
              color={
                futureHealthFactor && Number(futureHealthFactor) < 1.5
                  ? 'error.main'
                  : 'success.main'
              }
            >
              {Number(user.healthFactor) > 0 ? Number(user.healthFactor).toFixed(2) : '∞'}
              {futureHealthFactor &&
                ` → ${
                  Number(futureHealthFactor) > 0 ? Number(futureHealthFactor).toFixed(2) : '∞'
                }`}
            </Typography>
          </OverviewRow>
          <OverviewRow>
            <Typography variant="body2" sx={{ opacity: 0.5 }}>
              Borrow APY, variable
            </Typography>
            <Typography variant="body2">
              {(Number(reserve.variableBorrowAPY) * 100).toFixed(2)}%
            </Typography>
          </OverviewRow>
        </OverviewSection>

        {txError && (
          <Alert severity="error" sx={{ mt: 1 }}>
            {txError.error || 'Transaction failed'}
          </Alert>
        )}

        {exceedsLiquidity && (
          <Alert severity="warning">Not enough liquidity in the {symbol} reserve.</Alert>
        )}

        <Button variant="contained" size="large" fullWidth disabled={disabled} onClick={onAction}>
          {mainTxState.loading || approvalTxState.loading ? 'Processing…' : actionLabel}
        </Button>
      </ModalCard>
    </Dialog>
  );
}
