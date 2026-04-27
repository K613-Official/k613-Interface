import { Box, Button } from '@mui/material';
import { TokenIcon } from 'src/components/primitives/TokenIcon';

import { InfoCardType, InfoPosition } from '../data';
import {
  CollateralSwitch,
  CollateralSwitchButton,
  MobileCard,
  MobileGrid,
  MobileHeader,
  MobileLabel,
  MobileRow,
  NameText,
  PrimaryValue,
  SecondaryValue,
  SymbolText,
  ValueStack,
} from '../positionStyles';

export function InfoCardMobileCards({
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
    <MobileGrid>
      {positions.map((position) => (
        <MobileCard key={position.id}>
          <MobileHeader>
            <TokenIcon
              symbol={position.iconSymbol}
              sx={{ width: 44, height: 44, fontSize: '44px' }}
            />
            <Box>
              <NameText>{position.name}</NameText>
              <SymbolText>{position.symbol}</SymbolText>
            </Box>
          </MobileHeader>

          <MobileRow>
            <MobileLabel>{position.primaryLabel}</MobileLabel>
            <ValueStack>
              <PrimaryValue>{position.primaryValue}</PrimaryValue>
              <SecondaryValue>{position.secondaryValue}</SecondaryValue>
            </ValueStack>
          </MobileRow>

          <MobileRow>
            <MobileLabel>APY</MobileLabel>
            <PrimaryValue>{position.apy}</PrimaryValue>
          </MobileRow>

          {isSupply && (
            <MobileRow>
              <MobileLabel>Collateral</MobileLabel>
              <CollateralSwitchButton
                disabled={!position.canToggleCollateral || !position.onToggleCollateral}
                onClick={position.onToggleCollateral}
              >
                <CollateralSwitch enabled={Boolean(position.collateralEnabled)} />
              </CollateralSwitchButton>
            </MobileRow>
          )}

          <Button
            variant="outlined"
            fullWidth
            disabled={position.disableAction}
            onClick={position.onAction}
            sx={{ textTransform: 'uppercase' }}
          >
            {actionLabel}
          </Button>
        </MobileCard>
      ))}
    </MobileGrid>
  );
}
