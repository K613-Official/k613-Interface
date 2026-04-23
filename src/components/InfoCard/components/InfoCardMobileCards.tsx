import { Box } from '@mui/material';

import { InfoCardType, InfoPosition } from '../data';
import {
  CollateralSwitch,
  CollateralSwitchButton,
  MobileActionButton,
  MobileAssetIcon,
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
            <MobileAssetIcon symbol={position.iconSymbol} />
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

          <MobileActionButton disabled={position.disableAction} onClick={position.onAction}>
            {actionLabel}
          </MobileActionButton>
        </MobileCard>
      ))}
    </MobileGrid>
  );
}
