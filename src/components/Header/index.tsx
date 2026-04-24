import { Menu as MenuIcon } from '@mui/icons-material';
import { Box, Button, IconButton as MuiIconButton, Menu, MenuItem, Tab } from '@mui/material';
import Image from 'next/image';
import { useRouter } from 'next/router';
import { useState } from 'react';
import { AvatarSize } from 'src/components/Avatar';
import MaxWidthContainer from 'src/components/MaxWidthContainer';
import { ModalType } from 'src/components/Modals/types';
import { MarketSwitcher } from 'src/components/MarketSwitcher';
import { Link, ROUTES } from 'src/components/primitives/Link';
import { UserDisplay } from 'src/components/UserDisplay';
import { ConnectWalletButton } from 'src/components/WalletConnection/ConnectWalletButton';
import { useDevice } from 'src/hooks';
import { useModalStore } from 'src/store/useModalStore';
import { availableMarkets } from 'src/utils/marketsAndNetworksConfig';
import { useAccount } from 'wagmi';

import { Container, MobileMenuButton, Tabs, TabsWrapper } from './styles';

const TABS = [
  { label: 'Dashboard', href: ROUTES.dashboard },
  { label: 'Markets', href: ROUTES.markets },
  { label: 'Staking', href: ROUTES.stakingK613 },
  { label: 'FAQ', href: ROUTES.faq },
];

export default function Header() {
  const router = useRouter();
  const { address, isConnected } = useAccount();
  const openModal = useModalStore((s) => s.openModal);
  const [mobileMenuAnchor, setMobileMenuAnchor] = useState<HTMLElement | null>(null);
  const pathname = (router.pathname || router.asPath || '').replace(/\/$/, '') || '/';
  const currentTab = TABS.findIndex((tab) => {
    const tabPath = tab.href.replace(/\/$/, '') || '/';
    return pathname === tabPath || (tabPath !== '/' && pathname.startsWith(tabPath + '/'));
  });

  const { isMobile } = useDevice();

  const onClick = (href: string) => {
    router.push(href);

    setMobileMenuAnchor(null);
  };

  return (
    <Container>
      <MaxWidthContainer>
        <Box display="flex" alignItems="center" justifyContent="space-between">
          <Link href={ROUTES.dashboard} noLinkStyle>
            <Image src="/logo.svg" width={120} height={18} alt="logo" />
          </Link>
          <TabsWrapper>
            <Tabs value={currentTab >= 0 ? currentTab : 0}>
              {TABS.map((tab) => (
                <Tab
                  key={tab.href}
                  label={tab.label}
                  component={Link}
                  href={tab.href}
                  noLinkStyle
                />
              ))}
            </Tabs>
          </TabsWrapper>

          <Box display="flex" alignItems="center" gap={1}>
            {availableMarkets.length > 1 && <MarketSwitcher />}
            {isConnected && address ? (
              <Button
                variant="outlined"
                onClick={() => openModal(ModalType.Wallet, { address })}
                sx={{ textTransform: 'none', gap: 1, pl: 1, pr: 2 }}
              >
                <UserDisplay
                  avatarProps={{ size: AvatarSize.SM }}
                  oneLiner
                  titleProps={{ variant: 'button' }}
                />
              </Button>
            ) : (
              <ConnectWalletButton />
            )}
            {isMobile && (
              <MobileMenuButton>
                <MuiIconButton
                  onClick={(e) => setMobileMenuAnchor(e.currentTarget)}
                  color="inherit"
                  aria-label="menu"
                >
                  <MenuIcon />
                </MuiIconButton>
                <Menu
                  anchorEl={mobileMenuAnchor}
                  open={Boolean(mobileMenuAnchor)}
                  onClose={() => setMobileMenuAnchor(null)}
                  anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
                  transformOrigin={{ vertical: 'top', horizontal: 'left' }}
                >
                  {TABS.map((tab, index) => (
                    <MenuItem key={index} onClick={() => onClick(tab.href)}>
                      {tab.label}
                    </MenuItem>
                  ))}
                </Menu>
              </MobileMenuButton>
            )}
          </Box>
        </Box>
      </MaxWidthContainer>
    </Container>
  );
}
