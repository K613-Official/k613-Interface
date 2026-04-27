import { ProtocolAction } from '@aave/contract-helpers';
import { Trans } from '@lingui/macro';
import { Box, Button, Typography } from '@mui/material';
import BigNumber from 'bignumber.js';
import { ModalType } from 'src/components/Modals/types';
import { useAppDataContext } from 'src/hooks/app-data-provider/useAppDataProvider';
import { useAssetCaps } from 'src/hooks/useAssetCaps';
import { useModalContext } from 'src/hooks/useModal';
import { useNetSupplied } from 'src/hooks/useNetSupplied';
import { useRootStore } from 'src/store/root';
import { useModalStore } from 'src/store/useModalStore';
import { DashboardReserve } from 'src/utils/dashboardSortUtils';
import { GENERAL } from 'src/utils/mixPanelEvents';
import { showExternalIncentivesTooltip } from 'src/utils/utils';
import { useShallow } from 'zustand/shallow';

import { ListColumn } from '../../../../components/lists/ListColumn';
import { isFeatureEnabled } from '../../../../utils/marketsAndNetworksConfig';
import { ListAPRColumn } from '../ListAPRColumn';
import { ListButtonsColumn } from '../ListButtonsColumn';
import { ListItemUsedAsCollateral } from '../ListItemUsedAsCollateral';
import { ListItemWrapper } from '../ListItemWrapper';

export const SuppliedPositionsListItem = ({
  reserve,
  underlyingBalance,
  underlyingBalanceUSD,
  usageAsCollateralEnabledOnUser,
  underlyingAsset,
}: DashboardReserve) => {
  const { user } = useAppDataContext();
  const { data: netSupplied, isLoading: nsLoading, error: nsError } = useNetSupplied();
  const { isIsolated, aIncentivesData, aTokenAddress, isFrozen, isActive, isPaused } = reserve;
  const principal = netSupplied?.[underlyingAsset.toLowerCase()];
  const earned =
    principal && Number(underlyingBalance) > 0
      ? new BigNumber(underlyingBalance).minus(principal)
      : null;

  console.warn('[NetSupplied DEBUG]', {
    asset: reserve.symbol,
    underlyingAsset: underlyingAsset.toLowerCase(),
    keys: netSupplied ? Object.keys(netSupplied) : null,
    principalStr: principal?.toString(),
    underlyingBalance,
    earnedStr: earned?.toString(),
    loading: nsLoading,
    error: nsError?.message,
  });
  const { openSwap } = useModalContext();
  const openModal = useModalStore((s) => s.openModal);
  const { debtCeiling } = useAssetCaps();
  const [trackEvent, currentMarketData, currentMarket] = useRootStore(
    useShallow((store) => [store.trackEvent, store.currentMarketData, store.currentMarket])
  );

  const showSwitchButton = isFeatureEnabled.liquiditySwap(currentMarketData);

  const canBeEnabledAsCollateral = user
    ? !debtCeiling.isMaxed &&
      reserve.reserveLiquidationThreshold !== '0' &&
      ((!reserve.isIsolated && !user.isInIsolationMode) ||
        user.isolatedReserve?.underlyingAsset === reserve.underlyingAsset ||
        (reserve.isIsolated && user.totalCollateralMarketReferenceCurrency === '0'))
    : false;

  const disableSwap = !isActive || isPaused || reserve.symbol == 'stETH';
  const disableWithdraw = !isActive || isPaused;
  const disableSupply = !isActive || isFrozen || isPaused;

  return (
    <ListItemWrapper
      symbol={reserve.symbol}
      iconSymbol={reserve.iconSymbol}
      name={reserve.name}
      detailsAddress={underlyingAsset}
      currentMarket={currentMarket}
      frozen={reserve.isFrozen}
      paused={isPaused}
      data-cy={`dashboardSuppliedListItem_${reserve.symbol.toUpperCase()}_${
        canBeEnabledAsCollateral && usageAsCollateralEnabledOnUser ? 'Collateral' : 'NoCollateral'
      }`}
      showSupplyCapTooltips
      showDebtCeilingTooltips
      showExternalIncentivesTooltips={showExternalIncentivesTooltip(
        reserve.symbol,
        currentMarket,
        ProtocolAction.supply
      )}
    >
      <ListColumn>
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
            <Typography
              variant="body2"
              color={Number(underlyingBalance) === 0 ? 'text.disabled' : 'text.main'}
            >
              {Number(underlyingBalance).toFixed(2)}
            </Typography>
            {earned && earned.gt(0) && (
              <Typography variant="caption" sx={{ color: 'success.main' }}>
                (+{earned.toFixed(earned.gte(1) ? 2 : 4)})
              </Typography>
            )}
          </Box>
          {Number(underlyingBalance) > 0 && (
            <Typography variant="caption" color="text.secondary">
              ${Number(underlyingBalanceUSD).toFixed(2)}
            </Typography>
          )}
        </Box>
      </ListColumn>

      <ListAPRColumn
        value={Number(reserve.supplyAPY)}
        market={currentMarket}
        protocolAction={ProtocolAction.supply}
        address={aTokenAddress}
        incentives={aIncentivesData}
        symbol={reserve.symbol}
      />

      <ListColumn>
        <ListItemUsedAsCollateral
          disabled={reserve.isPaused}
          isIsolated={isIsolated}
          usageAsCollateralEnabledOnUser={usageAsCollateralEnabledOnUser}
          canBeEnabledAsCollateral={canBeEnabledAsCollateral}
          onToggleSwitch={() => {
            trackEvent(GENERAL.OPEN_MODAL, {
              modal: 'Toggle Collateral',
              market: currentMarket,
              assetName: reserve.name,
              asset: underlyingAsset,
              usageAsCollateralEnabledOnUser,
              funnel: 'dashboard',
            });
            openModal(ModalType.CollateralChange, {
              underlyingAsset,
              usageAsCollateralEnabledOnUser,
            });
          }}
          data-cy={`collateralStatus`}
        />
      </ListColumn>

      <ListButtonsColumn>
        {showSwitchButton ? (
          <Button
            disabled={disableSwap}
            variant="contained"
            onClick={() => {
              // track

              trackEvent(GENERAL.OPEN_MODAL, {
                modal: 'Swap Collateral',
                market: currentMarket,
                assetName: reserve.name,
                asset: underlyingAsset,
              });
              openSwap(underlyingAsset);
            }}
            data-cy={`swapButton`}
          >
            <Trans>Switch</Trans>
          </Button>
        ) : (
          <Button
            disabled={disableSupply}
            variant="contained"
            onClick={() => openModal(ModalType.Supply, { underlyingAsset })}
          >
            <Trans>Supply</Trans>
          </Button>
        )}
        <Button
          disabled={disableWithdraw}
          variant="outlined"
          onClick={() => {
            openModal(ModalType.Withdraw, { underlyingAsset });
          }}
        >
          <Trans>Withdraw</Trans>
        </Button>
      </ListButtonsColumn>
    </ListItemWrapper>
  );
};
