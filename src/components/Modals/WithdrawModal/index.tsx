import { API_ETH_MOCK_ADDRESS, ProtocolAction } from '@aave/contract-helpers';
import {
  calculateHealthFactorFromBalancesBigUnits,
  USD_DECIMALS,
  valueToBigNumber,
} from '@aave/math-utils';
import { Cancel, Close } from '@mui/icons-material';
import { Alert, Button, IconButton, Stack, Typography } from '@mui/material';
import { useQueryClient } from '@tanstack/react-query';
import { useMemo, useState } from 'react';
import { TokenIcon } from 'src/components/primitives/TokenIcon';
import { useAppDataContext } from 'src/hooks/app-data-provider/useAppDataProvider';
import { useModalContext } from 'src/hooks/useModal';
import { useWeb3Context } from 'src/libs/hooks/useWeb3Context';
import { useRootStore } from 'src/store/root';
import { getErrorTextFromError, TxAction } from 'src/ui-config/errorMapping';
import { queryKeysFactory } from 'src/ui-config/queries';
import { roundToTokenDecimals } from 'src/utils/utils';
import { useShallow } from 'zustand/shallow';

import { SuccessView } from '../SuccessView';
import { BaseModalProps, WithdrawModalProps } from '../types';
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

type Props = BaseModalProps & WithdrawModalProps;

export default function WithdrawModal({ open, onClose, underlyingAsset }: Props) {
  const { reserves, user, marketReferencePriceInUsd } = useAppDataContext();
  const [withdraw, estimateGasLimit, addTransaction] = useRootStore(
    useShallow((s) => [s.withdraw, s.estimateGasLimit, s.addTransaction])
  );
  const { sendTx } = useWeb3Context();
  const queryClient = useQueryClient();
  const {
    mainTxState,
    txError,
    setMainTxState,
    setTxError,
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

  const futureHealthFactor = useMemo(() => {
    if (!user || !reserve) return null;
    if (!amount || Number(amount) === 0 || !reserve.usageAsCollateralEnabled) return null;
    const amountInMarketRef = valueToBigNumber(amount)
      .multipliedBy(reserve.formattedPriceInMarketReferenceCurrency)
      .multipliedBy(marketReferencePriceInUsd)
      .shiftedBy(-USD_DECIMALS);
    return calculateHealthFactorFromBalancesBigUnits({
      collateralBalanceMarketReferenceCurrency: valueToBigNumber(user.totalCollateralUSD).minus(
        amountInMarketRef
      ),
      borrowBalanceMarketReferenceCurrency: user.totalBorrowsUSD,
      currentLiquidationThreshold: user.currentLiquidationThreshold,
    }).toString();
  }, [amount, user, reserve, marketReferencePriceInUsd]);

  const handleClose = () => {
    setAmount('');
    setMainTxState({});
    setTxError(undefined);
    closeContext();
    onClose();
  };

  if (!reserve || !user || !userReserve) {
    return (
      <Dialog open={open} onClose={handleClose}>
        <ModalCard>
          <Header>
            <Typography variant="h5">Withdraw</Typography>
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
  const supplied = userReserve.underlyingBalance;

  const handleAmountChange = (value: string) => {
    const truncated = roundToTokenDecimals(value, reserve.decimals);
    setAmount(truncated);
  };

  const handleMax = () => setAmount(supplied);

  const amountInUsd = valueToBigNumber(amount || '0').multipliedBy(reserve.priceInUSD);

  const handleWithdraw = async () => {
    try {
      setMainTxState({ ...mainTxState, loading: true });
      const txs = await withdraw({
        reserve: poolAddress,
        amount,
        aTokenAddress: reserve.aTokenAddress,
      });
      const actionTx = txs[txs.length - 1];
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      let tx: any = await actionTx.tx();
      delete tx.gasPrice;
      tx = await estimateGasLimit(tx);
      const response = await sendTx(tx);
      await response.wait(1);
      setMainTxState({ txHash: response.hash, loading: false, success: true });
      addTransaction(response.hash, {
        action: ProtocolAction.withdraw,
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
  const exceedsSupply = amountNum > Number(supplied);
  const wouldLiquidate =
    futureHealthFactor && Number(futureHealthFactor) > 0 && Number(futureHealthFactor) < 1;
  const disabled = amountNum <= 0 || exceedsSupply || !!wouldLiquidate || mainTxState.loading;

  if (mainTxState.success) {
    return (
      <Dialog open={open} onClose={handleClose}>
        <ModalCard>
          <SuccessView
            action="Withdraw"
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
          <Typography variant="h5">Withdraw {symbol}</Typography>
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
                <Typography variant="caption">Supplied {Number(supplied).toFixed(4)}</Typography>
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
              Remaining supply
            </Typography>
            <Typography variant="body2">
              {Number(supplied).toFixed(4)} {symbol}
              {amountNum > 0 && ` → ${(Number(supplied) - amountNum).toFixed(4)} ${symbol}`}
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
        {exceedsSupply && <Alert severity="warning">Amount exceeds supplied balance.</Alert>}
        {wouldLiquidate && (
          <Alert severity="error">
            Withdrawal would put your position below liquidation threshold.
          </Alert>
        )}

        <Button
          variant="contained"
          size="large"
          fullWidth
          disabled={disabled}
          onClick={handleWithdraw}
        >
          {mainTxState.loading ? 'Processing…' : `Withdraw ${symbol}`}
        </Button>
      </ModalCard>
    </Dialog>
  );
}
