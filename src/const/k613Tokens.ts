/**
 * Wallet-facing metadata for the protocol's own tokens, used when offering them to
 * a wallet over EIP-747.
 *
 * Addresses are deliberately absent: they are read on-chain from the contract that
 * owns them (`K613Sale.saleToken()`, `Staking.k613()` / `Staking.xk613()`), which
 * keeps mainnet and testnet correct without a per-network address table to drift.
 */
export const K613_TOKEN_META = { symbol: 'K613', decimals: 18 } as const;

export const XK613_TOKEN_META = { symbol: 'xK613', decimals: 18 } as const;
