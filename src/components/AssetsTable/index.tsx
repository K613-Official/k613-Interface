'use client';

import { API_ETH_MOCK_ADDRESS } from '@aave/contract-helpers';
import { USD_DECIMALS, valueToBigNumber } from '@aave/math-utils';
import { Check, MoreHorizOutlined } from '@mui/icons-material';
import {
  Alert,
  Box,
  Button,
  Checkbox,
  CircularProgress,
  FormControlLabel,
  IconButton,
  Menu,
  MenuItem,
  Select,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableFooter,
  TableHead,
  TablePagination,
  TableRow,
  Typography,
} from '@mui/material';
import { BigNumber } from 'bignumber.js';
import { useEffect, useMemo, useState } from 'react';
import { SortIcon } from 'src/components/InfoCard/positionStyles';
import { ModalType } from 'src/components/Modals/types';
import { ROUTES } from 'src/components/primitives/Link';
import { TokenIcon } from 'src/components/primitives/TokenIcon';
import { toggleLocalStorageClick } from 'src/helpers/toggle-local-storage-click';
import {
  ComputedReserveData,
  useAppDataContext,
} from 'src/hooks/app-data-provider/useAppDataProvider';
import { useWalletBalances } from 'src/hooks/app-data-provider/useWalletBalances';
import { useWrappedTokens } from 'src/hooks/useWrappedTokens';
import { useWeb3Context } from 'src/libs/hooks/useWeb3Context';
import { useRootStore } from 'src/store/root';
import { useModalStore } from 'src/store/useModalStore';
import { CustomMarket } from 'src/ui-config/marketsConfig';
import { fetchIconSymbolAndName } from 'src/ui-config/reservePatches';
import {
  assetCanBeBorrowedByUser,
  getMaxAmountAvailableToBorrow,
} from 'src/utils/getMaxAmountAvailableToBorrow';
import {
  displayGhoForMintableMarket,
  findAndFilterMintableGhoReserve,
} from 'src/utils/ghoUtilities';

import { DesktopTable, MobileAssetCard, MobileCards, MobilePagination, Paper } from './styles';

type SortKey = 'assets' | 'amount' | 'apy';

type SupplyRow = {
  id: string;
  symbol: string;
  iconSymbol: string;
  name: string;
  underlyingAsset: string;
  walletBalanceNum: number;
  walletBalanceStr: string;
  apyPercent: number;
  canBeCollateral: boolean;
  disableSupply: boolean;
};

type BorrowRow = {
  id: string;
  symbol: string;
  iconSymbol: string;
  name: string;
  underlyingAsset: string;
  availableBorrows: number;
  borrowApyPercent: number;
  disableBorrow: boolean;
};

const ROWS_PER_PAGE = 10;

const SHOW_SUPPLY_ZERO_BALANCE_KEY = 'showSupplyZeroAssets';
const DEFAULT_SORT_DIRECTION: Record<SortKey, 'asc' | 'desc'> = {
  assets: 'asc',
  amount: 'desc',
  apy: 'desc',
};

export default function AssetsTable({ type }: { type: 'supply' | 'borrow' }) {
  const isSupply = type === 'supply';
  const { currentAccount } = useWeb3Context();
  const openModal = useModalStore((s) => s.openModal);

  const currentMarketData = useRootStore((s) => s.currentMarketData);
  const currentMarket = useRootStore((s) => s.currentMarket);
  const { baseAssetSymbol, name: networkName } = useRootStore((s) => s.currentNetworkConfig);

  const {
    user,
    reserves,
    marketReferencePriceInUsd,
    loading: loadingReserves,
  } = useAppDataContext();
  const {
    walletBalances,
    hasEmptyWallet,
    loading: loadingWallet,
  } = useWalletBalances(currentMarketData);
  const wrappedTokenReserves = useWrappedTokens();

  const [sortKey, setSortKey] = useState<SortKey>('assets');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const [isOpen, setIsOpen] = useState(true);
  const [menuAnchor, setMenuAnchor] = useState<HTMLElement | null>(null);
  const [menuRow, setMenuRow] = useState<SupplyRow | null>(null);
  const [isAlertShown, setIsAlertShown] = useState(true);
  const [page, setPage] = useState(0);
  const [showZeroBalanceSupplyAssets, setShowZeroBalanceSupplyAssets] = useState(
    () =>
      typeof window !== 'undefined' && localStorage.getItem(SHOW_SUPPLY_ZERO_BALANCE_KEY) === 'true'
  );

  const dataLoading = loadingReserves || loadingWallet;

  const supplyRows: SupplyRow[] = useMemo(() => {
    if (!isSupply) return [];

    const tokensToSupply = reserves
      .filter(
        (reserve: ComputedReserveData) =>
          !(reserve.isFrozen || reserve.isPaused) &&
          !displayGhoForMintableMarket({ symbol: reserve.symbol, currentMarket })
      )
      .map((reserve: ComputedReserveData) => {
        const walletBalance = walletBalances[reserve.underlyingAsset]?.amount;
        const walletBalanceUSD = walletBalances[reserve.underlyingAsset]?.amountUSD;
        let availableToDeposit = valueToBigNumber(walletBalance);
        if (reserve.supplyCap !== '0') {
          availableToDeposit = BigNumber.min(
            availableToDeposit,
            new BigNumber(reserve.supplyCap).minus(reserve.totalLiquidity).multipliedBy('0.995')
          );
        }
        const availableToDepositUSD = valueToBigNumber(availableToDeposit)
          .multipliedBy(reserve.priceInMarketReferenceCurrency)
          .multipliedBy(marketReferencePriceInUsd)
          .shiftedBy(-USD_DECIMALS)
          .toString();

        const isIsolated = reserve.isIsolated;
        const hasDifferentCollateral = user?.userReservesData.find(
          (userRes) => userRes.usageAsCollateralEnabledOnUser && userRes.reserve.id !== reserve.id
        );

        const usageAsCollateralEnabledOnUser = !user?.isInIsolationMode
          ? reserve.reserveLiquidationThreshold !== '0' &&
            (!isIsolated || (isIsolated && !hasDifferentCollateral))
          : !isIsolated
          ? false
          : !hasDifferentCollateral;

        if (reserve.isWrappedBaseAsset) {
          let baseAvailableToDeposit = valueToBigNumber(
            walletBalances[API_ETH_MOCK_ADDRESS.toLowerCase()]?.amount
          );
          if (reserve.supplyCap !== '0') {
            baseAvailableToDeposit = BigNumber.min(
              baseAvailableToDeposit,
              new BigNumber(reserve.supplyCap).minus(reserve.totalLiquidity).multipliedBy('0.995')
            );
          }
          const baseAvailableToDepositUSD = valueToBigNumber(baseAvailableToDeposit)
            .multipliedBy(reserve.priceInMarketReferenceCurrency)
            .multipliedBy(marketReferencePriceInUsd)
            .shiftedBy(-USD_DECIMALS)
            .toString();
          return [
            {
              ...reserve,
              reserve,
              underlyingAsset: API_ETH_MOCK_ADDRESS.toLowerCase(),
              ...fetchIconSymbolAndName({
                symbol: baseAssetSymbol,
                underlyingAsset: API_ETH_MOCK_ADDRESS.toLowerCase(),
              }),
              walletBalance: walletBalances[API_ETH_MOCK_ADDRESS.toLowerCase()]?.amount,
              walletBalanceUSD: walletBalances[API_ETH_MOCK_ADDRESS.toLowerCase()]?.amountUSD,
              availableToDeposit: baseAvailableToDeposit.toString(),
              availableToDepositUSD: baseAvailableToDepositUSD,
              usageAsCollateralEnabledOnUser,
              detailsAddress: reserve.underlyingAsset,
              id: reserve.id + 'base',
            },
            {
              ...reserve,
              reserve,
              walletBalance,
              walletBalanceUSD,
              availableToDeposit:
                availableToDeposit.toNumber() <= 0 ? '0' : availableToDeposit.toString(),
              availableToDepositUSD:
                Number(availableToDepositUSD) <= 0 ? '0' : availableToDepositUSD.toString(),
              usageAsCollateralEnabledOnUser,
              detailsAddress: reserve.underlyingAsset,
            },
          ];
        }

        return {
          ...reserve,
          reserve,
          walletBalance,
          walletBalanceUSD,
          availableToDeposit:
            availableToDeposit.toNumber() <= 0 ? '0' : availableToDeposit.toString(),
          availableToDepositUSD:
            Number(availableToDepositUSD) <= 0 ? '0' : availableToDepositUSD.toString(),
          usageAsCollateralEnabledOnUser,
          detailsAddress: reserve.underlyingAsset,
        };
      })
      .flat();

    const sortedSupplyReserves = [...tokensToSupply].sort((a, b) =>
      +a.walletBalanceUSD > +b.walletBalanceUSD ? -1 : 1
    );

    const filteredSupplyReserves = sortedSupplyReserves.filter((reserve) => {
      if (reserve.availableToDepositUSD !== '0') {
        return true;
      }
      const wrappedTokenConfig = wrappedTokenReserves.find(
        (r) => r.tokenOut.underlyingAsset === reserve.underlyingAsset
      );
      if (!wrappedTokenConfig) {
        return false;
      }
      return walletBalances[wrappedTokenConfig.tokenIn.underlyingAsset]?.amount !== '0';
    });

    const list = showZeroBalanceSupplyAssets
      ? sortedSupplyReserves
      : filteredSupplyReserves.length >= 1
      ? filteredSupplyReserves
      : sortedSupplyReserves;

    return list.map((item) => {
      const wb = item.walletBalance ?? '0';
      const walletBalanceNum = Number(wb);
      const wrappedToken = wrappedTokenReserves.find(
        (r) => r.tokenOut.underlyingAsset === item.underlyingAsset
      );
      const canSupplyAsWrappedToken =
        !!wrappedToken &&
        walletBalances[wrappedToken.tokenIn.underlyingAsset.toLowerCase()]?.amount !== '0';

      const disableSupply =
        !item.isActive || item.isFrozen || (walletBalanceNum <= 0 && !canSupplyAsWrappedToken);

      return {
        id: String(item.id ?? item.underlyingAsset),
        symbol: item.symbol,
        iconSymbol: item.iconSymbol,
        name: item.name,
        underlyingAsset: item.underlyingAsset,
        walletBalanceNum,
        walletBalanceStr: wb,
        apyPercent: Number(item.supplyAPY),
        canBeCollateral: Boolean(item.usageAsCollateralEnabledOnUser),
        disableSupply,
      };
    });
  }, [
    isSupply,
    reserves,
    walletBalances,
    user,
    currentMarket,
    baseAssetSymbol,
    wrappedTokenReserves,
    marketReferencePriceInUsd,
    showZeroBalanceSupplyAssets,
  ]);

  const borrowRows: BorrowRow[] = useMemo(() => {
    if (isSupply) return [];

    const tokensToBorrow = reserves
      .filter((reserve) => (user ? assetCanBeBorrowedByUser(reserve, user) : false))
      .map((reserve: ComputedReserveData) => {
        const availableBorrows = user ? Number(getMaxAmountAvailableToBorrow(reserve, user)) : 0;
        const availableBorrowsInUSD = valueToBigNumber(availableBorrows)
          .multipliedBy(reserve.formattedPriceInMarketReferenceCurrency)
          .multipliedBy(marketReferencePriceInUsd)
          .shiftedBy(-USD_DECIMALS)
          .toFixed(2);

        return {
          ...reserve,
          totalBorrows: reserve.totalDebt,
          availableBorrows,
          availableBorrowsInUSD,
          variableBorrowRate: reserve.borrowingEnabled ? Number(reserve.variableBorrowAPY) : -1,
          iconSymbol: reserve.iconSymbol,
          ...(reserve.isWrappedBaseAsset
            ? fetchIconSymbolAndName({
                symbol: baseAssetSymbol,
                underlyingAsset: API_ETH_MOCK_ADDRESS.toLowerCase(),
              })
            : {}),
        };
      });

    const maxBorrowAmount = valueToBigNumber(user?.totalBorrowsMarketReferenceCurrency || '0').plus(
      user?.availableBorrowsMarketReferenceCurrency || '0'
    );
    const collateralUsagePercent = maxBorrowAmount.eq(0)
      ? '0'
      : valueToBigNumber(user?.totalBorrowsMarketReferenceCurrency || '0')
          .div(maxBorrowAmount)
          .toFixed();

    const borrowReserves =
      user?.totalCollateralMarketReferenceCurrency === '0' || +collateralUsagePercent >= 0.98
        ? tokensToBorrow
        : tokensToBorrow.filter(({ availableBorrowsInUSD, totalLiquidityUSD, symbol }) => {
            if (displayGhoForMintableMarket({ symbol, currentMarket })) return true;
            return availableBorrowsInUSD !== '0.00' && totalLiquidityUSD !== '0';
          });

    const { value: ghoReserve, filtered: filteredReserves } = findAndFilterMintableGhoReserve(
      borrowReserves,
      currentMarket
    );

    const flat = [...(ghoReserve ? [ghoReserve] : []), ...filteredReserves];

    return flat.map((item) => ({
      id: item.underlyingAsset,
      symbol: item.symbol,
      iconSymbol: item.iconSymbol,
      name: item.name,
      underlyingAsset: item.underlyingAsset,
      availableBorrows: item.availableBorrows,
      borrowApyPercent: item.variableBorrowRate,
      disableBorrow: item.isFrozen || Number(item.availableBorrows) <= 0,
    }));
  }, [isSupply, reserves, user, marketReferencePriceInUsd, currentMarket, baseAssetSymbol]);

  const sortedSupplyRows = useMemo(() => {
    if (!isSupply) return [];
    const copy = [...supplyRows];
    copy.sort((a, b) => {
      let diff = 0;
      switch (sortKey) {
        case 'assets':
          diff = a.symbol.localeCompare(b.symbol);
          break;
        case 'amount':
          diff =
            (Number.isFinite(a.walletBalanceNum) ? a.walletBalanceNum : 0) -
            (Number.isFinite(b.walletBalanceNum) ? b.walletBalanceNum : 0);
          break;
        case 'apy':
          diff =
            (Number.isFinite(a.apyPercent) ? a.apyPercent : -Infinity) -
            (Number.isFinite(b.apyPercent) ? b.apyPercent : -Infinity);
          break;
      }
      if (diff === 0) {
        diff = a.symbol.localeCompare(b.symbol);
      }
      return sortDirection === 'asc' ? diff : -diff;
    });
    return copy;
  }, [isSupply, supplyRows, sortKey, sortDirection]);

  const sortedBorrowRows = useMemo(() => {
    if (isSupply) return [];
    const copy = [...borrowRows];
    copy.sort((a, b) => {
      let diff = 0;
      switch (sortKey) {
        case 'assets':
          diff = a.symbol.localeCompare(b.symbol);
          break;
        case 'amount':
          diff =
            (Number.isFinite(a.availableBorrows) ? a.availableBorrows : 0) -
            (Number.isFinite(b.availableBorrows) ? b.availableBorrows : 0);
          break;
        case 'apy':
          diff =
            (Number.isFinite(a.borrowApyPercent) ? a.borrowApyPercent : -Infinity) -
            (Number.isFinite(b.borrowApyPercent) ? b.borrowApyPercent : -Infinity);
          break;
      }
      if (diff === 0) {
        diff = a.symbol.localeCompare(b.symbol);
      }
      return sortDirection === 'asc' ? diff : -diff;
    });
    return copy;
  }, [isSupply, borrowRows, sortKey, sortDirection]);

  const displayRows = isSupply ? sortedSupplyRows : sortedBorrowRows;

  useEffect(() => {
    setPage(0);
  }, [type]);

  useEffect(() => {
    setPage((p) => {
      const pageCount = Math.max(1, Math.ceil(displayRows.length / ROWS_PER_PAGE));
      const maxPage = pageCount - 1;
      return p > maxPage ? maxPage : p;
    });
  }, [displayRows.length]);

  const paginatedRows = useMemo(() => {
    const start = page * ROWS_PER_PAGE;
    return displayRows.slice(start, start + ROWS_PER_PAGE);
  }, [displayRows, page]);
  const pageCount = Math.max(1, Math.ceil(displayRows.length / ROWS_PER_PAGE));

  const handleRequestSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortDirection((prev) => (prev === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortKey(key);
      setSortDirection(DEFAULT_SORT_DIRECTION[key]);
    }
  };

  const showSupplyEmptyAlert =
    isSupply && Boolean(currentAccount) && hasEmptyWallet && !dataLoading && isAlertShown;

  const showBorrowCollateralAlert =
    !isSupply &&
    Boolean(currentAccount) &&
    user?.totalCollateralMarketReferenceCurrency === '0' &&
    !dataLoading &&
    isAlertShown;
  const showInitialLoading = Boolean(currentAccount) && dataLoading && displayRows.length === 0;

  return (
    <Paper isOpen={isOpen}>
      <Stack spacing={isSupply ? 1 : 0} mb={3}>
        <Stack direction="row" justifyContent="space-between" alignItems="center">
          <Typography variant="h6">{isSupply ? 'Assets to supply' : 'Assets to borrow'}</Typography>

          <Stack direction="row" spacing={2} alignItems="center">
            <Select size="small" defaultValue="all">
              <MenuItem value="all">All categories</MenuItem>
            </Select>
            <Button variant="text" color="secondary" onClick={() => setIsOpen(!isOpen)}>
              {isOpen ? 'Hide –' : 'Show +'}
            </Button>
          </Stack>
        </Stack>

        {isSupply && (
          <FormControlLabel
            sx={{ m: 0, paddingTop: 1, alignSelf: 'flex-start' }}
            control={<Checkbox size="small" sx={{ py: 0.5 }} />}
            checked={showZeroBalanceSupplyAssets}
            onChange={() =>
              toggleLocalStorageClick(
                showZeroBalanceSupplyAssets,
                setShowZeroBalanceSupplyAssets,
                SHOW_SUPPLY_ZERO_BALANCE_KEY
              )
            }
            label={
              <Typography variant="body2" color="text.secondary">
                Show assets with 0 balance
              </Typography>
            }
          />
        )}
      </Stack>

      {showSupplyEmptyAlert && (
        <Alert severity="warning" onClose={() => setIsAlertShown(false)}>
          Your {networkName} wallet is empty. Purchase or transfer assets.
        </Alert>
      )}

      {showBorrowCollateralAlert && (
        <Alert severity="warning" onClose={() => setIsAlertShown(false)}>
          To borrow you need to supply any asset to be used as collateral.
        </Alert>
      )}

      {!currentAccount ? (
        <Typography color="text.secondary" py={2}>
          Connect your wallet to see assets.
        </Typography>
      ) : showInitialLoading ? (
        <Stack alignItems="center" py={4}>
          <CircularProgress size={32} />
        </Stack>
      ) : displayRows.length === 0 ? (
        <Typography color="text.secondary">No assets in this market.</Typography>
      ) : (
        <>
          <DesktopTable>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>
                    <Box sx={{ display: 'inline-flex', alignItems: 'center', gap: 0.5 }}>
                      <Typography variant="inherit">Assets</Typography>
                      <IconButton
                        size="small"
                        onClick={() => handleRequestSort('assets')}
                        aria-label="Sort by assets"
                      >
                        <SortIcon
                          sx={{ color: sortKey === 'assets' ? 'text.primary' : '#7c8088' }}
                        />
                      </IconButton>
                    </Box>
                  </TableCell>
                  <TableCell align="center">
                    <Box
                      sx={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: 0.5,
                      }}
                    >
                      <Typography variant="inherit">
                        {isSupply ? 'Wallet Balance' : 'Available'}
                      </Typography>
                      <IconButton
                        size="small"
                        onClick={() => handleRequestSort('amount')}
                        aria-label={isSupply ? 'Sort by wallet balance' : 'Sort by available'}
                      >
                        <SortIcon
                          sx={{ color: sortKey === 'amount' ? 'text.primary' : '#7c8088' }}
                        />
                      </IconButton>
                    </Box>
                  </TableCell>
                  <TableCell align="center">
                    <Box
                      sx={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: 0.5,
                      }}
                    >
                      <Typography variant="inherit">
                        {isSupply ? 'APY' : 'APY, variable'}
                      </Typography>
                      <IconButton
                        size="small"
                        onClick={() => handleRequestSort('apy')}
                        aria-label={isSupply ? 'Sort by APY' : 'Sort by variable APY'}
                      >
                        <SortIcon sx={{ color: sortKey === 'apy' ? 'text.primary' : '#7c8088' }} />
                      </IconButton>
                    </Box>
                  </TableCell>
                  {isSupply && <TableCell align="center">Can be collateral</TableCell>}
                  <TableCell />
                </TableRow>
              </TableHead>

              <TableBody>
                {paginatedRows.map((row) =>
                  isSupply ? (
                    <SupplyTableRow
                      key={(row as SupplyRow).id}
                      row={row as SupplyRow}
                      setMenuAnchor={setMenuAnchor}
                      setMenuRow={setMenuRow}
                      onSupply={(underlyingAsset) =>
                        openModal(ModalType.Supply, { underlyingAsset })
                      }
                    />
                  ) : (
                    <BorrowTableRow
                      key={(row as BorrowRow).id}
                      row={row as BorrowRow}
                      currentMarket={currentMarket as CustomMarket}
                      onBorrow={(underlyingAsset) =>
                        openModal(ModalType.Borrow, { underlyingAsset })
                      }
                    />
                  )
                )}
              </TableBody>
              <TableFooter>
                <TableRow>
                  <TablePagination
                    colSpan={isSupply ? 5 : 4}
                    count={displayRows.length}
                    page={page}
                    rowsPerPage={ROWS_PER_PAGE}
                    rowsPerPageOptions={[]}
                    onPageChange={(_, newPage) => setPage(newPage)}
                    sx={{ borderBottom: 'none' }}
                  />
                </TableRow>
              </TableFooter>
            </Table>
          </DesktopTable>

          <MobileCards>
            {paginatedRows.map((row) =>
              isSupply ? (
                <SupplyMobileCard
                  key={(row as SupplyRow).id}
                  row={row as SupplyRow}
                  currentMarket={currentMarket}
                  onSupply={(underlyingAsset) => openModal(ModalType.Supply, { underlyingAsset })}
                />
              ) : (
                <BorrowMobileCard
                  key={(row as BorrowRow).id}
                  row={row as BorrowRow}
                  currentMarket={currentMarket as CustomMarket}
                  onBorrow={(underlyingAsset) => openModal(ModalType.Borrow, { underlyingAsset })}
                />
              )
            )}
          </MobileCards>

          <MobilePagination>
            <Button size="small" disabled={page === 0} onClick={() => setPage((p) => p - 1)}>
              Prev
            </Button>
            <Typography variant="body2" color="text.secondary">
              Page {page + 1} / {pageCount}
            </Typography>
            <Button
              size="small"
              disabled={page >= pageCount - 1}
              onClick={() => setPage((p) => p + 1)}
            >
              Next
            </Button>
          </MobilePagination>
        </>
      )}

      <Menu
        anchorEl={menuAnchor}
        open={Boolean(menuAnchor)}
        onClose={() => setMenuAnchor(null)}
        onClick={() => setMenuAnchor(null)}
      >
        <Button
          size="small"
          variant="text"
          color="secondary"
          fullWidth
          href={
            menuRow
              ? ROUTES.marketAssetDetails(menuRow.underlyingAsset, currentMarket as CustomMarket)
              : '#'
          }
        >
          Details
        </Button>
      </Menu>
    </Paper>
  );
}

function SupplyMobileCard({
  row,
  currentMarket,
  onSupply,
}: {
  row: SupplyRow;
  currentMarket: string;
  onSupply: (underlyingAsset: string) => void;
}) {
  return (
    <MobileAssetCard>
      <Box display="flex" alignItems="center" justifyContent="space-between" gap={1}>
        <Stack direction="row" spacing={1} alignItems="center">
          <TokenIcon symbol={row.iconSymbol} sx={{ width: 44, height: 44, fontSize: '24px' }} />
          <Typography variant="body1">{row.symbol}</Typography>
        </Stack>
      </Box>

      <Box display="flex" flexDirection="column" gap={2}>
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Typography variant="body2">Wallet balance</Typography>
          <Typography variant="body2">
            {Number(row.walletBalanceStr).toLocaleString(undefined, { maximumFractionDigits: 6 })}
          </Typography>
        </Box>
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Typography variant="body2">APY</Typography>
          <Typography variant="body2" fontWeight={600}>
            {(row.apyPercent * 100).toFixed(2)}%
          </Typography>
        </Box>
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Typography variant="body2">Can be collateral</Typography>
          <Typography variant="body2" color={row.canBeCollateral ? 'success.main' : 'text.primary'}>
            {row.canBeCollateral ? 'Yes' : 'No'}
          </Typography>
        </Box>
      </Box>

      <Stack direction="row" spacing={1}>
        <Button
          size="small"
          variant="outlined"
          color="inherit"
          fullWidth
          disabled={row.disableSupply}
          onClick={() => onSupply(row.underlyingAsset)}
        >
          SUPPLY
        </Button>
        <Button
          size="small"
          variant="outlined"
          color="inherit"
          fullWidth
          href={ROUTES.marketAssetDetails(row.underlyingAsset, currentMarket as CustomMarket)}
        >
          DETAILS
        </Button>
      </Stack>
    </MobileAssetCard>
  );
}

function BorrowMobileCard({
  row,
  currentMarket,
  onBorrow,
}: {
  row: BorrowRow;
  currentMarket: CustomMarket;
  onBorrow: (underlyingAsset: string) => void;
}) {
  const apyLabel = row.borrowApyPercent < 0 ? '—' : `${row.borrowApyPercent.toFixed(2)}%`;

  return (
    <MobileAssetCard>
      <Stack direction="row" spacing={1} alignItems="center">
        <TokenIcon symbol={row.iconSymbol} sx={{ width: 44, height: 44, fontSize: '24px' }} />
        <Typography variant="body1">{row.symbol}</Typography>
      </Stack>

      <Box display="flex" flexDirection="column" gap={2}>
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Typography variant="body2">Available</Typography>
          <Typography variant="body2">
            {row.availableBorrows.toLocaleString(undefined, { maximumFractionDigits: 6 })}
          </Typography>
        </Box>
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Typography variant="body2">APY, variable</Typography>
          <Typography variant="body2">{apyLabel}</Typography>
        </Box>
      </Box>

      <Stack direction="row" spacing={1}>
        <Button
          size="small"
          variant="outlined"
          color="inherit"
          fullWidth
          disabled={row.disableBorrow}
          onClick={() => onBorrow(row.underlyingAsset)}
        >
          Borrow
        </Button>
        <Button
          size="small"
          variant="outlined"
          color="secondary"
          fullWidth
          href={ROUTES.marketAssetDetails(row.underlyingAsset, currentMarket)}
        >
          Details
        </Button>
      </Stack>
    </MobileAssetCard>
  );
}

function SupplyTableRow({
  row,
  setMenuAnchor,
  setMenuRow,
  onSupply,
}: {
  row: SupplyRow;
  setMenuAnchor: (el: HTMLElement | null) => void;
  setMenuRow: (row: SupplyRow) => void;
  onSupply: (underlyingAsset: string) => void;
}) {
  return (
    <TableRow>
      <TableCell>
        <Stack direction="row" spacing={1} alignItems="center">
          <TokenIcon symbol={row.iconSymbol} sx={{ width: 24, height: 24, fontSize: '24px' }} />
          <Typography>{row.symbol}</Typography>
        </Stack>
      </TableCell>

      <TableCell align="center">
        {Number(row.walletBalanceStr).toLocaleString(undefined, { maximumFractionDigits: 6 })}
      </TableCell>
      <TableCell align="center">{(row.apyPercent * 100).toFixed(2)}%</TableCell>

      <TableCell align="center">
        {row.canBeCollateral ? (
          <Typography color="success.main">
            <Check />
          </Typography>
        ) : null}
      </TableCell>

      <TableCell align="center">
        <Stack direction="row" spacing={1} justifyContent="flex-end">
          <Button
            size="small"
            variant="contained"
            color="inherit"
            disabled={row.disableSupply}
            onClick={() => onSupply(row.underlyingAsset)}
          >
            Supply
          </Button>
          <IconButton
            size="small"
            onClick={(e) => {
              setMenuRow(row);
              setMenuAnchor(e.currentTarget);
            }}
          >
            <MoreHorizOutlined fontSize="small" />
          </IconButton>
        </Stack>
      </TableCell>
    </TableRow>
  );
}

function BorrowTableRow({
  row,
  currentMarket,
  onBorrow,
}: {
  row: BorrowRow;
  currentMarket: CustomMarket;
  onBorrow: (underlyingAsset: string) => void;
}) {
  const apyLabel = row.borrowApyPercent < 0 ? '—' : `${row.borrowApyPercent.toFixed(2)}%`;

  return (
    <TableRow>
      <TableCell>
        <Stack direction="row" spacing={1} alignItems="center">
          <TokenIcon symbol={row.iconSymbol} sx={{ width: 24, height: 24, fontSize: '24px' }} />
          <Typography>{row.symbol}</Typography>
        </Stack>
      </TableCell>

      <TableCell align="center">
        {row.availableBorrows.toLocaleString(undefined, { maximumFractionDigits: 6 })}
      </TableCell>
      <TableCell align="center">{apyLabel}</TableCell>

      <TableCell align="center">
        <Stack direction="row" spacing={2} justifyContent="flex-end">
          <Button
            size="small"
            variant="contained"
            color="inherit"
            disabled={row.disableBorrow}
            onClick={() => onBorrow(row.underlyingAsset)}
          >
            Borrow
          </Button>
          <Button
            size="small"
            variant="text"
            color="secondary"
            href={ROUTES.marketAssetDetails(row.underlyingAsset, currentMarket)}
          >
            Details
          </Button>
        </Stack>
      </TableCell>
    </TableRow>
  );
}
