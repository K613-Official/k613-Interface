import '/public/fonts/inter/inter.css';
import '/src/styles/variables.css';

import { CacheProvider, EmotionCache } from '@emotion/react';
import { NoSsr } from '@mui/material';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { ConnectKitProvider } from 'connectkit';
import { NextPage } from 'next';
import { AppProps } from 'next/app';
import Head from 'next/head';
import dynamic from 'next/dynamic';
import { ReactNode, useEffect, useState } from 'react';
import { AddressBlocked } from 'src/components/AddressBlocked';
import { Meta } from 'src/components/Meta';
import ModalProvider from 'src/components/Modals/ModalProvider';
import { GasStationProvider } from 'src/components/transactions/GasStation/GasStationProvider';
import { AppDataProvider } from 'src/hooks/app-data-provider/useAppDataProvider';
import { ModalContextProvider } from 'src/hooks/useModal';

const SupplyModal = dynamic(() =>
  import('src/components/transactions/Supply/SupplyModal').then((m) => m.SupplyModal)
);
const BorrowModal = dynamic(() =>
  import('src/components/transactions/Borrow/BorrowModal').then((m) => m.BorrowModal)
);
const WithdrawModal = dynamic(() =>
  import('src/components/transactions/Withdraw/WithdrawModal').then((m) => m.WithdrawModal)
);
const RepayModal = dynamic(() =>
  import('src/components/transactions/Repay/RepayModal').then((m) => m.RepayModal)
);
const CollateralChangeModal = dynamic(() =>
  import('src/components/transactions/CollateralChange/CollateralChangeModal').then(
    (m) => m.CollateralChangeModal
  )
);
const EmodeModal = dynamic(() =>
  import('src/components/transactions/Emode/EmodeModal').then((m) => m.EmodeModal)
);
const FaucetModal = dynamic(() =>
  import('src/components/transactions/Faucet/FaucetModal').then((m) => m.FaucetModal)
);
import { Web3ContextProvider } from 'src/libs/web3-data-provider/Web3Provider';
import { useRootStore } from 'src/store/root';
import { SharedDependenciesProvider } from 'src/ui-config/SharedDependenciesProvider';
import { wagmiConfig } from 'src/ui-config/wagmiConfig';
import { WagmiProvider } from 'wagmi';
import { useShallow } from 'zustand/shallow';

import createEmotionCache from '../src/createEmotionCache';
import { AppGlobalStyles } from '../src/layouts/AppGlobalStyles';
import { LanguageProvider } from '../src/libs/LanguageProvider';

// Client-side cache, shared for the whole session of the user in the browser.
const clientSideEmotionCache = createEmotionCache();

type NextPageWithLayout = NextPage & {
  getLayout?: (page: React.ReactElement) => React.ReactNode;
};

interface MyAppProps extends AppProps {
  emotionCache?: EmotionCache;
  Component: NextPageWithLayout;
}
export default function MyApp(props: MyAppProps) {
  const { Component, emotionCache = clientSideEmotionCache, pageProps } = props;
  const getLayout = Component.getLayout ?? ((page: ReactNode) => page);
  const [initializeMixpanel, setWalletType] = useRootStore(
    useShallow((store) => [store.initializeMixpanel, store.setWalletType])
  );
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            refetchOnWindowFocus: false,
          },
        },
      })
  );

  const MIXPANEL_TOKEN = process.env.NEXT_PUBLIC_MIXPANEL;
  useEffect(() => {
    if (MIXPANEL_TOKEN) {
      initializeMixpanel();
    } else {
      console.log('no analytics tracking');
    }
  }, []);

  const cleanLocalStorage = () => {
    localStorage.removeItem('readOnlyModeAddress');
  };

  return (
    <CacheProvider value={emotionCache}>
      <Head>
        <meta name="viewport" content="initial-scale=1, width=device-width" />
      </Head>
      <Meta
        title={'K613 Dashboard'}
        description={
          'Track your portfolio, yield, and lending activity in real time. Supply ETH and other assets, use them as collateral, and manage loans within the K613 protocol.'
        }
      />
      <NoSsr>
        <LanguageProvider>
          <WagmiProvider config={wagmiConfig}>
            <QueryClientProvider client={queryClient}>
              <ConnectKitProvider
                onDisconnect={cleanLocalStorage}
                onConnect={({ connectorId }) => setWalletType(connectorId)}
              >
                <Web3ContextProvider>
                  <AppGlobalStyles>
                    <AddressBlocked>
                      <SharedDependenciesProvider>
                        <AppDataProvider>
                          <ModalContextProvider>
                            <GasStationProvider>
                              <ModalProvider />
                              {getLayout(<Component {...pageProps} />)}
                              <SupplyModal />
                              <BorrowModal />
                              <WithdrawModal />
                              <RepayModal />
                              <CollateralChangeModal />
                              <EmodeModal />
                              <FaucetModal />
                            </GasStationProvider>
                          </ModalContextProvider>
                        </AppDataProvider>
                      </SharedDependenciesProvider>
                    </AddressBlocked>
                  </AppGlobalStyles>
                </Web3ContextProvider>
              </ConnectKitProvider>
              <ReactQueryDevtools initialIsOpen={false} />
            </QueryClientProvider>
          </WagmiProvider>
        </LanguageProvider>
      </NoSsr>
    </CacheProvider>
  );
}
