import { valueToBigNumber } from '@aave/math-utils';
import { Search as SearchIcon, UnfoldMore as UnfoldMoreIcon } from '@mui/icons-material';
import {
  Box,
  Button,
  Checkbox,
  InputAdornment,
  ListItemText,
  ListSubheader,
  MenuItem,
  Select,
  SelectChangeEvent,
  Skeleton,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TableSortLabel,
  TextField,
  Typography,
} from '@mui/material';
import { useMemo, useState } from 'react';
import Layout from 'src/components/Layout';
import MaxWidthContainer from 'src/components/MaxWidthContainer';
import { BigStat } from 'src/components/primitives/BigStat';
import { FormattedNumber } from 'src/components/primitives/FormattedNumber';
import { Link, ROUTES } from 'src/components/primitives/Link';
import { TokenIcon } from 'src/components/primitives/TokenIcon';
import { useAppDataContext } from 'src/hooks/app-data-provider/useAppDataProvider';
import { useRootStore } from 'src/store/root';
import { CustomMarket } from 'src/ui-config/marketsConfig';
import { CATEGORY_LABELS, ReserveCategory, reserveCategory } from 'src/utils/reserveCategory';

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

type SortField =
  | 'symbol'
  | 'totalLiquidityUSD'
  | 'supplyAPY'
  | 'totalDebtUSD'
  | 'variableBorrowAPY';
type SortOrder = 'asc' | 'desc';

export default function MarketsPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [categories, setCategories] = useState<string[]>([]);
  const [sortBy, setSortBy] = useState<SortField>('totalLiquidityUSD');
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc');
  const currentMarket = useRootStore((s) => s.currentMarket) as CustomMarket;
  const { reserves, loading } = useAppDataContext();

  const handleSort = (field: SortField) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('desc');
    }
  };

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

  const availableCategories = useMemo(() => {
    const present = new Set<ReserveCategory>();
    reserves.forEach((r) => present.add(reserveCategory(r)));
    return Array.from(present);
  }, [reserves]);

  const handleCategoriesChange = (event: SelectChangeEvent<string[]>) => {
    const value = event.target.value;
    setCategories(typeof value === 'string' ? value.split(',') : value);
  };

  const resetCategories = () => setCategories([]);

  const filteredReserves = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    const filtered = reserves.filter((r) => {
      const matchesSearch =
        !q ||
        r.symbol.toLowerCase().includes(q) ||
        r.name.toLowerCase().includes(q) ||
        r.underlyingAsset.toLowerCase().includes(q);
      const cat = reserveCategory(r);
      const matchesCategory = categories.length === 0 || categories.includes(cat);
      return matchesSearch && matchesCategory;
    });
    const sorted = [...filtered].sort((a, b) => {
      if (sortBy === 'symbol') {
        return a.symbol.localeCompare(b.symbol);
      }
      const av = Number(a[sortBy] ?? 0);
      const bv = Number(b[sortBy] ?? 0);
      return av - bv;
    });
    return sortOrder === 'asc' ? sorted : sorted.reverse();
  }, [reserves, searchQuery, categories, sortBy, sortOrder]);

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
                <BigStat fontSizeXs={32} fontSizeMd={32} fontWeight={600} value={totals.supplyUsd.toString()} loading={showStatsSkeleton} />
              </StatItem>
              <VerticalDivider />
              <StatItem>
                <Typography variant="body2" color="text.secondary">
                  Total available
                </Typography>
                <BigStat fontSizeXs={32} fontSizeMd={32} fontWeight={600} value={totals.availableUsd.toString()} loading={showStatsSkeleton} />
              </StatItem>
              <VerticalDivider />
              <StatItem>
                <Typography variant="body2" color="text.secondary">
                  Total borrows
                </Typography>
                <BigStat fontSizeXs={32} fontSizeMd={32} fontWeight={600} value={totals.borrowUsd.toString()} loading={showStatsSkeleton} />
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
                      return s.map((v) => CATEGORY_LABELS[v as ReserveCategory] ?? v).join(', ');
                    }}
                  >
                    <ListSubheader
                      sx={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        bgcolor: 'background.paper',
                        lineHeight: '32px',
                        py: 0.5,
                      }}
                    >
                      <Typography variant="body2" color="text.secondary">
                        Select
                      </Typography>
                      <Button
                        size="small"
                        variant="text"
                        onClick={resetCategories}
                        sx={{
                          minWidth: 'auto',
                          textTransform: 'none',
                        }}
                      >
                        Reset
                      </Button>
                    </ListSubheader>
                    {availableCategories.map((c) => (
                      <MenuItem key={c} value={c} sx={{ pr: 1 }}>
                        <ListItemText primary={CATEGORY_LABELS[c]} />
                        <Checkbox
                          checked={categories.indexOf(c) > -1}
                          size="small"
                          sx={{
                            p: 0,
                            color: 'text.secondary',
                            '&.Mui-checked': { color: 'primary.main' },
                          }}
                        />
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
                  <Table sx={{ tableLayout: 'fixed' }}>
                    <TableHead>
                      <TableRow>
                        <TableCell sx={{ width: '22%' }}>
                          <TableSortLabel
                            active={sortBy === 'symbol'}
                            direction={sortBy === 'symbol' ? sortOrder : 'asc'}
                            onClick={() => handleSort('symbol')}
                            IconComponent={UnfoldMoreIcon}
                          >
                            Asset
                          </TableSortLabel>
                        </TableCell>
                        <TableCell align="center" sx={{ width: '16%' }}>
                          <TableSortLabel
                            active={sortBy === 'totalLiquidityUSD'}
                            direction={sortBy === 'totalLiquidityUSD' ? sortOrder : 'desc'}
                            onClick={() => handleSort('totalLiquidityUSD')}
                            IconComponent={UnfoldMoreIcon}
                          >
                            Total supplied
                          </TableSortLabel>
                        </TableCell>
                        <TableCell align="center" sx={{ width: '14%' }}>
                          <TableSortLabel
                            active={sortBy === 'supplyAPY'}
                            direction={sortBy === 'supplyAPY' ? sortOrder : 'desc'}
                            onClick={() => handleSort('supplyAPY')}
                            IconComponent={UnfoldMoreIcon}
                          >
                            Supply APY
                          </TableSortLabel>
                        </TableCell>
                        <TableCell align="center" sx={{ width: '16%' }}>
                          <TableSortLabel
                            active={sortBy === 'totalDebtUSD'}
                            direction={sortBy === 'totalDebtUSD' ? sortOrder : 'desc'}
                            onClick={() => handleSort('totalDebtUSD')}
                            IconComponent={UnfoldMoreIcon}
                          >
                            Total borrowed
                          </TableSortLabel>
                        </TableCell>
                        <TableCell align="center" sx={{ width: '18%' }}>
                          <TableSortLabel
                            active={sortBy === 'variableBorrowAPY'}
                            direction={sortBy === 'variableBorrowAPY' ? sortOrder : 'desc'}
                            onClick={() => handleSort('variableBorrowAPY')}
                            IconComponent={UnfoldMoreIcon}
                          >
                            Borrow APY, variable
                          </TableSortLabel>
                        </TableCell>
                        <TableCell align="right" sx={{ width: '14%' }} />
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {filteredReserves.map((row) => (
                        <TableRow key={row.underlyingAsset}>
                          <TableCell>
                            <Box display="flex" alignItems="center" gap={1.5}>
                              <TokenIcon symbol={row.iconSymbol} sx={{ fontSize: 32 }} />
                              <Box>
                                <Typography variant="body1">{row.name}</Typography>
                                <Typography variant="body2" color="text.secondary">
                                  {row.symbol}
                                </Typography>
                              </Box>
                            </Box>
                          </TableCell>
                          <TableCell align="center">
                            <Box>
                              <FormattedNumber
                                value={row.totalLiquidity}
                                variant="body1"
                                compact
                                sx={{ justifyContent: 'center' }}
                              />
                              <Box>
                                <FormattedNumber
                                  value={row.totalLiquidityUSD}
                                  variant="body2"
                                  symbol="USD"
                                  compact
                                  sx={{ color: 'text.secondary', justifyContent: 'center' }}
                                />
                              </Box>
                            </Box>
                          </TableCell>
                          <TableCell align="center">
                            <FormattedNumber
                              value={row.supplyAPY}
                              percent
                              variant="body1"
                              visibleDecimals={2}
                              sx={{ justifyContent: 'center' }}
                            />
                          </TableCell>
                          <TableCell align="center">
                            <Box>
                              <FormattedNumber
                                value={row.totalDebt}
                                variant="body1"
                                compact
                                sx={{ justifyContent: 'center' }}
                              />
                              <Box>
                                <FormattedNumber
                                  value={row.totalDebtUSD}
                                  variant="body2"
                                  symbol="USD"
                                  compact
                                  sx={{ color: 'text.secondary', justifyContent: 'center' }}
                                />
                              </Box>
                            </Box>
                          </TableCell>
                          <TableCell align="center">
                            {row.borrowingEnabled ? (
                              <FormattedNumber
                                value={row.variableBorrowAPY}
                                percent
                                variant="body1"
                                visibleDecimals={2}
                                sx={{ justifyContent: 'center' }}
                              />
                            ) : (
                              <Typography variant="body1">—</Typography>
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
                        <Box display="flex" alignItems="center" gap={1.5}>
                          <TokenIcon symbol={row.iconSymbol} sx={{ fontSize: 32 }} />
                          <Box>
                            <Typography variant="body1">{row.name}</Typography>
                            <Typography variant="body2" color="text.secondary">
                              {row.symbol}
                            </Typography>
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
