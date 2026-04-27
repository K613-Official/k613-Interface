import { Box, IconButton, Table, TableBody, TableCell, TableHead, TableRow } from '@mui/material';
import { useMemo, useState } from 'react';
import { TokenIcon } from 'src/components/primitives/TokenIcon';

import { InfoCardType, InfoPosition } from '../data';
import {
  ActionButton,
  AssetCell,
  CollateralSwitch,
  CollateralSwitchButton,
  DataRow,
  HeaderCell,
  SortIcon,
  SymbolText,
  TablePrimaryValue,
  TableSecondaryValue,
  ValueStack,
} from '../positionStyles';

type SortKey = 'asset' | 'balance' | 'apy';

const DEFAULT_SORT_DIRECTION: Record<SortKey, 'asc' | 'desc'> = {
  asset: 'asc',
  balance: 'desc',
  apy: 'desc',
};

const parseNumericValue = (value: string) => {
  const parsed = Number(value.replace(/[^0-9.-]/g, ''));
  return Number.isFinite(parsed) ? parsed : 0;
};

export function InfoCardDesktopTable({
  type,
  positions,
  actionLabel,
}: {
  type: InfoCardType;
  positions: InfoPosition[];
  actionLabel: string;
}) {
  const isSupply = type === 'supply';
  const [sortKey, setSortKey] = useState<SortKey | null>(null);
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');

  const handleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortDirection((prev) => (prev === 'asc' ? 'desc' : 'asc'));
      return;
    }

    setSortKey(key);
    setSortDirection(DEFAULT_SORT_DIRECTION[key]);
  };

  const sortedPositions = useMemo(() => {
    if (!sortKey) return positions;

    const copy = [...positions];
    copy.sort((a, b) => {
      let diff = 0;

      switch (sortKey) {
        case 'asset':
          diff = a.symbol.localeCompare(b.symbol);
          break;
        case 'balance':
          diff = parseNumericValue(a.primaryValue) - parseNumericValue(b.primaryValue);
          break;
        case 'apy':
          diff = parseNumericValue(a.apy) - parseNumericValue(b.apy);
          break;
      }

      if (diff === 0) {
        diff = a.symbol.localeCompare(b.symbol);
      }

      return sortDirection === 'asc' ? diff : -diff;
    });

    return copy;
  }, [positions, sortDirection, sortKey]);

  return (
    <Table>
      <TableHead>
        <TableRow>
          <HeaderCell>
            <Box sx={{ display: 'inline-flex', alignItems: 'center' }}>
              Asset
              <IconButton
                size="small"
                onClick={() => handleSort('asset')}
                aria-label="Sort by asset"
                sx={{ ml: 0.5, p: 0.25 }}
              >
                <SortIcon sx={{ color: sortKey === 'asset' ? 'text.primary' : '#7c8088' }} />
              </IconButton>
            </Box>
          </HeaderCell>
          <HeaderCell align="right">
            <Box sx={{ display: 'inline-flex', alignItems: 'center' }}>
              {isSupply ? 'Balance' : 'Debt'}
              <IconButton
                size="small"
                onClick={() => handleSort('balance')}
                aria-label={`Sort by ${isSupply ? 'balance' : 'debt'}`}
                sx={{ ml: 0.5, p: 0.25 }}
              >
                <SortIcon sx={{ color: sortKey === 'balance' ? 'text.primary' : '#7c8088' }} />
              </IconButton>
            </Box>
          </HeaderCell>
          <HeaderCell align="right">
            <Box sx={{ display: 'inline-flex', alignItems: 'center' }}>
              APY
              <IconButton
                size="small"
                onClick={() => handleSort('apy')}
                aria-label="Sort by APY"
                sx={{ ml: 0.5, p: 0.25 }}
              >
                <SortIcon sx={{ color: sortKey === 'apy' ? 'text.primary' : '#7c8088' }} />
              </IconButton>
            </Box>
          </HeaderCell>
          {isSupply && <HeaderCell align="center">Collateral</HeaderCell>}
          <HeaderCell />
        </TableRow>
      </TableHead>

      <TableBody>
        {sortedPositions.map((position) => (
          <DataRow key={position.id}>
            <TableCell>
              <AssetCell>
                <TokenIcon
                  symbol={position.iconSymbol}
                  sx={{ width: 24, height: 24, fontSize: '24px' }}
                />
                <SymbolText>{position.symbol}</SymbolText>
              </AssetCell>
            </TableCell>

            <TableCell align="right">
              <ValueStack>
                <TablePrimaryValue>{position.primaryValue}</TablePrimaryValue>
                <TableSecondaryValue>{position.secondaryValue}</TableSecondaryValue>
              </ValueStack>
            </TableCell>

            <TableCell align="right">
              <TablePrimaryValue>{position.apy}</TablePrimaryValue>
            </TableCell>

            {isSupply && (
              <TableCell align="center">
                <CollateralSwitchButton
                  disabled={!position.canToggleCollateral || !position.onToggleCollateral}
                  onClick={position.onToggleCollateral}
                >
                  <CollateralSwitch enabled={Boolean(position.collateralEnabled)} />
                </CollateralSwitchButton>
              </TableCell>
            )}

            <TableCell align="right">
              <ActionButton disabled={position.disableAction} onClick={position.onAction}>
                {actionLabel}
              </ActionButton>
            </TableCell>
          </DataRow>
        ))}
      </TableBody>
    </Table>
  );
}
