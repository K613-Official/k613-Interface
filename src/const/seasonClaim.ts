import {
  K613_TOKEN_ARBITRUM_SEPOLIA,
  POINTS_K613S1_ARBITRUM_SEPOLIA,
  SEASON_CLAIM_CONTRACT_ARBITRUM_SEPOLIA,
} from 'src/const/testnet';
import { MONAD_CHAIN_ID } from 'src/ui-config/networksConfig';

const ARBITRUM_SEPOLIA_CHAIN_ID = 421614;

export type SeasonClaimConfig = {
  /** K613SeasonClaim contract. Empty string until deployed — UI shows "Conversion opens at TGE". */
  SEASON_CLAIM: string;
  /** Season points token burned on conversion. */
  K613S1: string;
  /** Token paid out by the season claim. */
  K613: string;
  /** Season-final snapshot base URL; proofs live under `/proofs/<address>.json`. */
  PROOFS_BASE_URL: string;
};

// Arbitrum Sepolia — testnet, fully hardcoded.
export const SEASON_CLAIM_ARBITRUM_SEPOLIA: SeasonClaimConfig = {
  SEASON_CLAIM: SEASON_CLAIM_CONTRACT_ARBITRUM_SEPOLIA,
  K613S1: POINTS_K613S1_ARBITRUM_SEPOLIA,
  K613: K613_TOKEN_ARBITRUM_SEPOLIA,
  PROOFS_BASE_URL:
    'https://raw.githubusercontent.com/K613-Official/K613-points/main/snapshots/season-final-testnet',
};

// Monad — mainnet. SEASON_CLAIM stays empty until the TGE deploy.
export const SEASON_CLAIM_MONAD: SeasonClaimConfig = {
  SEASON_CLAIM: '',
  K613S1: '0x4f9ba5CaE0e3F651821283EC4e303fE8D1dA542a',
  K613: '0xb09582631336068d4B0089d943f40CbF46dE5189',
  PROOFS_BASE_URL:
    'https://raw.githubusercontent.com/K613-Official/K613-points/main/snapshots/season-final-mainnet',
};

export function seasonClaimByChainId(chainId: number | undefined): SeasonClaimConfig | null {
  if (chainId === ARBITRUM_SEPOLIA_CHAIN_ID) return SEASON_CLAIM_ARBITRUM_SEPOLIA;
  if (chainId === MONAD_CHAIN_ID) return SEASON_CLAIM_MONAD;
  return null;
}
