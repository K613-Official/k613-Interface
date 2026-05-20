import {
  POINTS_CAMPAIGN_START_TS_MONAD,
  POINTS_CAMPAIGN_WEEKS_MONAD,
  POINTS_DISTRIBUTOR_MONAD,
  POINTS_K613S1_MONAD,
  POINTS_SNAPSHOTS_BASE_URL_MONAD,
} from 'src/const/env';
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

// Arbitrum Sepolia — fully hardcoded test environment.
// Adresses + season start + weeks + snapshots repo all baked in.
export const POINTS_CAMPAIGN_ARBITRUM_SEPOLIA: PointsCampaignConfig = {
  K613S1: POINTS_K613S1_ARBITRUM_SEPOLIA,
  DISTRIBUTOR: POINTS_DISTRIBUTOR_ARBITRUM_SEPOLIA,
  SNAPSHOTS_BASE_URL:
    'https://raw.githubusercontent.com/K613-Official/K613-points/main/snapshots-testnet',
  CAMPAIGN_START_TS: 1778963398,
  CAMPAIGN_WEEKS: 4,
};

// Monad — fully env-driven (set after mainnet deploy).
export const POINTS_CAMPAIGN_MONAD: PointsCampaignConfig = {
  K613S1: POINTS_K613S1_MONAD,
  DISTRIBUTOR: POINTS_DISTRIBUTOR_MONAD,
  SNAPSHOTS_BASE_URL: POINTS_SNAPSHOTS_BASE_URL_MONAD,
  CAMPAIGN_START_TS: Number(POINTS_CAMPAIGN_START_TS_MONAD) || 0,
  CAMPAIGN_WEEKS: Math.max(1, Number(POINTS_CAMPAIGN_WEEKS_MONAD) || 1),
};

export function pointsCampaignByChainId(chainId: number | undefined): PointsCampaignConfig | null {
  if (chainId === ARBITRUM_SEPOLIA_CHAIN_ID) return POINTS_CAMPAIGN_ARBITRUM_SEPOLIA;
  if (chainId === MONAD_CHAIN_ID) return POINTS_CAMPAIGN_MONAD;
  return null;
}
