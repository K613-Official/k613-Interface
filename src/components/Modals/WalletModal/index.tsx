import { API_ETH_MOCK_ADDRESS } from '@aave/contract-helpers';
import { Close, ContentCopy, Logout } from '@mui/icons-material';
import { Typography } from '@mui/material';
import { blo } from 'blo';
import { useCallback, useMemo } from 'react';
import { Avatar } from 'src/components/Avatar';
import { BadgeSize, ExclamationBadge } from 'src/components/badges/ExclamationBadge';
import { useWalletBalances } from 'src/hooks/app-data-provider/useWalletBalances';
import { useWeb3Context } from 'src/libs/hooks/useWeb3Context';
import { useRootStore } from 'src/store/root';
import { getNetworkConfig } from 'src/utils/marketsAndNetworksConfig';
import { useDisconnect } from 'wagmi';
import { useShallow } from 'zustand/shallow';

import { BaseModalProps, WalletModalProps } from '../types';
import {
  AddressRow,
  AvatarSection,
  Balance,
  CloseButton,
  CopyButton,
  Dialog,
  DisconnectButton,
  Header,
} from './styles';

type Props = BaseModalProps & WalletModalProps;

function shortenAddress(address: string) {
  return `${address.slice(0, 4)}...${address.slice(-4)}`;
}

export default function WalletModal({ open, onClose, address }: Props) {
  const { disconnectAsync, isPending: isDisconnecting } = useDisconnect();
  const { readOnlyMode } = useWeb3Context();
  const [account, defaultDomain, domainsLoading, currentMarketData] = useRootStore(
    useShallow((state) => [
      state.account,
      state.defaultDomain,
      state.domainsLoading,
      state.currentMarketData,
    ])
  );
  const { walletBalances, loading: walletBalancesLoading } = useWalletBalances(currentMarketData);
  const { baseAssetSymbol } = getNetworkConfig(currentMarketData.chainId);

  const fallbackImage = useMemo(
    () => (address ? blo(address as `0x${string}`) : undefined),
    [address]
  );

  const domainAvatar =
    account && address && account.toLowerCase() === address.toLowerCase()
      ? defaultDomain?.avatar
      : undefined;

  const balanceText = useMemo(() => {
    if (walletBalancesLoading) return '…';
    const amountStr = walletBalances[API_ETH_MOCK_ADDRESS.toLowerCase()]?.amount ?? '0';
    const n = Number(amountStr);
    const amount = Number.isFinite(n)
      ? n.toLocaleString(undefined, { maximumFractionDigits: 6 })
      : amountStr;
    return `${amount} ${baseAssetSymbol}`;
  }, [walletBalances, walletBalancesLoading, baseAssetSymbol]);

  const handleDisconnect = useCallback(async () => {
    try {
      await disconnectAsync();
      onClose();
    } catch {}
  }, [disconnectAsync, onClose]);

  const handleCopy = useCallback(async () => {
    await navigator.clipboard.writeText(address);
  }, [address]);

  return (
    <Dialog open={open} onClose={onClose}>
      <Header>
        <Typography variant="subtitle1" fontWeight={500} color="background.default">
          Connected
        </Typography>
        <CloseButton onClick={onClose}>
          <Close fontSize="small" />
        </CloseButton>
      </Header>

      <AvatarSection>
        <Avatar
          size={64}
          image={domainAvatar}
          fallbackImage={fallbackImage}
          loading={domainsLoading}
          badge={<ExclamationBadge size={BadgeSize.SM} />}
          invisibleBadge={!readOnlyMode}
        />
      </AvatarSection>

      <AddressRow>
        <Typography variant="body1" color="background.default">
          {shortenAddress(address)}
        </Typography>
        <CopyButton onClick={handleCopy}>
          <ContentCopy fontSize="small" />
        </CopyButton>
      </AddressRow>

      <Balance variant="body1">{balanceText}</Balance>

      <DisconnectButton
        variant="contained"
        color="secondary"
        size="small"
        startIcon={<Logout />}
        disabled={isDisconnecting}
        onClick={handleDisconnect}
      >
        DISCONNECT
      </DisconnectButton>
    </Dialog>
  );
}
