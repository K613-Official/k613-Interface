import { addresses_mainnet, addresses_testnet, NetworkAddresses } from 'src/const';
import { MONAD_CHAIN_ID } from 'src/ui-config/networksConfig';

const ARBITRUM_SEPOLIA_CHAIN_ID = 421614;

export const addressesByChainId = (chainId: number): NetworkAddresses | null => {
  switch (chainId) {
    case ARBITRUM_SEPOLIA_CHAIN_ID:
      return addresses_testnet;
    case MONAD_CHAIN_ID:
      return addresses_mainnet;
    default:
      return null;
  }
};
