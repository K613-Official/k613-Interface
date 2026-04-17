import { ChainId } from '@aave/contract-helpers';
import { ReactNode } from 'react';
import {
  ARBITRUM_SEPOLIA_POOL,
  ARBITRUM_SEPOLIA_POOL_ADDRESSES_PROVIDER,
  ARBITRUM_SEPOLIA_UI_INCENTIVE_DATA_PROVIDER,
  ARBITRUM_SEPOLIA_UI_POOL_DATA_PROVIDER,
  ARBITRUM_SEPOLIA_WALLET_BALANCE_PROVIDER,
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
  // v3 test networks, all v3.0.1
  proto_arbitrum_sepolia_v3 = 'proto_arbitrum_sepolia_v3',
  proto_fuji_v3 = 'proto_fuji_v3',
  proto_optimism_sepolia_v3 = 'proto_optimism_sepolia_v3',
  proto_scroll_sepolia_v3 = 'proto_scroll_sepolia_v3',
  proto_sepolia_v3 = 'proto_sepolia_v3',
  proto_base_sepolia_v3 = 'proto_base_sepolia_v3',
  // v3 mainnets
  proto_mainnet_v3 = 'proto_mainnet_v3',
  proto_optimism_v3 = 'proto_optimism_v3',
  proto_avalanche_v3 = 'proto_avalanche_v3',
  proto_polygon_v3 = 'proto_polygon_v3',
  proto_arbitrum_v3 = 'proto_arbitrum_v3',
  proto_metis_v3 = 'proto_metis_v3',
  proto_base_v3 = 'proto_base_v3',
  proto_gnosis_v3 = 'proto_gnosis_v3',
  proto_bnb_v3 = 'proto_bnb_v3',
  proto_scroll_v3 = 'proto_scroll_v3',
  proto_lido_v3 = 'proto_lido_v3',
  proto_zksync_v3 = 'proto_zksync_v3',
  proto_etherfi_v3 = 'proto_etherfi_v3',
  proto_linea_v3 = 'proto_linea_v3',
  // v2
  proto_mainnet = 'proto_mainnet',
  proto_avalanche = 'proto_avalanche',
  proto_fuji = 'proto_fuji',
  proto_polygon = 'proto_polygon',
}

export const marketsData: Partial<Record<CustomMarket, MarketDataType>> = {
  [CustomMarket.proto_arbitrum_sepolia_v3]: {
    marketTitle: 'K613 Aave v3 Fork',
    market: CustomMarket.proto_arbitrum_sepolia_v3,
    v3: true,
    permitDisabled: true,
    chainId: ChainId.arbitrum_sepolia,
    enabledFeatures: {
      incentives: true,
    },
    subgraphUrl: SUBGRAPH_ARBITRUM_SEPOLIA_URL,
    addresses: {
      LENDING_POOL_ADDRESS_PROVIDER: ARBITRUM_SEPOLIA_POOL_ADDRESSES_PROVIDER,
      LENDING_POOL: ARBITRUM_SEPOLIA_POOL,
      WALLET_BALANCE_PROVIDER: ARBITRUM_SEPOLIA_WALLET_BALANCE_PROVIDER,
      UI_POOL_DATA_PROVIDER: ARBITRUM_SEPOLIA_UI_POOL_DATA_PROVIDER,
      UI_INCENTIVE_DATA_PROVIDER: ARBITRUM_SEPOLIA_UI_INCENTIVE_DATA_PROVIDER,
    },
  },
};
