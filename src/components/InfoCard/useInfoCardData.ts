import { API_ETH_MOCK_ADDRESS } from '@aave/contract-helpers';
import { valueToBigNumber } from '@aave/math-utils';
import { useMemo } from 'react';
import { useAppDataContext } from 'src/hooks/app-data-provider/useAppDataProvider';
import { useModalContext } from 'src/hooks/useModal';
import { useWeb3Context } from 'src/libs/hooks/useWeb3Context';
import { useRootStore } from 'src/store/root';
import { fetchIconSymbolAndName } from 'src/ui-config/reservePatches';
import { GHO_SYMBOL } from 'src/utils/ghoUtilities';

import { InfoCardType, InfoCardViewData, InfoPosition } from './data';

const formatCurrency = (value: string | number | undefined) => {
  const normalized = Number(value || 0);
  return `$${normalized.toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
};

const formatToken = (value: string | number | undefined) => {
  const normalized = Number(value || 0);
  return normalized.toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
};

const formatPercent = (value: string | number | undefined) => `${Number(value || 0).toFixed(2)}%`;

export function useInfoCardData(type: InfoCardType): {
  data: InfoCardViewData;
  isLoading: boolean;
} {
  const { currentAccount } = useWeb3Context();
  const { user, loading } = useAppDataContext();
  const { openWithdraw, openRepay, openCollateralChange } = useModalContext();
  const currentMarket = useRootStore((s) => s.currentMarket);
  const { baseAssetSymbol } = useRootStore((s) => s.currentNetworkConfig);

  const isLoading = Boolean(currentAccount) && loading;

  const data = useMemo<InfoCardViewData>(() => {
    const suppliedRaw =
      user?.userReservesData
        .filter((position) => position.underlyingBalance !== '0')
        .map((position) => {
          const reserveMeta = position.reserve.isWrappedBaseAsset
            ? fetchIconSymbolAndName({
                symbol: baseAssetSymbol,
                underlyingAsset: API_ETH_MOCK_ADDRESS.toLowerCase(),
              })
            : { iconSymbol: position.reserve.iconSymbol, name: position.reserve.name };

          const canToggleCollateral =
            position.reserve.reserveLiquidationThreshold !== '0' &&
            ((!position.reserve.isIsolated && !user?.isInIsolationMode) ||
              user?.isolatedReserve?.underlyingAsset === position.reserve.underlyingAsset ||
              (position.reserve.isIsolated &&
                user?.totalCollateralMarketReferenceCurrency === '0'));

          return {
            id: position.underlyingAsset,
            name: reserveMeta.name,
            symbol: position.reserve.symbol,
            iconSymbol: reserveMeta.iconSymbol,
            primaryLabel: 'Balance' as const,
            primaryValue: formatToken(position.underlyingBalance),
            secondaryValue: formatCurrency(position.underlyingBalanceUSD),
            apy: formatPercent(position.reserve.supplyAPY),
            collateralEnabled: Boolean(position.usageAsCollateralEnabledOnUser),
            canToggleCollateral,
            disableAction: !position.reserve.isActive || position.reserve.isPaused,
            onAction: () =>
              openWithdraw(
                position.underlyingAsset,
                currentMarket,
                position.reserve.name,
                'dashboard'
              ),
            onToggleCollateral: () =>
              openCollateralChange(
                position.underlyingAsset,
                currentMarket,
                position.reserve.name,
                'dashboard',
                position.usageAsCollateralEnabledOnUser
              ),
            usdSortValue: Number(position.underlyingBalanceUSD),
          };
        })
        .sort((a, b) => b.usdSortValue - a.usdSortValue)
        .map(({ usdSortValue, ...position }) => position) || [];

    const borrowedRaw =
      user?.userReservesData
        .filter((position) => position.variableBorrows !== '0')
        .map((position) => {
          const reserveMeta = position.reserve.isWrappedBaseAsset
            ? fetchIconSymbolAndName({
                symbol: baseAssetSymbol,
                underlyingAsset: API_ETH_MOCK_ADDRESS.toLowerCase(),
              })
            : { iconSymbol: position.reserve.iconSymbol, name: position.reserve.name };

          return {
            id: position.underlyingAsset,
            name: reserveMeta.name,
            symbol: position.reserve.symbol,
            iconSymbol: reserveMeta.iconSymbol,
            primaryLabel: 'Debt' as const,
            primaryValue: formatToken(position.variableBorrows),
            secondaryValue: formatCurrency(position.variableBorrowsUSD),
            apy: formatPercent(position.reserve.variableBorrowAPY),
            disableAction: !position.reserve.isActive || position.reserve.isPaused,
            onAction: () =>
              openRepay(
                position.underlyingAsset,
                position.reserve.isFrozen,
                currentMarket,
                position.reserve.name,
                'dashboard'
              ),
            usdSortValue: Number(position.variableBorrowsUSD),
          };
        })
        .sort((a, b) => b.usdSortValue - a.usdSortValue)
        .map(({ usdSortValue, ...position }) => position) || [];

    const ghoIndex = borrowedRaw.findIndex((position) => position.symbol === GHO_SYMBOL);
    if (ghoIndex > 0) {
      const [ghoPosition] = borrowedRaw.splice(ghoIndex, 1);
      borrowedRaw.unshift(ghoPosition);
    }

    const borrowPowerDenominator = valueToBigNumber(
      user?.totalBorrowsMarketReferenceCurrency || '0'
    ).plus(user?.availableBorrowsMarketReferenceCurrency || '0');
    const borrowPowerUsed = borrowPowerDenominator.eq(0)
      ? 0
      : valueToBigNumber(user?.totalBorrowsMarketReferenceCurrency || '0')
          .div(borrowPowerDenominator)
          .multipliedBy(100)
          .toNumber();

    const supplyData: InfoCardViewData = {
      title: 'Your supplies',
      actionLabel: 'Withdraw',
      emptyText: 'Nothing supplied yet',
      metrics: [
        { label: 'Balance', value: formatCurrency(user?.totalLiquidityUSD) },
        { label: 'APY', value: formatPercent(user?.earnedAPY), showAlert: true },
        { label: 'Collateral', value: formatCurrency(user?.totalCollateralUSD), showAlert: true },
      ],
      positions: suppliedRaw as InfoPosition[],
    };

    const borrowData: InfoCardViewData = {
      title: 'Your borrows',
      extra: 'E-Mode',
      actionLabel: 'Repay',
      emptyText: 'Nothing borrowed yet',
      metrics: [
        { label: 'Balance', value: formatCurrency(user?.totalBorrowsUSD) },
        { label: 'APY', value: formatPercent(user?.debtAPY), showAlert: true },
        { label: 'Borrow power used', value: formatPercent(borrowPowerUsed), showAlert: true },
      ],
      positions: borrowedRaw as InfoPosition[],
    };

    return type === 'supply' ? supplyData : borrowData;
  }, [user, type, baseAssetSymbol, currentMarket, openCollateralChange, openRepay, openWithdraw]);

  return { data, isLoading };
}
