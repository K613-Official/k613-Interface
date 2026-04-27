import {
  API_ETH_MOCK_ADDRESS,
  gasLimitRecommendations,
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
import { getMaxAmountAvailableToSupply } from 'src/utils/getMaxAmountAvailableToSupply';
import { roundToTokenDecimals } from 'src/utils/utils';
import { useShallow } from 'zustand/shallow';

import { APPROVAL_GAS_LIMIT, checkRequiresApproval } from '../../transactions/utils';
import { SuccessView } from '../SuccessView';
import { BaseModalProps, SupplyModalProps } from '../types';
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

type Props = BaseModalProps & SupplyModalProps;

export default function SupplyModal({ open, onClose, underlyingAsset }: Props) {
  const { reserves, user, marketReferencePriceInUsd } = useAppDataContext();
  const [
    supply,
    generateApproval,
    estimateGasLimit,
    addTransaction,
    currentMarketData,
    minRemainingBaseTokenBalance,
  ] = useRootStore(
    useShallow((s) => [
      s.supply,
      s.generateApproval,
      s.estimateGasLimit,
      s.addTransaction,
      s.currentMarketData,
      s.poolComputed.minRemainingBaseTokenBalance,
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

  const reserve = useMemo(() => {
    const key = underlyingAsset.toLowerCase();
    return reserves.find((r) => {
      if (key === API_ETH_MOCK_ADDRESS.toLowerCase()) return r.isWrappedBaseAsset;
      return r.underlyingAsset.toLowerCase() === key;
    });
  }, [reserves, underlyingAsset]);

  const isNative = underlyingAsset.toLowerCase() === API_ETH_MOCK_ADDRESS.toLowerCase();
  const poolAddress = isNative ? API_ETH_MOCK_ADDRESS : reserve?.underlyingAsset || '';

  const { data: approvedAmount } = usePoolApprovedAmount(currentMarketData, poolAddress);

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
            <Typography variant="h5">Supply</Typography>
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
  const walletBalance = isNative
    ? walletBalances[API_ETH_MOCK_ADDRESS.toLowerCase()]?.amount || '0'
    : walletBalances[reserve.underlyingAsset.toLowerCase()]?.amount || '0';

  const maxAmountToSupply = getMaxAmountAvailableToSupply(
    walletBalance,
    {
      supplyCap: reserve.supplyCap,
      totalLiquidity: reserve.totalLiquidity,
      isFrozen: reserve.isFrozen,
      decimals: reserve.decimals,
      debtCeiling: reserve.debtCeiling,
      isolationModeTotalDebt: reserve.isolationModeTotalDebt,
    },
    underlyingAsset,
    minRemainingBaseTokenBalance
  );

  const isMaxSelected = amount !== '' && amount === maxAmountToSupply;

  const handleAmountChange = (value: string) => {
    const truncated = roundToTokenDecimals(value, reserve.decimals);
    setAmount(truncated);
  };

  const handleMax = () => setAmount(maxAmountToSupply);

  const amountInUsd = valueToBigNumber(amount || '0').multipliedBy(reserve.priceInUSD);

  const amountInMarketRef = valueToBigNumber(amount || '0')
    .multipliedBy(reserve.formattedPriceInMarketReferenceCurrency)
    .multipliedBy(marketReferencePriceInUsd)
    .shiftedBy(-USD_DECIMALS);

  const futureHealthFactor = useMemo(() => {
    if (!amount || Number(amount) === 0 || !reserve.usageAsCollateralEnabled) return null;
    return calculateHealthFactorFromBalancesBigUnits({
      collateralBalanceMarketReferenceCurrency: valueToBigNumber(user.totalCollateralUSD).plus(
        amountInMarketRef
      ),
      borrowBalanceMarketReferenceCurrency: user.totalBorrowsUSD,
      currentLiquidationThreshold: user.currentLiquidationThreshold,
    }).toString();
  }, [amount, user, amountInMarketRef, reserve.usageAsCollateralEnabled]);

  const requiresApproval =
    !isNative &&
    Number(amount) > 0 &&
    checkRequiresApproval({
      approvedAmount: approvedAmount?.amount || '0',
      amount,
      signedAmount: '0',
    });

  useEffect(() => {
    let gas = Number(gasLimitRecommendations[ProtocolAction.supply].recommended);
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

  const handleSupply = async () => {
    try {
      setMainTxState({ ...mainTxState, loading: true });
      let tx = supply({
        amount: parseUnits(amount, reserve.decimals).toString(),
        reserve: poolAddress,
      });
      tx = await estimateGasLimit(tx);
      const response = await sendTx(tx);
      await response.wait(1);
      setMainTxState({ txHash: response.hash, loading: false, success: true });
      addTransaction(response.hash, {
        action: ProtocolAction.supply,
        txState: 'success',
        asset: poolAddress,
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
  const exceedsBalance = amountNum > Number(walletBalance);
  const blocked = reserve.isFrozen;
  const disabled =
    blocked || amountNum <= 0 || exceedsBalance || mainTxState.loading || approvalTxState.loading;

  const actionLabel = requiresApproval && !approvalTxState.success ? 'Approve' : `Supply ${symbol}`;
  const onAction = requiresApproval && !approvalTxState.success ? handleApprove : handleSupply;

  if (mainTxState.success) {
    return (
      <Dialog open={open} onClose={handleClose}>
        <ModalCard>
          <SuccessView
            action="Supplied"
            amount={amount}
            symbol={symbol}
            iconSymbol={reserve.iconSymbol}
            txHash={mainTxState.txHash}
            onClose={handleClose}
            addToWalletAddress={reserve.aTokenAddress}
            addToWalletSymbol={`a${symbol}`}
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
          <Typography variant="h5">Supply {symbol}</Typography>
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
                  Wallet balance {Number(walletBalance).toFixed(4)}
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
              Supply APY
            </Typography>
            <Typography variant="body2">{(Number(reserve.supplyAPY) * 100).toFixed(2)}%</Typography>
          </OverviewRow>
          <OverviewRow>
            <Typography variant="body2" sx={{ opacity: 0.5 }}>
              Collateralization
            </Typography>
            <Typography
              variant="body2"
              color={reserve.usageAsCollateralEnabled ? 'success.main' : 'text.secondary'}
            >
              {reserve.usageAsCollateralEnabled ? 'Enabled' : 'Disabled'}
            </Typography>
          </OverviewRow>
          <OverviewRow>
            <Typography variant="body2" sx={{ opacity: 0.5 }}>
              Health factor
            </Typography>
            {futureHealthFactor ? (
              <Typography
                variant="body2"
                color={Number(futureHealthFactor) < 1.5 ? 'error.main' : 'success.main'}
              >
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

        <Button variant="contained" size="large" fullWidth disabled={disabled} onClick={onAction}>
          {mainTxState.loading || approvalTxState.loading ? 'Processing…' : actionLabel}
        </Button>
      </ModalCard>
    </Dialog>
  );
}
