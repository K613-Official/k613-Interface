import { gasLimitRecommendations, ProtocolAction } from '@aave/contract-helpers';
import { calculateHealthFactorFromBalancesBigUnits, valueToBigNumber } from '@aave/math-utils';
import { ArrowForward, Close } from '@mui/icons-material';
import { Alert, Button, IconButton, Typography } from '@mui/material';
import { useQueryClient } from '@tanstack/react-query';
import { useEffect, useMemo } from 'react';
import { TokenIcon } from 'src/components/primitives/TokenIcon';
import { useAppDataContext } from 'src/hooks/app-data-provider/useAppDataProvider';
import { useModalContext } from 'src/hooks/useModal';
import { useZeroLTVBlockingWithdraw } from 'src/hooks/useZeroLTVBlockingWithdraw';
import { useWeb3Context } from 'src/libs/hooks/useWeb3Context';
import { useRootStore } from 'src/store/root';
import { getErrorTextFromError, TxAction } from 'src/ui-config/errorMapping';
import { queryKeysFactory } from 'src/ui-config/queries';
import { useShallow } from 'zustand/shallow';

import { SuccessView } from '../SuccessView';
import { BaseModalProps, CollateralChangeModalProps } from '../types';
import {
  AssetAmount,
  AssetMeta,
  AssetSummary,
  AssetText,
  Dialog,
  Header,
  ModalCard,
  OverviewRow,
  OverviewSection,
  Transition,
} from './styles';

type Props = BaseModalProps & CollateralChangeModalProps;

enum BlockingErrorType {
  NoSupplies,
  CannotUseAsCollateral,
  WouldLiquidate,
  ZeroLtvWithdrawBlocked,
}

const formatHealthFactor = (hf: string | number) => {
  const numeric = Number(hf);
  if (!Number.isFinite(numeric) || numeric < 0) return '∞';
  return numeric.toFixed(2);
};

const formatToken = (value: string | number) =>
  Number(value).toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 4,
  });

const formatUsd = (value: string | number) =>
  Number(value).toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

export default function CollateralChangeModal({
  open,
  onClose,
  underlyingAsset,
  usageAsCollateralEnabledOnUser,
}: Props) {
  const { reserves, user } = useAppDataContext();
  const [setUsageAsCollateral, estimateGasLimit, addTransaction] = useRootStore(
    useShallow((s) => [s.setUsageAsCollateral, s.estimateGasLimit, s.addTransaction])
  );
  const { sendTx } = useWeb3Context();
  const queryClient = useQueryClient();
  const {
    mainTxState,
    txError,
    setMainTxState,
    setTxError,
    setGasLimit,
    close: closeContext,
  } = useModalContext();

  const assetsBlockingWithdraw = useZeroLTVBlockingWithdraw();

  const reserve = useMemo(
    () => reserves.find((r) => r.underlyingAsset.toLowerCase() === underlyingAsset.toLowerCase()),
    [reserves, underlyingAsset]
  );

  const userReserve = useMemo(
    () =>
      user?.userReservesData.find(
        (ur) => ur.underlyingAsset.toLowerCase() === underlyingAsset.toLowerCase()
      ),
    [user, underlyingAsset]
  );

  useEffect(() => {
    setGasLimit(gasLimitRecommendations[ProtocolAction.setUsageAsCollateral].recommended);
  }, [setGasLimit]);

  const handleClose = () => {
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
            <Typography variant="h5">Collateral</Typography>
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
  const willEnable = !usageAsCollateralEnabledOnUser;
  const titleAction = willEnable ? 'Enable' : 'Disable';

  const currentTotalCollateralRef = valueToBigNumber(user.totalCollateralMarketReferenceCurrency);
  const totalCollateralAfter = currentTotalCollateralRef[willEnable ? 'plus' : 'minus'](
    userReserve.underlyingBalanceMarketReferenceCurrency
  );

  const healthFactorAfter = calculateHealthFactorFromBalancesBigUnits({
    collateralBalanceMarketReferenceCurrency: totalCollateralAfter,
    borrowBalanceMarketReferenceCurrency: user.totalBorrowsMarketReferenceCurrency,
    currentLiquidationThreshold: user.currentLiquidationThreshold,
  }).toString(10);

  let blockingError: BlockingErrorType | undefined = undefined;
  if (assetsBlockingWithdraw.length > 0 && !assetsBlockingWithdraw.includes(reserve.symbol)) {
    blockingError = BlockingErrorType.ZeroLtvWithdrawBlocked;
  } else if (valueToBigNumber(userReserve.underlyingBalance).eq(0)) {
    blockingError = BlockingErrorType.NoSupplies;
  } else if (
    (!usageAsCollateralEnabledOnUser && reserve.reserveLiquidationThreshold === '0') ||
    reserve.reserveLiquidationThreshold === '0'
  ) {
    blockingError = BlockingErrorType.CannotUseAsCollateral;
  } else if (
    usageAsCollateralEnabledOnUser &&
    user.totalBorrowsMarketReferenceCurrency !== '0' &&
    valueToBigNumber(healthFactorAfter).lte('1')
  ) {
    blockingError = BlockingErrorType.WouldLiquidate;
  }

  const blockingErrorMessage = (() => {
    switch (blockingError) {
      case BlockingErrorType.NoSupplies:
        return 'You do not have supplies in this asset.';
      case BlockingErrorType.CannotUseAsCollateral:
        return 'This asset cannot be used as collateral.';
      case BlockingErrorType.WouldLiquidate:
        return 'Disabling this asset as collateral would put your position below the liquidation threshold.';
      case BlockingErrorType.ZeroLtvWithdrawBlocked:
        return `Assets with zero LTV (${assetsBlockingWithdraw.join(
          ', '
        )}) must be withdrawn or disabled as collateral first.`;
      default:
        return null;
    }
  })();

  const showEnterIsolationWarning = willEnable && reserve.isIsolated;
  const showExitIsolationInfo =
    !willEnable &&
    user.isInIsolationMode &&
    user.isolatedReserve?.underlyingAsset === underlyingAsset;
  const showEnableDefaultInfo = willEnable && !reserve.isIsolated;
  const showDisableDefaultInfo = !willEnable && !showExitIsolationInfo;

  const handleAction = async () => {
    try {
      setMainTxState({ ...mainTxState, loading: true });
      const txs = await setUsageAsCollateral({
        reserve: reserve.underlyingAsset,
        usageAsCollateral: willEnable,
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
        action: ProtocolAction.setUsageAsCollateral,
        txState: 'success',
        asset: reserve.underlyingAsset,
        assetName: reserve.name,
        previousState: usageAsCollateralEnabledOnUser.toString(),
        newState: willEnable.toString(),
      });
      queryClient.invalidateQueries({ queryKey: queryKeysFactory.pool });
    } catch (e) {
      setTxError(getErrorTextFromError(e, TxAction.GAS_ESTIMATION, false));
      setMainTxState({ txHash: undefined, loading: false });
    }
  };

  const disabled = mainTxState.loading || blockingError !== undefined;

  if (mainTxState.success) {
    return (
      <Dialog open={open} onClose={handleClose}>
        <ModalCard>
          <SuccessView
            action={willEnable ? 'enabled' : 'disabled'}
            symbol={symbol}
            txHash={mainTxState.txHash}
            onClose={handleClose}
            description={
              <>
                Your {symbol} {willEnable ? 'is now' : 'is no longer'} used as collateral.
              </>
            }
          />
        </ModalCard>
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onClose={handleClose}>
      <ModalCard>
        <Header>
          <Typography variant="h5">
            {titleAction} {symbol} as collateral
          </Typography>
          <IconButton size="small" onClick={handleClose}>
            <Close fontSize="small" />
          </IconButton>
        </Header>

        <Typography variant="caption" sx={{ opacity: 0.5 }}>
          Asset
        </Typography>

        <AssetSummary>
          <AssetMeta>
            <TokenIcon symbol={reserve.iconSymbol} sx={{ fontSize: 32 }} />
            <AssetText>
              <Typography variant="subtitle1">{symbol}</Typography>
              <Typography variant="caption" sx={{ opacity: 0.6 }}>
                Supply balance
              </Typography>
            </AssetText>
          </AssetMeta>
          <AssetAmount>
            <Typography variant="body2">
              {formatToken(userReserve.underlyingBalance)} {symbol}
            </Typography>
            <Typography variant="caption" sx={{ opacity: 0.5 }}>
              ${formatUsd(userReserve.underlyingBalanceUSD)}
            </Typography>
          </AssetAmount>
        </AssetSummary>

        {showEnterIsolationWarning && (
          <Alert severity="warning">
            You are about to enter isolation mode. While in isolation mode you can only use one
            asset as collateral and borrowing is restricted to permitted stablecoins.
          </Alert>
        )}
        {showExitIsolationInfo && (
          <Alert severity="info">
            You will exit isolation mode and other assets can now be used as collateral.
          </Alert>
        )}
        {showEnableDefaultInfo && (
          <Alert severity="info">
            Enabling this asset as collateral increases your borrowing power and Health Factor, but
            it can be liquidated if your Health Factor drops below 1.
          </Alert>
        )}
        {showDisableDefaultInfo && (
          <Alert severity="info">
            Disabling this asset as collateral affects your borrowing power and Health Factor.
          </Alert>
        )}

        <OverviewSection>
          <Typography variant="caption" sx={{ opacity: 0.5 }}>
            Transaction overview
          </Typography>
          <OverviewRow>
            <Typography variant="body2" sx={{ opacity: 0.5 }}>
              Used as collateral
            </Typography>
            <Transition>
              <Typography
                variant="body2"
                color={usageAsCollateralEnabledOnUser ? 'success.main' : 'text.secondary'}
              >
                {usageAsCollateralEnabledOnUser ? 'Enabled' : 'Disabled'}
              </Typography>
              <ArrowForward sx={{ fontSize: 14, opacity: 0.6 }} />
              <Typography variant="body2" color={willEnable ? 'success.main' : 'error.main'}>
                {willEnable ? 'Enabled' : 'Disabled'}
              </Typography>
            </Transition>
          </OverviewRow>
          <OverviewRow>
            <Typography variant="body2" sx={{ opacity: 0.5 }}>
              Health factor
            </Typography>
            <Transition>
              <Typography variant="body2">{formatHealthFactor(user.healthFactor)}</Typography>
              <ArrowForward sx={{ fontSize: 14, opacity: 0.6 }} />
              <Typography
                variant="body2"
                color={Number(healthFactorAfter) < 1.5 ? 'error.main' : 'success.main'}
              >
                {formatHealthFactor(healthFactorAfter)}
              </Typography>
            </Transition>
          </OverviewRow>
        </OverviewSection>

        {blockingErrorMessage && <Alert severity="error">{blockingErrorMessage}</Alert>}
        {txError && <Alert severity="error">{txError.error || 'Transaction failed'}</Alert>}

        <Button
          variant="contained"
          size="large"
          fullWidth
          disabled={disabled}
          onClick={handleAction}
        >
          {mainTxState.loading ? 'Processing…' : `${titleAction} ${symbol} as collateral`}
        </Button>
      </ModalCard>
    </Dialog>
  );
}
