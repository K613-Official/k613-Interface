import { API_ETH_MOCK_ADDRESS } from '@aave/contract-helpers';
import { USD_DECIMALS, valueToBigNumber } from '@aave/math-utils';
import { Box, Button, Skeleton, Stack, Typography } from '@mui/material';
import { BigNumber } from 'bignumber.js';
import { useState } from 'react';
import { FormattedNumber } from 'src/components/primitives/FormattedNumber';
import { ConnectWalletButton } from 'src/components/WalletConnection/ConnectWalletButton';
import {
  ComputedReserveData,
  useAppDataContext,
} from 'src/hooks/app-data-provider/useAppDataProvider';
import { useWalletBalances } from 'src/hooks/app-data-provider/useWalletBalances';
import { useReserveActionState } from 'src/hooks/useReserveActionState';
import { useWeb3Context } from 'src/libs/hooks/useWeb3Context';
import { useRootStore } from 'src/store/root';
import { useModalStore } from 'src/store/useModalStore';
import { ModalType } from 'src/components/Modals/types';
import {
  getMaxAmountAvailableToBorrow,
  getMaxGhoMintAmount,
} from 'src/utils/getMaxAmountAvailableToBorrow';
import { getMaxAmountAvailableToSupply } from 'src/utils/getMaxAmountAvailableToSupply';
import { displayGhoForMintableMarket } from 'src/utils/ghoUtilities';
import { useShallow } from 'zustand/shallow';

import {
  InfoMutedText,
  InfoSymbol,
  WalletBalanceRow,
  WalletCardIcon,
  WalletIconBox,
  YourInfoActionInfo,
  YourInfoActionRow,
  YourInfoContainer,
  YourInfoDivider,
  YourInfoHeader,
  YourInfoTab,
  YourInfoTabs,
} from './styles';

function amountToUSD(
  amount: string,
  formattedPriceInMarketReferenceCurrency: string,
  marketReferencePriceInUsd: string
) {
  return valueToBigNumber(amount)
    .multipliedBy(formattedPriceInMarketReferenceCurrency)
    .multipliedBy(marketReferencePriceInUsd)
    .shiftedBy(-USD_DECIMALS)
    .toString();
}

interface YourInfoPanelProps {
  reserve: ComputedReserveData;
}

export function YourInfoPanel({ reserve }: YourInfoPanelProps) {
  const [selectedAsset, setSelectedAsset] = useState(reserve.symbol);

  const { currentAccount } = useWeb3Context();
  const openModal = useModalStore((s) => s.openModal);
  const [currentMarket, currentNetworkConfig, currentMarketData, minRemainingBaseTokenBalance] =
    useRootStore(
      useShallow((store) => [
        store.currentMarket,
        store.currentNetworkConfig,
        store.currentMarketData,
        store.poolComputed.minRemainingBaseTokenBalance,
      ])
    );
  const {
    ghoReserveData,
    user,
    loading: loadingReserves,
    marketReferencePriceInUsd,
  } = useAppDataContext();
  const { walletBalances, loading: loadingWalletBalance } = useWalletBalances(currentMarketData);
  const { baseAssetSymbol } = currentNetworkConfig;

  let balance = walletBalances[reserve.underlyingAsset];
  if (reserve.isWrappedBaseAsset && selectedAsset === baseAssetSymbol) {
    balance = walletBalances[API_ETH_MOCK_ADDRESS.toLowerCase()];
  }

  const isGho = displayGhoForMintableMarket({ symbol: reserve.symbol, currentMarket });
  let maxAmountToBorrow = '0';
  let maxAmountToSupply = '0';

  if (isGho && user) {
    const maxMintAmount = getMaxGhoMintAmount(user, reserve);
    maxAmountToBorrow = BigNumber.min(
      maxMintAmount,
      valueToBigNumber(ghoReserveData.aaveFacilitatorRemainingCapacity)
    ).toString();
  } else if (user) {
    maxAmountToBorrow = getMaxAmountAvailableToBorrow(reserve, user).toString();
    maxAmountToSupply = getMaxAmountAvailableToSupply(
      balance?.amount || '0',
      reserve,
      reserve.underlyingAsset,
      minRemainingBaseTokenBalance
    ).toString();
  }

  const maxAmountToBorrowUsd = amountToUSD(
    maxAmountToBorrow,
    reserve.formattedPriceInMarketReferenceCurrency,
    marketReferencePriceInUsd
  );

  const maxAmountToSupplyUsd = amountToUSD(
    maxAmountToSupply,
    reserve.formattedPriceInMarketReferenceCurrency,
    marketReferencePriceInUsd
  );

  const { disableSupplyButton, disableBorrowButton, alerts } = useReserveActionState({
    balance: balance?.amount || '0',
    maxAmountToSupply,
    maxAmountToBorrow,
    reserve,
  });

  const handleSupplyClick = () => {
    if (reserve.isWrappedBaseAsset && selectedAsset === baseAssetSymbol) {
      openModal(ModalType.Supply, { underlyingAsset: API_ETH_MOCK_ADDRESS.toLowerCase() });
    } else {
      openModal(ModalType.Supply, { underlyingAsset: reserve.underlyingAsset });
    }
  };

  const handleBorrowClick = () => {
    openModal(ModalType.Borrow, { underlyingAsset: reserve.underlyingAsset });
  };

  const isLoading = loadingReserves || loadingWalletBalance;

  return (
    <YourInfoContainer>
      <YourInfoHeader>
        <Typography variant="h5">Your info</Typography>
      </YourInfoHeader>

      {!currentAccount ? (
        <>
          <Typography color="text.secondary" variant="body2">
            Please connect a wallet to view your personal information here.
          </Typography>
          <ConnectWalletButton />
        </>
      ) : isLoading ? (
        <Stack gap={2} width="100%">
          <Skeleton variant="rectangular" width="100%" height={42} />
          <Skeleton variant="rectangular" width="100%" height={1} />
          <Skeleton variant="rectangular" width="100%" height={60} />
          <Skeleton variant="rectangular" width="100%" height={60} />
        </Stack>
      ) : (
        <>
          {reserve.isWrappedBaseAsset && (
            <YourInfoTabs
              value={selectedAsset === reserve.symbol ? 0 : 1}
              onChange={(_, v: number) =>
                setSelectedAsset(v === 0 ? reserve.symbol : baseAssetSymbol)
              }
            >
              <YourInfoTab label={reserve.symbol} />
              <YourInfoTab label={baseAssetSymbol} />
            </YourInfoTabs>
          )}

          <WalletBalanceRow>
            <WalletIconBox>
              <WalletCardIcon />
            </WalletIconBox>
            <Box display="flex" flexDirection="column" flex={1}>
              <InfoMutedText variant="body2">Wallet balance</InfoMutedText>
              <Typography variant="h6">
                <FormattedNumber
                  value={balance?.amount || '0'}
                  variant="inherit"
                  component="span"
                />{' '}
                <InfoSymbol>{selectedAsset}</InfoSymbol>
              </Typography>
            </Box>
          </WalletBalanceRow>

          <YourInfoDivider />

          {!isGho && (
            <YourInfoActionRow>
              <YourInfoActionInfo>
                <InfoMutedText variant="body2">Available to supply</InfoMutedText>
                <Typography variant="h6">
                  <FormattedNumber value={maxAmountToSupply} variant="inherit" component="span" />{' '}
                  <InfoSymbol>{selectedAsset}</InfoSymbol>
                </Typography>
                <InfoMutedText variant="body2">
                  <FormattedNumber value={maxAmountToSupplyUsd} variant="inherit" symbol="USD" />
                </InfoMutedText>
              </YourInfoActionInfo>
              <Button
                variant="contained"
                disabled={disableSupplyButton}
                onClick={handleSupplyClick}
              >
                Supply
              </Button>
            </YourInfoActionRow>
          )}

          {reserve.borrowingEnabled && (
            <YourInfoActionRow>
              <YourInfoActionInfo>
                <InfoMutedText variant="body2">Available to borrow</InfoMutedText>
                <Typography variant="h6">
                  <FormattedNumber value={maxAmountToBorrow} variant="inherit" component="span" />{' '}
                  <InfoSymbol>{reserve.symbol}</InfoSymbol>
                </Typography>
                <InfoMutedText variant="body2">
                  <FormattedNumber value={maxAmountToBorrowUsd} variant="inherit" symbol="USD" />
                </InfoMutedText>
              </YourInfoActionInfo>
              <Button
                variant="contained"
                color="secondary"
                disabled={disableBorrowButton}
                onClick={handleBorrowClick}
              >
                Borrow
              </Button>
            </YourInfoActionRow>
          )}

          {alerts}
        </>
      )}
    </YourInfoContainer>
  );
}
