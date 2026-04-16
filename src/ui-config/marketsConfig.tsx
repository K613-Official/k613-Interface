import { ChainId } from '@aave/contract-helpers';
import { AaveV2Ethereum } from '@bgd-labs/aave-address-book';
import { ReactNode } from 'react';
import {
  ARBITRUM_SEPOLIA_COLLECTOR,
  ARBITRUM_SEPOLIA_L2_ENCODER,
  ARBITRUM_SEPOLIA_LENDING_POOL,
  ARBITRUM_SEPOLIA_LENDING_POOL_ADDRESS_PROVIDER,
  ARBITRUM_SEPOLIA_UI_INCENTIVE_DATA_PROVIDER,
  ARBITRUM_SEPOLIA_UI_POOL_DATA_PROVIDER,
  ARBITRUM_SEPOLIA_WALLET_BALANCE_PROVIDER,
  ARBITRUM_SEPOLIA_WETH_GATEWAY,
  SUBGRAPH_ARBITRUM_SEPOLIA_URL,
} from 'src/const';

export type MarketDataType = {
  v3?: boolean;
  marketTitle: string;
  market: CustomMarket;
  chainId: ChainId;
  enabledFeatures?: {
    liquiditySwap?: boolean;
    staking?: boolean;
    governance?: boolean;
    faucet?: boolean;
    collateralRepay?: boolean;
    incentives?: boolean;
    permissions?: boolean;
    debtSwitch?: boolean;
    withdrawAndSwitch?: boolean;
    switch?: boolean;
  };
  permitDisabled?: boolean;
  isFork?: boolean;
  permissionComponent?: ReactNode;
  disableCharts?: boolean;
  subgraphUrl?: string;
  logo?: string;
  addresses: {
    LENDING_POOL_ADDRESS_PROVIDER: string;
    LENDING_POOL: string;
    WETH_GATEWAY?: string;
    SWAP_COLLATERAL_ADAPTER?: string;
    REPAY_WITH_COLLATERAL_ADAPTER?: string;
    DEBT_SWITCH_ADAPTER?: string;
    WITHDRAW_SWITCH_ADAPTER?: string;
    FAUCET?: string;
    PERMISSION_MANAGER?: string;
    WALLET_BALANCE_PROVIDER: string;
    L2_ENCODER?: string;
    UI_POOL_DATA_PROVIDER: string;
    UI_INCENTIVE_DATA_PROVIDER?: string;
    COLLECTOR?: string;
    V3_MIGRATOR?: string;
    GHO_TOKEN_ADDRESS?: string;
    GHO_UI_DATA_PROVIDER?: string;
  };
};
export enum CustomMarket {
  proto_arbitrum_sepolia_v3 = 'proto_arbitrum_sepolia_v3',
  proto_mainnet = 'proto_mainnet',
}

const apiKey = process.env.NEXT_PUBLIC_SUBGRAPH_API_KEY;

export const marketsData: {
  [key in keyof typeof CustomMarket]: MarketDataType;
} = {
  [CustomMarket.proto_mainnet]: {
    marketTitle: 'Ethereum',
    market: CustomMarket.proto_mainnet,
    chainId: ChainId.mainnet,
    enabledFeatures: {
      governance: true,
      staking: true,
      liquiditySwap: true,
      collateralRepay: false,
      incentives: true,
      debtSwitch: true,
      switch: true,
    },
    subgraphUrl: `https://gateway-arbitrum.network.thegraph.com/api/${apiKey}/subgraphs/id/8wR23o1zkS4gpLqLNU4kG3JHYVucqGyopL5utGxP2q1N`,
    addresses: {
      LENDING_POOL_ADDRESS_PROVIDER: AaveV2Ethereum.POOL_ADDRESSES_PROVIDER,
      LENDING_POOL: AaveV2Ethereum.POOL,
      WETH_GATEWAY: AaveV2Ethereum.WETH_GATEWAY,
      REPAY_WITH_COLLATERAL_ADAPTER: AaveV2Ethereum.REPAY_WITH_COLLATERAL_ADAPTER,
      SWAP_COLLATERAL_ADAPTER: AaveV2Ethereum.SWAP_COLLATERAL_ADAPTER,
      WALLET_BALANCE_PROVIDER: AaveV2Ethereum.WALLET_BALANCE_PROVIDER,
      UI_POOL_DATA_PROVIDER: AaveV2Ethereum.UI_POOL_DATA_PROVIDER,
      UI_INCENTIVE_DATA_PROVIDER: AaveV2Ethereum.UI_INCENTIVE_DATA_PROVIDER,
      COLLECTOR: AaveV2Ethereum.COLLECTOR,
      V3_MIGRATOR: AaveV2Ethereum.MIGRATION_HELPER,
      DEBT_SWITCH_ADAPTER: AaveV2Ethereum.DEBT_SWAP_ADAPTER,
    },
  },
  [CustomMarket.proto_arbitrum_sepolia_v3]: {
    marketTitle: 'Arbitrum Sepolia',
    market: CustomMarket.proto_arbitrum_sepolia_v3,
    v3: true,
    permitDisabled: true,
    chainId: ChainId.arbitrum_sepolia,
    enabledFeatures: {
      incentives: true,
    },
    subgraphUrl: SUBGRAPH_ARBITRUM_SEPOLIA_URL,
    addresses: {
      LENDING_POOL_ADDRESS_PROVIDER: ARBITRUM_SEPOLIA_LENDING_POOL_ADDRESS_PROVIDER,
      LENDING_POOL: ARBITRUM_SEPOLIA_LENDING_POOL,
      WETH_GATEWAY: ARBITRUM_SEPOLIA_WETH_GATEWAY,
      WALLET_BALANCE_PROVIDER: ARBITRUM_SEPOLIA_WALLET_BALANCE_PROVIDER,
      UI_POOL_DATA_PROVIDER: ARBITRUM_SEPOLIA_UI_POOL_DATA_PROVIDER,
      UI_INCENTIVE_DATA_PROVIDER: ARBITRUM_SEPOLIA_UI_INCENTIVE_DATA_PROVIDER,
      L2_ENCODER: ARBITRUM_SEPOLIA_L2_ENCODER,
      COLLECTOR: ARBITRUM_SEPOLIA_COLLECTOR,
    },
  },
} as const;
