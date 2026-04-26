import { Table, TableBody, TableCell, TableHead, TableRow } from '@mui/material';

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

  return (
    <Table>
      <TableHead>
        <TableRow>
          <HeaderCell>
            Asset
            <SortIcon />
          </HeaderCell>
          <HeaderCell align="right">{isSupply ? 'Balance' : 'Debt'}</HeaderCell>
          <HeaderCell align="right">
            APY
            <SortIcon />
          </HeaderCell>
          {isSupply && <HeaderCell align="center">Collateral</HeaderCell>}
          <HeaderCell />
        </TableRow>
      </TableHead>

      <TableBody>
        {positions.map((position) => (
          <DataRow key={position.id}>
            <TableCell>
              <AssetCell>
                <TokenIcon symbol={position.iconSymbol} sx={{ width: 24, height: 24, fontSize: '24px' }} />
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
