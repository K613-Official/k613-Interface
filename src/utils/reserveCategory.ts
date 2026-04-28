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

/** Ethereum-style liquid staking receipt tokens (check before generic ETH / WETH). */
const LST_SYMBOLS = new Set([
  'STETH',
  'WSTETH',
  'RETH',
  'CBETH',
  'OSETH',
  'WEETH',
  'EZETH',
  'RSETH',
  'SFRXETH',
  'ANKRETH',
  'SWETH',
  'ETHX',
  'SMON',
  'SHMON',
]);

const BTC_SYMBOLS = new Set([
  'WBTC',
  'TBTC',
  'BTCB',
  'BTC',
  'CBTC',
  'HBTC',
  'PBTC',
  'SBTC',
  'RENBTC',
]);

const ETH_SYMBOLS = new Set(['ETH', 'WETH']);

/** Native / wrapped Monad ecosystem (not LST). */
const MON_SYMBOLS = new Set(['MON', 'WMON', 'GMON']);

export type ReserveCategory = 'stable' | 'eth' | 'btc' | 'mon' | 'lst';

/** Fixed filter order in UI (all five options are always shown). */
export const ALL_RESERVE_CATEGORIES: readonly ReserveCategory[] = [
  'stable',
  'eth',
  'btc',
  'mon',
  'lst',
] as const;

function normalizeSymbol(symbol: string): string {
  const raw = symbol.toUpperCase();
  return raw.split('.')[0];
}

function isStablecoin(normalized: string): boolean {
  if (STABLECOIN_SYMBOLS.has(normalized)) return true;
  if (normalized.endsWith('USDC') || normalized.endsWith('USDT')) return true;
  return false;
}

function isLST(normalized: string): boolean {
  if (LST_SYMBOLS.has(normalized)) return true;
  if (normalized.startsWith('WST') && normalized.includes('ETH')) return true;
  if (normalized.endsWith('STETH') || normalized.includes('STETH')) return true;
  return false;
}

function isBTC(normalized: string): boolean {
  if (BTC_SYMBOLS.has(normalized)) return true;
  return normalized.endsWith('BTC') || normalized.startsWith('TBTC');
}

function isETH(normalized: string): boolean {
  return ETH_SYMBOLS.has(normalized);
}

function isMON(normalized: string): boolean {
  return MON_SYMBOLS.has(normalized);
}

/**
 * Bucket for Markets / Assets table filters: Stable, ETH, BTC, MON, LST.
 * Order: stable → lst → btc → eth → mon → default eth (other assets).
 */
export function reserveCategory(reserve: Pick<ComputedReserveData, 'symbol'>): ReserveCategory {
  const normalized = normalizeSymbol(reserve.symbol);

  if (isStablecoin(normalized)) return 'stable';
  if (isLST(normalized)) return 'lst';
  if (isBTC(normalized)) return 'btc';
  if (isETH(normalized)) return 'eth';
  if (isMON(normalized)) return 'mon';
  return 'eth';
}

export const CATEGORY_LABELS: Record<ReserveCategory, string> = {
  stable: 'Stable',
  eth: 'ETH',
  btc: 'BTC',
  mon: 'MON',
  lst: 'LST',
};
