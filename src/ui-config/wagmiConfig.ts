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
import { injected } from 'wagmi/connectors';

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
 * The wallet list is driven by EIP-6963 discovery rather than a hardcoded roster:
 * wagmi's `multiInjectedProviderDiscovery` (on by default) turns every extension
 * that announces itself — MetaMask, Phantom, Rabby, OKX, Coinbase… — into a
 * connector, and ConnectKit renders whatever connectors the config exposes. The
 * modal therefore shows exactly what the user actually has installed.
 *
 * Everything else is deliberately left out. ConnectKit's own defaults hardcode
 * `injected({ target: 'metaMask' })` plus the Coinbase SDK, and the SDK-backed
 * connectors (Coinbase, MetaMask SDK, WalletConnect, Safe) each need an optional
 * package that this project does not depend on — so they would render a wallet in
 * the modal that throws the moment it is clicked.
 */
const buildConnectors = (): CreateConnectorFn[] => [
  // Fallback for a lone injected wallet too old to announce itself over EIP-6963.
  // Discovered wallets are deduped against it by rdns, so this adds no duplicates.
  injected({ shimDisconnect: true }),
];

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
