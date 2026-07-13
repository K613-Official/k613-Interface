import { getDefaultConfig } from 'connectkit';
import {
  ENABLE_TESTNET,
  FORK_BASE_CHAIN_ID,
  FORK_CHAIN_ID,
  FORK_ENABLED,
  FORK_RPC_URL,
  networkConfigs,
} from 'src/utils/marketsAndNetworksConfig';
import { type Chain } from 'viem';
import { createConfig, CreateConfigParameters, CreateConnectorFn, http } from 'wagmi';
import { arbitrumSepolia } from 'wagmi/chains';
import { injected, safe, walletConnect } from 'wagmi/connectors';

import { prodNetworkConfig, testnetConfig } from './networksConfig';

const testnetChains = Object.values(testnetConfig).map((config) => config.wagmiChain) as [
  Chain,
  ...Chain[]
];

let prodChains = Object.values(prodNetworkConfig).map((config) => config.wagmiChain) as [
  Chain,
  ...Chain[]
];

const { name, baseAssetDecimals, baseAssetSymbol } = networkConfigs[FORK_BASE_CHAIN_ID];

const forkChain: Chain = {
  id: FORK_CHAIN_ID,
  name: `${name} Fork`,
  nativeCurrency: {
    decimals: baseAssetDecimals,
    name: baseAssetSymbol,
    symbol: baseAssetSymbol,
  },
  rpcUrls: {
    default: { http: [FORK_RPC_URL] },
  },
  testnet: false,
};

if (FORK_ENABLED) {
  prodChains = [forkChain, ...prodChains];
}

const prodChainsWithArbitrumSepolia = [...prodChains, arbitrumSepolia] as [Chain, ...Chain[]];

const walletConnectProjectId = process.env.NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID;

const defaultConfig = {
  walletConnectProjectId: walletConnectProjectId as string,
  appName: 'Aave',
  appDescription: 'Non-custodial liquidity protocol',
  appUrl: 'https://app.aave.com',
  appIcon: 'https://avatars.githubusercontent.com/u/47617460?s=200&v=4',
};

/**
 * The wallet list is driven by EIP-6963 discovery, not by a hardcoded roster:
 * wagmi's `multiInjectedProviderDiscovery` (on by default) turns every extension
 * that announces itself — MetaMask, Phantom, Rabby, OKX, Coinbase… — into a
 * connector, and ConnectKit renders whatever connectors the config exposes. So the
 * modal ends up showing exactly what the user actually has installed.
 *
 * ConnectKit's own default list works the other way round and is why the modal used
 * to lie: it hardcodes `injected({ target: 'metaMask' })` plus the Coinbase SDK
 * (which reports itself as installed even when it isn't) and leaves the generic
 * injected connector commented out. Adding those back would re-introduce entries for
 * wallets the user does not have, so we deliberately do not.
 */
const buildConnectors = (): CreateConnectorFn[] => {
  const connectors: CreateConnectorFn[] = [];

  // Safe only exists inside the Safe app's iframe.
  const inIframe = typeof window !== 'undefined' && window.parent !== window;
  if (inIframe) {
    connectors.push(
      safe({ allowedDomains: [/gnosis-safe.io$/, /app.safe.global$/, /dhedge.org$/] })
    );
  }

  // Fallback for a lone injected wallet too old to announce itself over EIP-6963.
  // Discovered wallets are deduped against it by rdns, so this adds no duplicates.
  connectors.push(injected({ shimDisconnect: true }));

  // WalletConnect brings in mobile wallets and the QR flow. Optional: without a
  // project id it simply does not appear.
  if (walletConnectProjectId) {
    connectors.push(
      walletConnect({
        projectId: walletConnectProjectId,
        // ConnectKit renders its own QR screen.
        showQrModal: false,
        metadata: {
          name: defaultConfig.appName,
          description: defaultConfig.appDescription,
          url: defaultConfig.appUrl,
          icons: [defaultConfig.appIcon],
        },
      })
    );
  }

  return connectors;
};

const cypressConfig = createConfig(
  getDefaultConfig({
    chains: [forkChain],
    connectors: [injected()],
    ...defaultConfig,
  })
);

const getTransport = (chainId: number) => {
  return networkConfigs[chainId].publicJsonRPCUrl[0];
};

const buildTransports = (chains: CreateConfigParameters['chains']) =>
  Object.fromEntries(chains.map((chain) => [chain.id, http(getTransport(chain.id))]));

const activeChains = ENABLE_TESTNET ? testnetChains : prodChainsWithArbitrumSepolia;
const prodConfig = createConfig(
  getDefaultConfig({
    chains: activeChains,
    transports: buildTransports(activeChains),
    connectors: buildConnectors(),
    ...defaultConfig,
  })
);

const isCypressEnabled = process.env.NEXT_PUBLIC_IS_CYPRESS_ENABLED === 'true';

export const wagmiConfig = isCypressEnabled ? cypressConfig : prodConfig;
