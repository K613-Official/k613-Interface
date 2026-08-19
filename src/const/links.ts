/**
 * Public K613 links that appear in more than one place in the UI.
 * Kept here so the pool address is stated once and cannot drift between
 * the footer, the FAQ and the staking page.
 */

/** K613 / USDC 0.05% pool on Uniswap (Monad). The only on-chain price source for K613. */
export const UNISWAP_K613_USDC_POOL = '0xDD5557CEcFD7Ba0F5F2A1C38967d83Df2951a4F4' as const;

export const UNISWAP_K613_USDC_POOL_URL = `https://app.uniswap.org/explore/pools/monad/${UNISWAP_K613_USDC_POOL}`;
