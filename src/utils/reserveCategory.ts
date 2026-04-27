import { ComputedReserveData } from 'src/hooks/app-data-provider/useAppDataProvider';

const STABLECOIN_SYMBOLS = new Set([
  'USDC',
  'USDT',
  'DAI',
  'FRAX',
  'LUSD',
  'GHO',
  'TUSD',
  'USDP',
  'PYUSD',
  'EURC',
  'BUSD',
  'SUSD',
  'USDBC',
  'USDS',
  'CRVUSD',
  'RLUSD',
  'EUSD',
  'USDE',
  'AUSD',
  'USDA',
  'DOLA',
  'MIM',
]);

export type ReserveCategory = 'crypto' | 'stablecoin';

/**
 * Heuristic: matches stable vs volatile classification used on the Markets page.
 */
export function reserveCategory(reserve: Pick<ComputedReserveData, 'symbol'>): ReserveCategory {
  const raw = reserve.symbol.toUpperCase();
  const base = raw.split('.')[0];
  if (STABLECOIN_SYMBOLS.has(raw) || STABLECOIN_SYMBOLS.has(base)) {
    return 'stablecoin';
  }
  if (raw.endsWith('USDC') || raw.endsWith('USDT')) {
    return 'stablecoin';
  }
  return 'crypto';
}

export const CATEGORY_LABELS: Record<ReserveCategory, string> = {
  stablecoin: 'Stablecoins',
  crypto: 'Crypto',
};
