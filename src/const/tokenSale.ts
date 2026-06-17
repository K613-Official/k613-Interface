import { MONAD_CHAIN_ID } from 'src/ui-config/networksConfig';

const ARBITRUM_SEPOLIA_CHAIN_ID = 421614;

export type TokenSaleConfig = {
  /** K613Sale contract. Empty string until the sale contract is deployed. */
  SALE_CONTRACT: string;
  /** Payment token (USDC) accepted by the sale contract. */
  USDC: string;
  /**
   * Fallback schedule (unix seconds) used until the sale contract is deployed.
   * Once SALE_CONTRACT is set, on-chain saleStart/saleEnd/claimStart take precedence.
   */
  CONTRIBUTION_START_TS: number;
  CONTRIBUTION_END_TS: number;
  CLAIM_START_TS: number;
};

// Arbitrum Sepolia — testnet, fully hardcoded.
export const TOKEN_SALE_ARBITRUM_SEPOLIA: TokenSaleConfig = {
  SALE_CONTRACT: '0x86E5d0ac1c9abb5c92DA37971675cAf1B7de6fcd',
  USDC: '0x75faf114eafb1BDbe2F0316DF893fd58CE46AA4d',
  CONTRIBUTION_START_TS: 1781688779, // 2026-06-20 12:00 UTC
  CONTRIBUTION_END_TS: 1781775179, // 2026-06-27 12:00 UTC
  CLAIM_START_TS: 1781775179, // 2026-06-29 12:00 UTC
};

// Monad — mainnet, fully hardcoded.
export const TOKEN_SALE_MONAD: TokenSaleConfig = {
  SALE_CONTRACT: '',
  USDC: '',
  CONTRIBUTION_START_TS: 1781956800, // 2026-06-20 12:00 UTC
  CONTRIBUTION_END_TS: 1782561600, // 2026-06-27 12:00 UTC
  CLAIM_START_TS: 1782734400, // 2026-06-29 12:00 UTC
};

export function tokenSaleByChainId(chainId: number | undefined): TokenSaleConfig | null {
  if (chainId === ARBITRUM_SEPOLIA_CHAIN_ID) return TOKEN_SALE_ARBITRUM_SEPOLIA;
  if (chainId === MONAD_CHAIN_ID) return TOKEN_SALE_MONAD;
  return null;
}
