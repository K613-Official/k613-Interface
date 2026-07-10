import { useMemo } from 'react';
import { type TokenSaleConfig, tokenSaleByChainId } from 'src/const/tokenSale';
import { useRootStore } from 'src/store/root';

/**
 * Resolves the active per-network sale config from the current market.
 * Returns `null` if the current market's chain has no sale configured.
 */
export function useTokenSaleConfig(): TokenSaleConfig | null {
  const chainId = useRootStore((s) => s.currentMarketData.chainId) as number | undefined;
  return useMemo(() => tokenSaleByChainId(chainId), [chainId]);
}
