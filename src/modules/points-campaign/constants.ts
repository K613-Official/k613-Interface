export type CampaignTab = 'leaderboard' | 'overview' | 'rules';

const numberFormatter = new Intl.NumberFormat('en-US');

export function formatNumber(value: number): string {
  return numberFormatter.format(Math.round(value));
}

const USD_DECIMALS = 18n;
const POINTS_DECIMALS = 18n;

// Build 10^n as a BigInt WITHOUT the `**` operator: Next/SWC transpiles
// exponentiation to `Math.pow`, which throws on BigInt args in the browser
// bundle ("Cannot convert a BigInt value to a number").
function pow10(decimals: bigint): bigint {
  return BigInt('1' + '0'.repeat(Number(decimals)));
}

function formatBaseUnits(value: bigint, decimals: bigint, fractionDigits = 2): string {
  const divisor = pow10(decimals);
  const integer = value / divisor;
  const fraction = value % divisor;
  const integerStr = numberFormatter.format(Number(integer));
  if (fractionDigits <= 0 || fraction === 0n) return integerStr;
  const fractionStr = fraction.toString().padStart(Number(decimals), '0').slice(0, fractionDigits);
  return `${integerStr}.${fractionStr}`;
}

export function formatUsd(value: bigint): string {
  return formatBaseUnits(value, USD_DECIMALS, 0);
}

export function formatPoints(value: bigint): string {
  return formatBaseUnits(value, POINTS_DECIMALS, 0);
}

export function formatShare(share: number): string {
  return `${(share * 100).toFixed(2)}%`;
}

export function shortenAddress(address: string): string {
  if (!address || address.length <= 12) return address;
  return `${address.slice(0, 6)}…${address.slice(-4)}`;
}
