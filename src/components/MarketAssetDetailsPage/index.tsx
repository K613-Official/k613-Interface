import { Check, OpenInNew, StarBorder } from '@mui/icons-material';
import { Box, Button, ButtonGroup, IconButton, Link as MuiLink, Skeleton, Typography } from '@mui/material';
import { valueToBigNumber } from '@aave/math-utils';
import Image from 'next/image';
import { useRouter } from 'next/router';
import { useMemo, useState } from 'react';
import Layout from 'src/components/Layout';
import MaxWidthContainer from 'src/components/MaxWidthContainer';
import { FormattedNumber } from 'src/components/primitives/FormattedNumber';
import { Link, ROUTES } from 'src/components/primitives/Link';
import { getEmodeMessage } from 'src/components/transactions/Emode/EmodeNaming';
import { ComputedReserveData, useAppDataContext } from 'src/hooks/app-data-provider/useAppDataProvider';
import { AssetCapsProvider, useAssetCaps } from 'src/hooks/useAssetCaps';
import { useRootStore } from 'src/store/root';
import { useShallow } from 'zustand/shallow';

import { ChartRange, EmodeCategory as EmodeCategoryType } from './const';
import {
  AssetIdentity,
  AssetTitleRow,
  CardBlockTitle,
  ChartAvgPill,
  ChartBlock,
  ChartPlaceholder,
  ChartTag,
  ChartToolbar,
  ConfigCard,
  DonutBlock,
  DonutInner,
  DonutRing,
  EmodeCategoryCard,
  EmodeStack,
  FlagItem,
  FlagRow,
  InstanceRow,
  MetricCell,
  MetricDivider,
  MetricsRow,
  OracleActions,
  PageWrapper,
  ParamRow,
  ParamRows,
  SectionShell,
  SectionTitle,
  StatCell,
  StatDivider,
  StatsStrip,
  Subsection,
  SupplyBorrowMain,
  TopRows,
  V3Badge,
} from './styles';

function StatusFlag({ ok, label }: { ok: boolean; label: string }) {
  return (
    <FlagItem>
      {ok ? (
        <Check sx={{ fontSize: 20, color: 'primary.main' }} />
      ) : (
        <Box
          sx={{
            width: 20,
            height: 20,
            borderRadius: '50%',
            border: '1px solid',
            borderColor: 'text.disabled',
          }}
        />
      )}
      <Typography variant="body1" color={ok ? 'primary' : 'text.disabled'}>
        {label}
      </Typography>
    </FlagItem>
  );
}

function ApyChartPanel({
  title,
  avgLabel,
  range,
  onRangeChange,
  accent,
}: {
  title: string;
  avgLabel: string;
  range: ChartRange;
  onRangeChange: (r: ChartRange) => void;
  accent: 'supply' | 'borrow';
}) {
  const stroke = accent === 'supply' ? '#4CAF50' : '#29B6F6';
  return (
    <ChartBlock>
      <ChartToolbar>
        <ChartTag>
          <Typography variant="subtitle2">{title}</Typography>
        </ChartTag>
        <ButtonGroup size="small" variant="outlined" color="inherit">
          {(['1w', '1m', '6m'] as const).map((r) => (
            <Button
              key={r}
              onClick={() => onRangeChange(r)}
              variant={range === r ? 'contained' : 'outlined'}
              color="inherit"
              sx={{ minWidth: 44, px: 1.5 }}
            >
              {r}
            </Button>
          ))}
        </ButtonGroup>
      </ChartToolbar>
      <ChartPlaceholder>
        <svg
          width="100%"
          height="100%"
          viewBox="0 0 400 140"
          preserveAspectRatio="none"
          style={{ opacity: 0.85 }}
        >
          <defs>
            <linearGradient id={`grad-${accent}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={stroke} stopOpacity="0.35" />
              <stop offset="100%" stopColor={stroke} stopOpacity="0" />
            </linearGradient>
          </defs>
          <path
            d="M0,100 C60,95 80,40 140,55 S220,20 280,48 S360,30 400,38 L400,140 L0,140 Z"
            fill={`url(#grad-${accent})`}
          />
          <path
            d="M0,100 C60,95 80,40 140,55 S220,20 280,48 S360,30 400,38"
            fill="none"
            stroke={stroke}
            strokeWidth="2"
            vectorEffect="non-scaling-stroke"
          />
        </svg>
        <ChartAvgPill>
          <Typography variant="caption">{avgLabel}</Typography>
        </ChartAvgPill>
      </ChartPlaceholder>
    </ChartBlock>
  );
}

function EmodeBlock({ category }: { category: EmodeCategoryType }) {
  return (
    <EmodeCategoryCard>
      <Box display="flex" flexDirection="column" gap={1.5}>
        <Typography variant="body1">{category.title}</Typography>
        <FlagRow>
          <StatusFlag ok={category.collateral === 'yes'} label="Collateral" />
          <StatusFlag ok={category.borrowable === 'yes'} label="Borrowable" />
        </FlagRow>
      </Box>
      <ParamRows>
        {category.rows.map((row) => (
          <ParamRow key={row.label}>
            <Typography variant="body2" color="text.secondary">
              {row.label}
            </Typography>
            <Typography variant="h6">{row.value}</Typography>
          </ParamRow>
        ))}
      </ParamRows>
    </EmodeCategoryCard>
  );
}

function formatLiveApyCaption(value: string | number) {
  const pct = valueToBigNumber(value).multipliedBy(100).toFixed(2);
  return `Live ${pct}%`;
}

function MarketAssetDetailsBody({ reserve }: { reserve: ComputedReserveData }) {
  const { supplyCap, borrowCap } = useAssetCaps();
  const [currentMarketData, currentNetworkConfig] = useRootStore(
    useShallow((s) => [s.currentMarketData, s.currentNetworkConfig])
  );

  const [supplyRange, setSupplyRange] = useState<ChartRange>('1w');
  const [borrowRange, setBorrowRange] = useState<ChartRange>('1w');

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
        <InstanceRow>
          <Image src="/icons/tokens/eth.svg" width={32} height={32} alt="" />
          <Typography
            component="span"
            sx={{ typography: { xs: 'h4', sm: 'h6' }, lineHeight: { xs: 1.2, sm: undefined } }}
          >
            {currentMarketData.marketTitle}
          </Typography>
          <V3Badge>
            <Typography variant="caption" component="span">
              Version 3
            </Typography>
          </V3Badge>
        </InstanceRow>

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
          <IconButton size="small" color="inherit" aria-label="Favorite">
            <StarBorder />
          </IconButton>
        </AssetTitleRow>
      </TopRows>

      <StatsStrip>
        <StatCell>
          <Typography variant="body2" color="text.secondary">
            Reserve Size
          </Typography>
          <Box display="flex" alignItems="baseline" gap={0.5}>
            <Typography variant="body2" color="text.secondary">
              $
            </Typography>
            <FormattedNumber
              value={Math.max(Number(reserve.totalLiquidityUSD), 0)}
              variant="h6"
              compact
            />
          </Box>
        </StatCell>
        <StatDivider />
        <StatCell>
          <Typography variant="body2" color="text.secondary">
            Available liquidity
          </Typography>
          <Box display="flex" alignItems="baseline" gap={0.5}>
            <Typography variant="body2" color="text.secondary">
              $
            </Typography>
            <FormattedNumber
              value={Math.max(Number(reserve.availableLiquidityUSD), 0)}
              variant="h6"
              compact
            />
          </Box>
        </StatCell>
        <StatDivider />
        <StatCell>
          <Typography variant="body2" color="text.secondary">
            Utilization Rate
          </Typography>
          <FormattedNumber value={reserve.borrowUsageRatio} percent variant="h6" visibleDecimals={2} />
        </StatCell>
        <StatDivider />
        <StatCell sx={{ minWidth: 200 }}>
          <Typography variant="body2" color="text.secondary">
            Oracle price
          </Typography>
          <OracleActions
            sx={{
              flexDirection: { xs: 'column', sm: 'row' },
              alignItems: { xs: 'flex-start', sm: 'center' },
            }}
          >
            <Box display="flex" alignItems="baseline" gap={0.5}>
              <Typography variant="body2" color="text.secondary">
                $
              </Typography>
              <FormattedNumber value={reserve.priceInUSD} variant="h6" visibleDecimals={2} />
            </Box>
            <Box display="flex" flexWrap="wrap" gap={1}>
              <Button
                component={MuiLink}
                href={oracleExplorerUrl}
                target="_blank"
                rel="noopener noreferrer"
                size="small"
                variant="outlined"
                color="primary"
                startIcon={<OpenInNew sx={{ fontSize: 18 }} />}
                sx={{ whiteSpace: 'nowrap' }}
              >
                Oracle
              </Button>
              <Button
                component={Link}
                href={ROUTES.markets}
                noLinkStyle
                variant="outlined"
                color="inherit"
                size="small"
                sx={{ whiteSpace: 'nowrap' }}
              >
                Go back
              </Button>
            </Box>
          </OracleActions>
        </StatCell>
      </StatsStrip>

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
                  <Typography variant="subtitle1" fontWeight={600}>
                    {supplyDonutPct.toFixed(2)}%
                  </Typography>
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
                      <FormattedNumber value={reserve.totalLiquidity} variant="inherit" component="span" compact />
                      <Typography component="span" variant="h6">
                        {' '}
                        of{' '}
                      </Typography>
                      <FormattedNumber value={reserve.supplyCap} variant="inherit" component="span" compact />
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
                <FormattedNumber value={reserve.supplyAPY} percent variant="h6" visibleDecimals={2} />
              </MetricCell>
            </MetricsRow>
          </SupplyBorrowMain>
          <ApyChartPanel
            title="Supply ARP"
            avgLabel={formatLiveApyCaption(reserve.supplyAPY)}
            range={supplyRange}
            onRangeChange={setSupplyRange}
            accent="supply"
          />
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
                  <Typography variant="subtitle1" fontWeight={600}>
                    {borrowDonutPct.toFixed(2)}%
                  </Typography>
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
                      <FormattedNumber value={reserve.totalDebt} variant="inherit" component="span" compact />
                      <Typography component="span" variant="h6">
                        {' '}
                        of{' '}
                      </Typography>
                      <FormattedNumber value={reserve.borrowCap} variant="inherit" component="span" compact />
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
                      sx={{ color: 'text.secondary' }}
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
          <ApyChartPanel
            title="Borrow APR, variable"
            avgLabel={formatLiveApyCaption(reserve.variableBorrowAPY)}
            range={borrowRange}
            onRangeChange={setBorrowRange}
            accent="borrow"
          />
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
                <FormattedNumber value={reserve.reserveFactor} percent variant="h6" visibleDecimals={2} />
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
                      value: `${valueToBigNumber(e.eMode.formattedLtv).multipliedBy(100).toFixed(2)}%`,
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

export default function MarketAssetDetailsPage() {
  const router = useRouter();
  const underlying = router.query.underlyingAsset as string | undefined;
  const { reserves, loading } = useAppDataContext();

  const reserve = useMemo(() => {
    if (!underlying) {
      return undefined;
    }
    const key = underlying.toLowerCase();
    return reserves.find((r) => r.underlyingAsset.toLowerCase() === key);
  }, [reserves, underlying]);

  const showLoading = !router.isReady || (loading && !reserve);
  const showMissing = router.isReady && !loading && !!underlying && !reserve;

  return (
    <Layout>
      <MaxWidthContainer>
        {showLoading ? (
          <PageWrapper>
            <TopRows>
              <Skeleton variant="rounded" width={280} height={40} />
              <Skeleton variant="rounded" width={220} height={48} />
            </TopRows>
            <StatsStrip>
              {[1, 2, 3, 4].map((i) => (
                <StatCell key={i}>
                  <Skeleton width={100} height={20} />
                  <Skeleton width={80} height={28} sx={{ mt: 0.5 }} />
                </StatCell>
              ))}
            </StatsStrip>
          </PageWrapper>
        ) : showMissing ? (
          <PageWrapper>
            <Typography variant="h6" sx={{ mb: 2 }}>
              Reserve not found for this market.
            </Typography>
            <Button component={Link} href={ROUTES.markets} noLinkStyle variant="outlined" color="inherit" size="small">
              Go back
            </Button>
          </PageWrapper>
        ) : reserve ? (
          <AssetCapsProvider asset={reserve}>
            <MarketAssetDetailsBody reserve={reserve} />
          </AssetCapsProvider>
        ) : (
          <PageWrapper>
            <Typography variant="h6" sx={{ mb: 2 }}>
              Select an asset from the markets list.
            </Typography>
            <Button component={Link} href={ROUTES.markets} noLinkStyle variant="outlined" color="inherit" size="small">
              Go to markets
            </Button>
          </PageWrapper>
        )}
      </MaxWidthContainer>
    </Layout>
  );
}
