import {
  POINTS_DISTRIBUTOR_ARBITRUM_SEPOLIA,
  POINTS_K613S1_ARBITRUM_SEPOLIA,
} from 'src/const/testnet';
import { MONAD_CHAIN_ID } from 'src/ui-config/networksConfig';

const ARBITRUM_SEPOLIA_CHAIN_ID = 421614;

export type PointsCampaignConfig = {
  K613S1: string;
  DISTRIBUTOR: string;
  SNAPSHOTS_BASE_URL: string;
  CAMPAIGN_START_TS: number;
  CAMPAIGN_WEEKS: number;
};

// Arbitrum Sepolia — testnet, fully hardcoded.
export const POINTS_CAMPAIGN_ARBITRUM_SEPOLIA: PointsCampaignConfig = {
  K613S1: POINTS_K613S1_ARBITRUM_SEPOLIA,
  DISTRIBUTOR: POINTS_DISTRIBUTOR_ARBITRUM_SEPOLIA,
  SNAPSHOTS_BASE_URL:
    'https://raw.githubusercontent.com/K613-Official/K613-points/main/snapshots-testnet',
  CAMPAIGN_START_TS: 1778963398,
  CAMPAIGN_WEEKS: 4,
};

// Monad — mainnet, fully hardcoded.
export const POINTS_CAMPAIGN_MONAD: PointsCampaignConfig = {
  K613S1: '0x4f9ba5CaE0e3F651821283EC4e303fE8D1dA542a',
  DISTRIBUTOR: '0x94F71Da72c6CE71c570CF7F8e076F3097E411063',
  SNAPSHOTS_BASE_URL:
    'https://raw.githubusercontent.com/K613-Official/K613-points/main/snapshots-mainnet',
  CAMPAIGN_START_TS: 1779321600,
  CAMPAIGN_WEEKS: 4,
};

export function pointsCampaignByChainId(chainId: number | undefined): PointsCampaignConfig | null {
  if (chainId === ARBITRUM_SEPOLIA_CHAIN_ID) return POINTS_CAMPAIGN_ARBITRUM_SEPOLIA;
  if (chainId === MONAD_CHAIN_ID) return POINTS_CAMPAIGN_MONAD;
  return null;
}
