/**
 * Single number formatter for every figure the UI prints.
 *
 * Two rules, both about legibility rather than precision:
 *  - decimals scale with magnitude — four below 1, two up to 10, none above,
 *    so a column of numbers keeps roughly the same width;
 *  - thousands collapse into K / M / B, and anything past 999B is not a number
 *    a user needs to read, so it renders as ∞.
 *
 * Precision belongs in tooltips and inputs, not in headline figures: a balance
 * printed as 314,319.7704 is four digits of noise nobody acts on.
 */

const UNITS = [
  { limit: 1e9, suffix: 'B' },
  { limit: 1e6, suffix: 'M' },
  { limit: 1e3, suffix: 'K' },
] as const;

/** Past this the figure is meaningless in a UI — show the symbol instead. */
const INFINITY_THRESHOLD = 1e12;

/** Below this the four-decimal band would print a non-zero balance as 0.0000. */
const SMALLEST_SHOWN = 0.0001;

const decimalsFor = (value: number) => {
  const abs = Math.abs(value);
  if (abs === 0) return 0;
  if (abs < 1) return 4;
  if (abs < 10) return 2;
  return 0;
};

export type FormatNumberOptions = {
  /** Prefix for money, e.g. '$'. Placed before the minus sign is dropped. */
  prefix?: string;
  /** Suffix glued to the number, e.g. '%'. */
  suffix?: string;
  /** Keep the full number instead of collapsing into K/M/B. */
  compact?: boolean;
};

export const formatNumber = (
  value: number | string | undefined | null,
  { prefix = '', suffix = '', compact = true }: FormatNumberOptions = {}
): string => {
  const parsed = typeof value === 'string' ? Number(value) : value;
  if (parsed === undefined || parsed === null || Number.isNaN(parsed)) return `${prefix}—`;
  if (!Number.isFinite(parsed) || Math.abs(parsed) >= INFINITY_THRESHOLD) {
    return `${prefix}${parsed < 0 ? '-' : ''}∞${suffix}`;
  }

  const abs = Math.abs(parsed);
  if (abs > 0 && abs < SMALLEST_SHOWN) {
    return `${parsed < 0 ? '-' : ''}<${prefix}${SMALLEST_SHOWN}${suffix}`;
  }

  const unit = compact ? UNITS.find((u) => abs >= u.limit) : undefined;
  const scaled = unit ? parsed / unit.limit : parsed;
  const text = scaled.toLocaleString('en-US', {
    minimumFractionDigits: decimalsFor(scaled),
    maximumFractionDigits: decimalsFor(scaled),
  });

  return `${prefix}${text}${unit?.suffix ?? ''}${suffix}`;
};

/** Money. The prefix makes it unambiguous which figures are dollars. */
export const formatUsd = (value: number | string | undefined | null) =>
  formatNumber(value, { prefix: '$' });

/**
 * Percentages keep two decimals up to 1000 instead of following the amount ladder:
 * a rate is read for its precision, and rounding 13.56% to 14% moves the figure by
 * more than the difference people argue about. Past 1000 it compacts like anything
 * else, so 1775.79 reads as 1.78K%.
 */
export const formatPercentValue = (value: number | string | undefined | null) => {
  const parsed = typeof value === 'string' ? Number(value) : value;
  if (parsed === undefined || parsed === null || Number.isNaN(parsed)) return '—';
  if (!Number.isFinite(parsed) || Math.abs(parsed) >= INFINITY_THRESHOLD) {
    return `${parsed < 0 ? '-' : ''}∞%`;
  }
  const abs = Math.abs(parsed);
  if (abs >= 1000) return formatNumber(parsed, { suffix: '%' });
  if (abs > 0 && abs < 0.01) return `${parsed < 0 ? '-' : ''}<0.01%`;
  return `${parsed.toFixed(2)}%`;
};

/** Token amounts, with the ticker attached. */
export const formatToken = (value: number | string | undefined | null, symbol: string) =>
  `${formatNumber(value)} ${symbol}`;
