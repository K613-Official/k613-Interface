import { valueToBigNumber } from '@aave/math-utils';
import { Search as SearchIcon } from '@mui/icons-material';
import {
  Box,
  Button,
  InputAdornment,
  MenuItem,
  Select,
  SelectChangeEvent,
  Skeleton,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TextField,
  Typography,
} from '@mui/material';
import { useMemo, useState } from 'react';
import Layout from 'src/components/Layout';
import MaxWidthContainer from 'src/components/MaxWidthContainer';
import { FormattedNumber } from 'src/components/primitives/FormattedNumber';
import { Link, ROUTES } from 'src/components/primitives/Link';
import { TokenIcon } from 'src/components/primitives/TokenIcon';
import {
  ComputedReserveData,
  useAppDataContext,
} from 'src/hooks/app-data-provider/useAppDataProvider';
import { useRootStore } from 'src/store/root';
import { CustomMarket } from 'src/ui-config/marketsConfig';

import {
  CoreAssetsSection,
  CoreInstanceBlock,
  CoreInstanceInfo,
  DesktopTable,
  FiltersRow,
  MobileAssetCard,
  MobileCards,
  PageWrapper,
  StatItem,
  StatsCard,
  TablePaper,
  VerticalDivider,
} from './styles';

const STABLECOIN_SYMBOLS = new Set([
  'USDC',
  'USDT',
  'DAI',
  'FRAX',
  'LUSD',
  'GHO',
  'TUSD',
  'USDP',
  'PYUSD',
  'EURC',
  'BUSD',
  'SUSD',
  'USDBC',
  'USDS',
  'CRVUSD',
  'RLUSD',
  'EUSD',
  'USDE',
  'AUSD',
  'USDA',
  'DOLA',
  'MIM',
]);

function reserveCategory(reserve: ComputedReserveData): 'crypto' | 'stablecoin' {
  const raw = reserve.symbol.toUpperCase();
  const base = raw.split('.')[0];
  if (STABLECOIN_SYMBOLS.has(raw) || STABLECOIN_SYMBOLS.has(base)) {
    return 'stablecoin';
  }
  if (raw === 'USDC' || raw === 'USDT' || raw.endsWith('USDC') || raw.endsWith('USDT')) {
    return 'stablecoin';
  }
  return 'crypto';
}

const CATEGORY_OPTIONS = [
  { value: 'crypto', label: 'Crypto' },
  { value: 'stablecoin', label: 'Stablecoin' },
];

export default function MarketsPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [categories, setCategories] = useState<string[]>([]);
  const currentMarket = useRootStore((s) => s.currentMarket) as CustomMarket;
  const { reserves, loading } = useAppDataContext();

  const totals = useMemo(() => {
    return reserves.reduce(
      (acc, r) => ({
        supplyUsd: acc.supplyUsd.plus(r.totalLiquidityUSD),
        availableUsd: acc.availableUsd.plus(r.availableLiquidityUSD),
        borrowUsd: acc.borrowUsd.plus(r.totalDebtUSD),
      }),
      {
        supplyUsd: valueToBigNumber(0),
        availableUsd: valueToBigNumber(0),
        borrowUsd: valueToBigNumber(0),
      }
    );
  }, [reserves]);

  const handleCategoriesChange = (event: SelectChangeEvent<string[]>) => {
    const value = event.target.value;
    setCategories(typeof value === 'string' ? value.split(',') : value);
  };

  const filteredReserves = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return reserves.filter((r) => {
      const matchesSearch =
        !q ||
        r.symbol.toLowerCase().includes(q) ||
        r.name.toLowerCase().includes(q) ||
        r.underlyingAsset.toLowerCase().includes(q);
      const cat = reserveCategory(r);
      const matchesCategory = categories.length === 0 || categories.includes(cat);
      return matchesSearch && matchesCategory;
    });
  }, [reserves, searchQuery, categories]);

  const showStatsSkeleton = loading && reserves.length === 0;

  return (
    <Layout>
      <MaxWidthContainer>
        <PageWrapper>
          <CoreInstanceBlock>
            <CoreInstanceInfo>
              <Box display="flex" flexDirection="column" gap={1}>
                <Typography variant="h4">K613 Markets</Typography>
                <Typography variant="body2" color="text.secondary">
                  Supply assets to earn yield or borrow against collateral
                </Typography>
              </Box>
            </CoreInstanceInfo>

            <StatsCard>
              <StatItem>
                <Typography variant="body2" color="text.secondary">
                  Total market size
                </Typography>
                {showStatsSkeleton ? (
                  <Skeleton width={100} height={28} sx={{ mt: 0.5 }} />
                ) : (
                  <Typography variant="body1" component="div">
                    <Typography component="span" color="text.secondary">
                      ${' '}
                    </Typography>
                    <FormattedNumber
                      value={totals.supplyUsd.toString()}
                      variant="body1"
                      component="span"
                      color="text.primary"
                      compact
                    />
                  </Typography>
                )}
              </StatItem>
              <VerticalDivider />
              <StatItem>
                <Typography variant="body2" color="text.secondary">
                  Total available
                </Typography>
                {showStatsSkeleton ? (
                  <Skeleton width={100} height={28} sx={{ mt: 0.5 }} />
                ) : (
                  <Typography variant="body1" component="div">
                    <Typography component="span" color="text.secondary">
                      ${' '}
                    </Typography>
                    <FormattedNumber
                      value={totals.availableUsd.toString()}
                      variant="body1"
                      component="span"
                      color="text.primary"
                      compact
                    />
                  </Typography>
                )}
              </StatItem>
              <VerticalDivider />
              <StatItem>
                <Typography variant="body2" color="text.secondary">
                  Total borrows
                </Typography>
                {showStatsSkeleton ? (
                  <Skeleton width={100} height={28} sx={{ mt: 0.5 }} />
                ) : (
                  <Typography variant="body1" component="div">
                    <Typography component="span" color="text.secondary">
                      ${' '}
                    </Typography>
                    <FormattedNumber
                      value={totals.borrowUsd.toString()}
                      variant="body1"
                      component="span"
                      color="text.primary"
                      compact
                    />
                  </Typography>
                )}
              </StatItem>
            </StatsCard>
          </CoreInstanceBlock>

          <CoreAssetsSection>
            <Box display="flex" gap={2} justifyContent="space-between">
              <Typography variant="h5">Core assets</Typography>
              <FiltersRow>
                <Box display="flex" gap={2} flexWrap="wrap" justifyContent="flex-end">
                  <Select
                    multiple
                    size="small"
                    value={categories}
                    onChange={handleCategoriesChange}
                    variant="outlined"
                    displayEmpty
                    renderValue={(selected) => {
                      const s = selected as string[];
                      if (s.length === 0) {
                        return 'All categories';
                      }
                      return s
                        .map((v) => CATEGORY_OPTIONS.find((c) => c.value === v)?.label ?? v)
                        .join(', ');
                    }}
                  >
                    {CATEGORY_OPTIONS.map((c) => (
                      <MenuItem key={c.value} value={c.value}>
                        {c.label}
                      </MenuItem>
                    ))}
                  </Select>
                  <TextField
                    size="small"
                    placeholder="Search assets..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    variant="outlined"
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <SearchIcon fontSize="small" />
                        </InputAdornment>
                      ),
                    }}
                  />
                </Box>
              </FiltersRow>
            </Box>

            <TablePaper>
              {loading && reserves.length === 0 ? (
                <Box padding={4}>
                  <Skeleton variant="rounded" height={240} />
                </Box>
              ) : filteredReserves.length === 0 ? (
                <Box padding={4} textAlign="center">
                  <Typography variant="body1" color="text.secondary">
                    No assets match your search. Try adjusting filters.
                  </Typography>
                </Box>
              ) : (
                <DesktopTable>
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell>Asset</TableCell>
                        <TableCell align="right">Total supplied</TableCell>
                        <TableCell align="right">Supply APY</TableCell>
                        <TableCell align="right">Total borrowed</TableCell>
                        <TableCell align="right">Borrow APY, variable</TableCell>
                        <TableCell align="right" />
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {filteredReserves.map((row) => (
                        <TableRow key={row.underlyingAsset}>
                          <TableCell>
                            <Box display="flex" alignItems="center" gap={1}>
                              <TokenIcon symbol={row.iconSymbol} sx={{ fontSize: 24 }} />
                              <Box>
                                <Typography variant="body2" color="text.secondary">
                                  {row.name}
                                </Typography>
                                <Typography variant="body1">{row.symbol}</Typography>
                              </Box>
                            </Box>
                          </TableCell>
                          <TableCell align="right">
                            <Box>
                              <FormattedNumber value={row.totalLiquidity} variant="body2" compact />
                              <Box>
                                <FormattedNumber
                                  value={row.totalLiquidityUSD}
                                  variant="body2"
                                  symbol="USD"
                                  compact
                                  sx={{ color: 'text.secondary' }}
                                />
                              </Box>
                            </Box>
                          </TableCell>
                          <TableCell align="right">
                            <FormattedNumber
                              value={row.supplyAPY}
                              percent
                              variant="body2"
                              visibleDecimals={2}
                            />
                          </TableCell>
                          <TableCell align="right">
                            <Box>
                              <FormattedNumber value={row.totalDebt} variant="body2" compact />
                              <Box>
                                <FormattedNumber
                                  value={row.totalDebtUSD}
                                  variant="body2"
                                  symbol="USD"
                                  compact
                                  sx={{ color: 'text.secondary' }}
                                />
                              </Box>
                            </Box>
                          </TableCell>
                          <TableCell align="right">
                            {row.borrowingEnabled ? (
                              <FormattedNumber
                                value={row.variableBorrowAPY}
                                percent
                                variant="body2"
                                visibleDecimals={2}
                              />
                            ) : (
                              <Typography variant="body2">—</Typography>
                            )}
                          </TableCell>
                          <TableCell align="right">
                            <Button
                              size="small"
                              variant="contained"
                              color="secondary"
                              component={Link}
                              href={ROUTES.marketAssetDetails(row.underlyingAsset, currentMarket)}
                              noLinkStyle
                            >
                              Details
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </DesktopTable>
              )}

              {filteredReserves.length > 0 && (
                <MobileCards>
                  {filteredReserves.map((row) => (
                    <MobileAssetCard key={row.underlyingAsset}>
                      <Box display="flex" alignItems="center" justifyContent="space-between">
                        <Box display="flex" alignItems="center" gap={1}>
                          <TokenIcon symbol={row.iconSymbol} sx={{ fontSize: 24 }} />
                          <Box>
                            <Typography variant="body2">{row.name}</Typography>
                            <Typography variant="body1">{row.symbol}</Typography>
                          </Box>
                        </Box>
                      </Box>
                      <Box display="flex" flexDirection="column" gap={2}>
                        <Box display="flex" justifyContent="space-between">
                          <Typography variant="body2">Total supplied</Typography>
                          <Box textAlign="right">
                            <FormattedNumber value={row.totalLiquidity} variant="body2" compact />
                            <FormattedNumber
                              value={row.totalLiquidityUSD}
                              variant="body2"
                              symbol="USD"
                              compact
                              display="block"
                            />
                          </Box>
                        </Box>
                        <Box display="flex" justifyContent="space-between" alignItems="center">
                          <Typography variant="body2">Supply APY</Typography>
                          <FormattedNumber
                            value={row.supplyAPY}
                            percent
                            variant="body2"
                            visibleDecimals={2}
                          />
                        </Box>
                        <Box display="flex" justifyContent="space-between">
                          <Typography variant="body2">Total borrowed</Typography>
                          <Box textAlign="right">
                            <FormattedNumber value={row.totalDebt} variant="body2" compact />
                            <FormattedNumber
                              value={row.totalDebtUSD}
                              variant="body2"
                              symbol="USD"
                              compact
                              display="block"
                            />
                          </Box>
                        </Box>
                        <Box display="flex" justifyContent="space-between" alignItems="center">
                          <Typography variant="body2">Borrow APY</Typography>
                          {row.borrowingEnabled ? (
                            <FormattedNumber
                              value={row.variableBorrowAPY}
                              percent
                              variant="body2"
                              visibleDecimals={2}
                            />
                          ) : (
                            <Typography variant="body2">—</Typography>
                          )}
                        </Box>
                        <Button
                          variant="outlined"
                          fullWidth
                          component={Link}
                          href={ROUTES.marketAssetDetails(row.underlyingAsset, currentMarket)}
                          noLinkStyle
                        >
                          Details
                        </Button>
                      </Box>
                    </MobileAssetCard>
                  ))}
                </MobileCards>
              )}
            </TablePaper>
          </CoreAssetsSection>
        </PageWrapper>
      </MaxWidthContainer>
    </Layout>
  );
}
