import { valueToBigNumber } from '@aave/math-utils';
import { OpenInNew } from '@mui/icons-material';
import { Box, Link as MuiLink, Typography } from '@mui/material';
import Image from 'next/image';
import { useMemo, useState } from 'react';
import { FormattedNumber } from 'src/components/primitives/FormattedNumber';
import { getEmodeMessage } from 'src/components/transactions/Emode/EmodeNaming';
import { ComputedReserveData } from 'src/hooks/app-data-provider/useAppDataProvider';
import { useAssetCaps } from 'src/hooks/useAssetCaps';
import { BROKEN_ASSETS } from 'src/hooks/useReservesHistory';
import { ApyGraphContainer } from 'src/modules/reserve-overview/graphs/ApyGraphContainer';
import { useRootStore } from 'src/store/root';
import { useShallow } from 'zustand/shallow';

import { ApyChartPanel } from './ApyChartPanel';
import { DEFAULT_CHART_RANGE } from './const';
import { EmodeBlock } from './EmodeBlock';
import { StatusFlag } from './StatusFlag';
import {
  AssetIdentity,
  AssetTitleRow,
  CardBlockTitle,
  ConfigCard,
  DonutBlock,
  DonutInner,
  DonutPct,
  DonutRing,
  EmodeStack,
  FlagRow,
  GraphHost,
  MetricCell,
  MetricDivider,
  MetricsRow,
  OracleValueRow,
  PageWrapper,
  ParamRow,
  ParamRows,
  SectionShell,
  SectionTitle,
  SmallIconButton,
  StatCell,
  StatDivider,
  StatsAndInfoRow,
  StatsStrip,
  StatValueGroup,
  Subsection,
  SupplyBorrowMain,
  TopRows,
} from './styles';
import { ChartRange, EmodeCategory as EmodeCategoryType } from './types';
import { YourInfoPanel } from './YourInfoPanel';

function formatLiveApyCaption(value: string | number) {
  const pct = valueToBigNumber(value).multipliedBy(100).toFixed(2);
  return `Live ${pct}%`;
}

export function MarketAssetDetailsBody({ reserve }: { reserve: ComputedReserveData }) {
  const { supplyCap, borrowCap } = useAssetCaps();
  const [currentMarketData, currentNetworkConfig] = useRootStore(
    useShallow((s) => [s.currentMarketData, s.currentNetworkConfig])
  );

  const [supplyRange, setSupplyRange] = useState<ChartRange>(DEFAULT_CHART_RANGE);
  const [borrowRange, setBorrowRange] = useState<ChartRange>(DEFAULT_CHART_RANGE);

  const reserveChartId =
    reserve.underlyingAsset + currentMarketData.addresses.LENDING_POOL_ADDRESS_PROVIDER;
  const renderCharts =
    !!currentNetworkConfig.ratesHistoryApiUrl &&
    !currentMarketData.disableCharts &&
    !BROKEN_ASSETS.includes(reserveChartId);

  const showBorrowApyChart = reserve.borrowingEnabled || Number(reserve.totalDebt) > 0;

  const showSupplyCap = reserve.supplyCap !== '0';
  const showBorrowCap = reserve.borrowCap !== '0';

  const supplyDonutPct = useMemo(() => {
    if (showSupplyCap) {
      return Math.min(100, supplyCap.percentUsed);
    }
    return Math.min(100, Number(reserve.borrowUsageRatio) * 100);
  }, [showSupplyCap, supplyCap.percentUsed, reserve.borrowUsageRatio]);

  const borrowDonutPct = useMemo(() => {
    if (showBorrowCap) {
      return Math.min(100, borrowCap.percentUsed);
    }
    return Math.min(100, Number(reserve.borrowUsageRatio) * 100);
  }, [showBorrowCap, borrowCap.percentUsed, reserve.borrowUsageRatio]);

  const oracleExplorerUrl = currentNetworkConfig.explorerLinkBuilder({
    address: reserve.priceOracle,
  });

  const collectorAddress = currentMarketData.addresses.COLLECTOR;
  const collectorUrl = collectorAddress
    ? currentNetworkConfig.explorerLinkBuilder({ address: collectorAddress })
    : '';

  const tokenIconSrc = `/icons/tokens/${reserve.iconSymbol.toLowerCase()}.svg`;

  const canBeCollateral = reserve.reserveLiquidationThreshold !== '0';

  return (
    <PageWrapper>
      <TopRows>
        <AssetTitleRow>
          <AssetIdentity>
            <Image src={tokenIconSrc} width={40} height={40} alt={reserve.symbol} />
            <Box display="flex" flexDirection="column" gap={0.25}>
              <Typography variant="subtitle2" color="text.secondary">
                {reserve.symbol}
              </Typography>
              <Typography variant="h6">{reserve.name}</Typography>
            </Box>
          </AssetIdentity>
        </AssetTitleRow>
      </TopRows>

      <StatsAndInfoRow>
        <StatsStrip>
          <StatCell>
            <Typography variant="body2" color="text.secondary">
              Reserve Size
            </Typography>
            <StatValueGroup>
              <Typography variant="inherit" color="text.secondary">
                $
              </Typography>
              <FormattedNumber
                value={Math.max(Number(reserve.totalLiquidityUSD), 0)}
                variant="inherit"
                compact
              />
            </StatValueGroup>
          </StatCell>
          <StatDivider />
          <StatCell>
            <Typography variant="body2" color="text.secondary">
              Available liquidity
            </Typography>
            <StatValueGroup>
              <Typography variant="inherit" color="text.secondary">
                $
              </Typography>
              <FormattedNumber
                value={Math.max(Number(reserve.availableLiquidityUSD), 0)}
                variant="inherit"
                compact
              />
            </StatValueGroup>
          </StatCell>
          <StatDivider />
          <StatCell>
            <Typography variant="body2" color="text.secondary">
              Utilization Rate
            </Typography>
            <StatValueGroup>
              <FormattedNumber
                value={reserve.borrowUsageRatio}
                percent
                variant="inherit"
                visibleDecimals={2}
              />
            </StatValueGroup>
          </StatCell>
          <StatDivider />
          <StatCell>
            <Typography variant="body2" color="text.secondary">
              Oracle price
            </Typography>
            <OracleValueRow>
              <StatValueGroup>
                <Typography variant="inherit" color="text.secondary">
                  $
                </Typography>
                <FormattedNumber value={reserve.priceInUSD} variant="inherit" visibleDecimals={2} />
              </StatValueGroup>
              <SmallIconButton
                href={oracleExplorerUrl}
                target="_blank"
                rel="noopener noreferrer"
                size="small"
              >
                <OpenInNew fontSize="small" />
              </SmallIconButton>
            </OracleValueRow>
          </StatCell>
        </StatsStrip>

        <YourInfoPanel reserve={reserve} />
      </StatsAndInfoRow>

      <SectionShell elevation={0}>
        <SectionTitle>
          <Typography variant="h5">Reserve status & configuration</Typography>
        </SectionTitle>

        <ConfigCard>
          <CardBlockTitle>
            <Typography variant="body1">Supply Info</Typography>
          </CardBlockTitle>
          <SupplyBorrowMain>
            <DonutBlock>
              <DonutRing pct={supplyDonutPct} accent="#B9F6CA">
                <DonutInner>
                  <DonutPct variant="subtitle1">{supplyDonutPct.toFixed(2)}%</DonutPct>
                </DonutInner>
              </DonutRing>
            </DonutBlock>
            <MetricsRow>
              <MetricCell>
                <Typography variant="body2" color="text.secondary">
                  Total supplied
                </Typography>
                <Typography variant="h6" component="div">
                  {showSupplyCap ? (
                    <>
                      <FormattedNumber
                        value={reserve.totalLiquidity}
                        variant="inherit"
                        component="span"
                        compact
                      />
                      <Typography component="span" variant="h6">
                        {' '}
                        of{' '}
                      </Typography>
                      <FormattedNumber
                        value={reserve.supplyCap}
                        variant="inherit"
                        component="span"
                        compact
                      />
                    </>
                  ) : (
                    <FormattedNumber value={reserve.totalLiquidity} variant="inherit" compact />
                  )}
                </Typography>
                <Typography variant="body2" color="text.secondary" component="div">
                  {showSupplyCap ? (
                    <>
                      <FormattedNumber
                        value={reserve.totalLiquidityUSD}
                        variant="inherit"
                        component="span"
                        symbol="USD"
                        compact
                      />
                      <Typography component="span" variant="body2" color="text.secondary">
                        {' '}
                        of{' '}
                      </Typography>
                      <FormattedNumber
                        value={reserve.supplyCapUSD}
                        variant="inherit"
                        component="span"
                        symbol="USD"
                        compact
                      />
                    </>
                  ) : (
                    <FormattedNumber
                      value={reserve.totalLiquidityUSD}
                      variant="inherit"
                      symbol="USD"
                      compact
                    />
                  )}
                </Typography>
              </MetricCell>
              <MetricDivider />
              <MetricCell>
                <Typography variant="body2" color="text.secondary">
                  APY
                </Typography>
                <FormattedNumber
                  value={reserve.supplyAPY}
                  percent
                  variant="h6"
                  visibleDecimals={2}
                />
              </MetricCell>
            </MetricsRow>
          </SupplyBorrowMain>

          {renderCharts ? (
            <GraphHost>
              <ApyGraphContainer
                graphKey="supply"
                reserve={reserve}
                currentMarketData={currentMarketData}
              />
            </GraphHost>
          ) : (
            <ApyChartPanel
              title="Supply ARP"
              avgLabel={formatLiveApyCaption(reserve.supplyAPY)}
              range={supplyRange}
              onRangeChange={setSupplyRange}
              accent="supply"
            />
          )}

          <Subsection>
            <Typography variant="body1">Collateral usage</Typography>
            <FlagRow>
              <StatusFlag ok={canBeCollateral} label="Can be collateral" />
            </FlagRow>
            {canBeCollateral && (
              <ParamRows>
                <ParamRow>
                  <Typography variant="body2" color="text.secondary">
                    Max LTV
                  </Typography>
                  <FormattedNumber
                    value={reserve.formattedBaseLTVasCollateral}
                    percent
                    variant="h6"
                    visibleDecimals={2}
                  />
                </ParamRow>
                <ParamRow>
                  <Typography variant="body2" color="text.secondary">
                    Liquidation threshold
                  </Typography>
                  <FormattedNumber
                    value={reserve.formattedReserveLiquidationThreshold}
                    percent
                    variant="h6"
                    visibleDecimals={2}
                  />
                </ParamRow>
                <ParamRow>
                  <Typography variant="body2" color="text.secondary">
                    Liquidation penalty
                  </Typography>
                  <FormattedNumber
                    value={reserve.formattedReserveLiquidationBonus}
                    percent
                    variant="h6"
                    visibleDecimals={2}
                  />
                </ParamRow>
              </ParamRows>
            )}
          </Subsection>
        </ConfigCard>

        <ConfigCard>
          <CardBlockTitle>
            <Typography variant="body1">Borrow info</Typography>
          </CardBlockTitle>
          <SupplyBorrowMain>
            <DonutBlock>
              <DonutRing pct={borrowDonutPct} accent="#81D4FA">
                <DonutInner>
                  <DonutPct variant="subtitle1">{borrowDonutPct.toFixed(2)}%</DonutPct>
                </DonutInner>
              </DonutRing>
            </DonutBlock>
            <MetricsRow>
              <MetricCell>
                <Typography variant="body2" color="text.secondary">
                  Total borrowed
                </Typography>
                <Typography variant="h6" component="div">
                  {showBorrowCap ? (
                    <>
                      <FormattedNumber
                        value={reserve.totalDebt}
                        variant="inherit"
                        component="span"
                        compact
                      />
                      <Typography component="span" variant="h6">
                        {' '}
                        of{' '}
                      </Typography>
                      <FormattedNumber
                        value={reserve.borrowCap}
                        variant="inherit"
                        component="span"
                        compact
                      />
                    </>
                  ) : (
                    <FormattedNumber value={reserve.totalDebt} variant="inherit" compact />
                  )}
                </Typography>
                <Typography variant="body2" color="text.secondary" component="div">
                  {showBorrowCap ? (
                    <>
                      <FormattedNumber
                        value={reserve.totalDebtUSD}
                        variant="inherit"
                        component="span"
                        symbol="USD"
                        compact
                      />
                      <Typography component="span" variant="body2" color="text.secondary">
                        {' '}
                        of{' '}
                      </Typography>
                      <FormattedNumber
                        value={reserve.borrowCapUSD}
                        variant="inherit"
                        component="span"
                        symbol="USD"
                        compact
                      />
                    </>
                  ) : (
                    <FormattedNumber
                      value={reserve.totalDebtUSD}
                      variant="inherit"
                      symbol="USD"
                      compact
                    />
                  )}
                </Typography>
              </MetricCell>
              <MetricDivider />
              <MetricCell>
                <Typography variant="body2" color="text.secondary">
                  APY, variable
                </Typography>
                <FormattedNumber
                  value={reserve.variableBorrowAPY}
                  percent
                  variant="h6"
                  visibleDecimals={2}
                />
              </MetricCell>
              <MetricDivider />
              <MetricCell>
                <Typography variant="body2" color="text.secondary">
                  Borrow cap
                </Typography>
                {showBorrowCap ? (
                  <>
                    <FormattedNumber value={reserve.borrowCap} variant="h6" compact />
                    <FormattedNumber
                      value={reserve.borrowCapUSD}
                      variant="body2"
                      symbol="USD"
                      compact
                      color="text.secondary"
                    />
                  </>
                ) : (
                  <>
                    <Typography variant="h6">—</Typography>
                    <Typography variant="body2" color="text.secondary">
                      —
                    </Typography>
                  </>
                )}
              </MetricCell>
            </MetricsRow>
          </SupplyBorrowMain>

          {renderCharts && showBorrowApyChart ? (
            <GraphHost>
              <ApyGraphContainer
                graphKey="borrow"
                reserve={reserve}
                currentMarketData={currentMarketData}
              />
            </GraphHost>
          ) : !renderCharts ? (
            <ApyChartPanel
              title="Borrow APR, variable"
              avgLabel={formatLiveApyCaption(reserve.variableBorrowAPY)}
              range={borrowRange}
              onRangeChange={setBorrowRange}
              accent="borrow"
            />
          ) : null}
        </ConfigCard>

        {collectorAddress ? (
          <ConfigCard>
            <CardBlockTitle>
              <Typography variant="body1">Collector Info</Typography>
            </CardBlockTitle>
            <ParamRows>
              <ParamRow>
                <Typography variant="body2" color="text.secondary">
                  Reserve factor
                </Typography>
                <FormattedNumber
                  value={reserve.reserveFactor}
                  percent
                  variant="h6"
                  visibleDecimals={2}
                />
              </ParamRow>
              <ParamRow>
                <Typography variant="body2" color="text.secondary">
                  Collector Contract
                </Typography>
                <MuiLink
                  href={collectorUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  underline="always"
                  color="primary"
                >
                  View contract
                </MuiLink>
              </ParamRow>
            </ParamRows>
          </ConfigCard>
        ) : null}

        {reserve.eModes.length > 0 ? (
          <ConfigCard>
            <CardBlockTitle>
              <Typography variant="body1">E-Mode info</Typography>
            </CardBlockTitle>
            <EmodeStack>
              {reserve.eModes.map((e) => {
                const category: EmodeCategoryType = {
                  title: getEmodeMessage(e.eMode.label),
                  collateral: e.collateralEnabled ? 'yes' : 'no',
                  borrowable: e.borrowingEnabled ? 'yes' : 'no',
                  rows: [
                    {
                      label: 'Max LTV',
                      value: `${valueToBigNumber(e.eMode.formattedLtv)
                        .multipliedBy(100)
                        .toFixed(2)}%`,
                    },
                    {
                      label: 'Liquidation threshold',
                      value: `${valueToBigNumber(e.eMode.formattedLiquidationThreshold)
                        .multipliedBy(100)
                        .toFixed(2)}%`,
                    },
                    {
                      label: 'Liquidation penalty',
                      value: `${valueToBigNumber(e.eMode.formattedLiquidationBonus)
                        .multipliedBy(100)
                        .toFixed(2)}%`,
                    },
                  ],
                };
                return <EmodeBlock key={e.id} category={category} />;
              })}
            </EmodeStack>
          </ConfigCard>
        ) : null}
      </SectionShell>
    </PageWrapper>
  );
}
