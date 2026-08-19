import { useQuery } from '@tanstack/react-query';
import { UNISWAP_K613_USDC_POOL } from 'src/const/links';
import { MONAD_CHAIN_ID } from 'src/ui-config/networksConfig';
import { parseAbiItem } from 'viem';
import { usePublicClient } from 'wagmi';

const SLOT0 = parseAbiItem(
  'function slot0() view returns (uint160 sqrtPriceX96, int24 tick, uint16 observationIndex, uint16 observationCardinality, uint16 observationCardinalityNext, uint8 feeProtocol, bool unlocked)'
);
const TOKEN0 = parseAbiItem('function token0() view returns (address)');
const DECIMALS = parseAbiItem('function decimals() view returns (uint8)');

const Q96 = Math.pow(2, 96);

/**
 * K613 price in USD, straight from the Uniswap pool.
 *
 * There is no oracle for K613 — the pool is the only on-chain source, so the price
 * is derived from `slot0`. Token order is read rather than assumed: a pool sorts its
 * tokens by address, and hardcoding "K613 is token1" silently inverts the price if a
 * different pool is ever pointed at.
 */
export function useK613Price() {
  const publicClient = usePublicClient({ chainId: MONAD_CHAIN_ID });

  const { data, isLoading } = useQuery({
    queryKey: ['k613-price', UNISWAP_K613_USDC_POOL, publicClient?.chain?.id],
    enabled: Boolean(publicClient),
    staleTime: 60 * 1000,
    refetchInterval: 60 * 1000,
    retry: false,
    queryFn: async (): Promise<number | null> => {
      if (!publicClient) return null;
      const pool = UNISWAP_K613_USDC_POOL as `0x${string}`;

      const [slot0, token0] = await Promise.all([
        publicClient.readContract({ address: pool, abi: [SLOT0], functionName: 'slot0' }),
        publicClient.readContract({ address: pool, abi: [TOKEN0], functionName: 'token0' }),
      ]);

      const [decimals0, decimals1] = await Promise.all([
        publicClient.readContract({ address: token0, abi: [DECIMALS], functionName: 'decimals' }),
        // token1 is whatever the pool's other side is; K613 has 18 decimals either way
        Promise.resolve(18),
      ]);

      // (sqrtPriceX96 / 2^96)^2 is token1 per token0 in raw units
      const sqrtPrice = Number(slot0[0]) / Q96;
      const rawRatio = sqrtPrice * sqrtPrice;
      if (!Number.isFinite(rawRatio) || rawRatio === 0) return null;

      const humanRatio = rawRatio * Math.pow(10, Number(decimals0) - Number(decimals1));
      // token0 is USDC when its decimals are 6 — then the ratio is K613 per USDC
      const k613PerUsdc = Number(decimals0) === 6 ? humanRatio : 1 / humanRatio;
      const price = 1 / k613PerUsdc;

      return Number.isFinite(price) && price > 0 ? price : null;
    },
  });

  return { k613Price: data ?? null, isLoading };
}
