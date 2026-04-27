import { ProtocolAction } from '@aave/contract-helpers';
import { Trans } from '@lingui/macro';
import { Box, Button, Typography } from '@mui/material';
import BigNumber from 'bignumber.js';
import { ModalType } from 'src/components/Modals/types';
import { useAppDataContext } from 'src/hooks/app-data-provider/useAppDataProvider';
import { useAssetCaps } from 'src/hooks/useAssetCaps';
import { useNetSupplied } from 'src/hooks/useNetSupplied';
import { useRootStore } from 'src/store/root';
import { useModalStore } from 'src/store/useModalStore';
import { DashboardReserve } from 'src/utils/dashboardSortUtils';
import { GENERAL } from 'src/utils/mixPanelEvents';
import { showExternalIncentivesTooltip } from 'src/utils/utils';
import { useShallow } from 'zustand/shallow';

import { IncentivesCard } from '../../../../components/incentives/IncentivesCard';
import { Row } from '../../../../components/primitives/Row';
import { useModalContext } from '../../../../hooks/useModal';
import { isFeatureEnabled } from '../../../../utils/marketsAndNetworksConfig';
import { ListItemUsedAsCollateral } from '../ListItemUsedAsCollateral';
import { ListMobileItemWrapper } from '../ListMobileItemWrapper';
import { ListValueRow } from '../ListValueRow';

export const SuppliedPositionsListMobileItem = ({
  reserve,
  underlyingBalance,
  underlyingBalanceUSD,
  usageAsCollateralEnabledOnUser,
  underlyingAsset,
}: DashboardReserve) => {
  const { user } = useAppDataContext();
  const { data: netSupplied } = useNetSupplied();
  const principal = netSupplied?.[underlyingAsset.toLowerCase()];
  const earned =
    principal && Number(underlyingBalance) > 0
      ? new BigNumber(underlyingBalance).minus(principal)
      : null;
  const [currentMarketData, currentMarket, trackEvent] = useRootStore(
    useShallow((state) => [state.currentMarketData, state.currentMarket, state.trackEvent])
  );
  const { openSwap } = useModalContext();
  const openModal = useModalStore((s) => s.openModal);
  const { debtCeiling } = useAssetCaps();
  const isSwapButton = isFeatureEnabled.liquiditySwap(currentMarketData);
  const {
    symbol,
    iconSymbol,
    name,
    supplyAPY,
    isIsolated,
    aIncentivesData,
    aTokenAddress,
    isFrozen,
    isActive,
    isPaused,
  } = reserve;

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
    <ListMobileItemWrapper
      symbol={symbol}
      iconSymbol={iconSymbol}
      name={name}
      underlyingAsset={underlyingAsset}
      currentMarket={currentMarket}
      frozen={reserve.isFrozen}
      showSupplyCapTooltips
      showDebtCeilingTooltips
      showExternalIncentivesTooltips={showExternalIncentivesTooltip(
        reserve.symbol,
        currentMarket,
        ProtocolAction.supply
      )}
    >
      <ListValueRow
        title={<Trans>Supply balance</Trans>}
        value={Number(underlyingBalance)}
        subValue={Number(underlyingBalanceUSD)}
        disabled={Number(underlyingBalance) === 0}
        capsComponent={
          earned && earned.gt(0) ? (
            <Typography variant="caption" sx={{ ml: 0.5, color: 'success.main' }}>
              (+{earned.toFixed(earned.gte(1) ? 2 : 4)})
            </Typography>
          ) : undefined
        }
      />

      <Row caption={<Trans>Supply APY</Trans>} align="flex-start" captionVariant="body2" mb={2}>
        <IncentivesCard
          value={Number(supplyAPY)}
          incentives={aIncentivesData}
          address={aTokenAddress}
          symbol={symbol}
          variant="body2"
          market={currentMarket}
          protocolAction={ProtocolAction.supply}
        />
      </Row>

      <Row
        caption={<Trans>Used as collateral</Trans>}
        align={isIsolated ? 'flex-start' : 'center'}
        captionVariant="body2"
        mb={2}
      >
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
        />
      </Row>

      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mt: 5 }}>
        {isSwapButton ? (
          <Button
            disabled={disableSwap}
            variant="contained"
            onClick={() => openSwap(underlyingAsset)}
            fullWidth
          >
            <Trans>Switch</Trans>
          </Button>
        ) : (
          <Button
            disabled={disableSupply}
            variant="contained"
            onClick={() => openModal(ModalType.Supply, { underlyingAsset })}
            fullWidth
          >
            <Trans>Supply</Trans>
          </Button>
        )}
        <Button
          disabled={disableWithdraw}
          variant="outlined"
          onClick={() => openModal(ModalType.Withdraw, { underlyingAsset })}
          sx={{ ml: 1.5 }}
          fullWidth
        >
          <Trans>Withdraw</Trans>
        </Button>
      </Box>
    </ListMobileItemWrapper>
  );
};
