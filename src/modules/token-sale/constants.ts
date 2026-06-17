import { SaleSchedule, SaleStageKey } from './types';

export const USDC_DECIMALS = 6n;
export const K613_DECIMALS = 18n;

// Build 10^n as a BigInt WITHOUT the `**` operator: Next/SWC transpiles
// exponentiation to `Math.pow`, which throws on BigInt args in the browser
// bundle ("Cannot convert a BigInt value to a number").
function pow10(decimals: bigint): bigint {
  return BigInt('1' + '0'.repeat(Number(decimals)));
}

const USDC_ONE = pow10(USDC_DECIMALS);
const K613_ONE = pow10(K613_DECIMALS);
// 10^(18 - 6) — converts USDC base units to K613 base units.
const USDC_TO_K613_SCALE = pow10(K613_DECIMALS - USDC_DECIMALS);

// Fallback sale parameters, used only until the contract's saleInfo() is read.
// Once on-chain, hardCap and saleAllocation come from the contract and the
// price is derived from them — never hardcoded.
export const HARD_CAP_USDC = 100_000n * USDC_ONE;
export const SALE_ALLOCATION_K613 = 10_000_000n * K613_ONE;

export const ERC20_ABI = [
  {
    type: 'function',
    name: 'balanceOf',
    stateMutability: 'view',
    inputs: [{ name: 'account', type: 'address' }],
    outputs: [{ type: 'uint256' }],
  },
  {
    type: 'function',
    name: 'allowance',
    stateMutability: 'view',
    inputs: [
      { name: 'owner', type: 'address' },
      { name: 'spender', type: 'address' },
    ],
    outputs: [{ type: 'uint256' }],
  },
  {
    type: 'function',
    name: 'approve',
    stateMutability: 'nonpayable',
    inputs: [
      { name: 'spender', type: 'address' },
      { name: 'amount', type: 'uint256' },
    ],
    outputs: [{ type: 'bool' }],
  },
] as const;

// ---------------------------------------------------------------------------
// Pro-rata math. Mirrors the sale contract; hardCap6 and saleAllocation18 come
// from saleInfo() so the page always reflects the deployed parameters:
//   Token Price     = Hard Cap / Sale Allocation
//   User Allocation = User Deposit / max(Total Deposits, Hard Cap) * Sale Allocation
//   User Used Funds = User Allocation * Token Price
//   Refund          = User Deposit - User Used Funds
// ---------------------------------------------------------------------------

/** Token price in USD, derived from the on-chain hard cap and sale allocation. */
export function getTokenPriceUsd(hardCap6: bigint, saleAllocation18: bigint): number {
  if (saleAllocation18 <= 0n) return 0;
  // price = (hardCap6 / 10^6) / (saleAllocation18 / 10^18) = hardCap6 * 10^12 / saleAllocation18.
  // Scale by 10^6 for fractional precision before converting to a JS number.
  const PRICE_PRECISION = 1_000_000n;
  const scaled = (hardCap6 * USDC_TO_K613_SCALE * PRICE_PRECISION) / saleAllocation18;
  return Number(scaled) / Number(PRICE_PRECISION);
}

/** K613 allocation (18 decimals) for a USDC deposit (6 decimals). */
export function getAllocation(
  deposit6: bigint,
  total6: bigint,
  hardCap6: bigint,
  saleAllocation18: bigint
): bigint {
  if (deposit6 <= 0n || hardCap6 <= 0n || saleAllocation18 <= 0n) return 0n;
  // Below the cap every dollar converts at the fixed price; above it, pro-rata
  // over total deposits. Both reduce to deposit * allocation / max(cap, total).
  const denominator = total6 > hardCap6 ? total6 : hardCap6;
  return (deposit6 * saleAllocation18) / denominator;
}

/** USDC (6 decimals) actually spent for a K613 allocation (18 decimals). */
export function getUsedFunds(
  allocation18: bigint,
  hardCap6: bigint,
  saleAllocation18: bigint
): bigint {
  if (saleAllocation18 <= 0n) return 0n;
  // used = allocation * price = allocation18 * hardCap6 / saleAllocation18.
  return (allocation18 * hardCap6) / saleAllocation18;
}

/** USDC (6 decimals) returned to the user after the sale is finalized. */
export function getRefund(
  deposit6: bigint,
  total6: bigint,
  hardCap6: bigint,
  saleAllocation18: bigint
): bigint {
  const used6 = getUsedFunds(
    getAllocation(deposit6, total6, hardCap6, saleAllocation18),
    hardCap6,
    saleAllocation18
  );
  return deposit6 > used6 ? deposit6 - used6 : 0n;
}

/** User share of the deposit pool, as a fraction (0..1). */
export function getPoolShare(deposit6: bigint, total6: bigint): number {
  if (total6 <= 0n || deposit6 <= 0n) return 0;
  return Number((deposit6 * 1_000_000n) / total6) / 1_000_000;
}

/** Total Deposits / Hard Cap, as a number (e.g. 2.45). */
export function getOversubscription(total6: bigint, hardCap6: bigint): number {
  if (hardCap6 <= 0n) return 0;
  return Number((total6 * 1_000_000n) / hardCap6) / 1_000_000;
}

/** Fraction of each deposited dollar converted into K613 (1 until the cap is exceeded). */
export function getAllocationRatio(total6: bigint, hardCap6: bigint): number {
  if (hardCap6 <= 0n || total6 <= hardCap6) return 1;
  return Number((hardCap6 * 10_000n) / total6) / 10_000;
}

// ---------------------------------------------------------------------------
// Formatting
// ---------------------------------------------------------------------------

const numberFormatter = new Intl.NumberFormat('en-US');

function formatBaseUnits(value: bigint, decimals: bigint, fractionDigits: number): string {
  const divisor = pow10(decimals);
  if (fractionDigits <= 0) {
    const rounded = (value + divisor / 2n) / divisor;
    return numberFormatter.format(Number(rounded));
  }
  const scale = pow10(BigInt(fractionDigits));
  const scaled = (value * scale + divisor / 2n) / divisor;
  const integer = scaled / scale;
  const fraction = scaled % scale;
  const integerStr = numberFormatter.format(Number(integer));
  const fractionStr = fraction.toString().padStart(fractionDigits, '0');
  return `${integerStr}.${fractionStr}`;
}

export function formatUsdc(value6: bigint, fractionDigits = 2): string {
  return `$${formatBaseUnits(value6, USDC_DECIMALS, fractionDigits)}`;
}

export function formatUsdcPlain(value6: bigint, fractionDigits = 2): string {
  return formatBaseUnits(value6, USDC_DECIMALS, fractionDigits);
}

export function formatK613(value18: bigint, fractionDigits = 2): string {
  return formatBaseUnits(value18, K613_DECIMALS, fractionDigits);
}

export function formatShare(share: number): string {
  return `${(share * 100).toFixed(2)}%`;
}

/** "$0.01"-style price string derived from the on-chain hard cap and allocation. */
export function formatTokenPriceUsd(hardCap6: bigint, saleAllocation18: bigint): string {
  const price = getTokenPriceUsd(hardCap6, saleAllocation18);
  // Show up to 6 significant fractional digits, trimming trailing zeros.
  const text = price.toFixed(6).replace(/\.?0+$/, '');
  return `$${text}`;
}

export function formatMultiple(value: number): string {
  return `${value.toFixed(2)}x`;
}

/** Parses user decimal input ("12.5") into base units. Returns null on invalid input. */
export function parseUsdcInput(input: string): bigint | null {
  const trimmed = input.trim();
  if (!trimmed || !/^\d*\.?\d*$/.test(trimmed) || trimmed === '.') return null;
  const [integerPart = '', fractionPart = ''] = trimmed.split('.');
  const fraction = fractionPart.slice(0, Number(USDC_DECIMALS)).padEnd(Number(USDC_DECIMALS), '0');
  try {
    return BigInt(integerPart || '0') * USDC_ONE + BigInt(fraction || '0');
  } catch {
    return null;
  }
}

/** Renders base units as a plain decimal string for the amount input. */
export function usdcToInputValue(value6: bigint): string {
  const integer = value6 / USDC_ONE;
  const fraction = value6 % USDC_ONE;
  if (fraction === 0n) return integer.toString();
  const fractionStr = fraction.toString().padStart(Number(USDC_DECIMALS), '0').replace(/0+$/, '');
  return `${integer.toString()}.${fractionStr}`;
}

// ---------------------------------------------------------------------------
// Sale stages
// ---------------------------------------------------------------------------

export const STAGE_ORDER: SaleStageKey[] = [
  'upcoming',
  'contribution',
  'closed',
  'finalized',
  'claim',
];

export const STAGE_LABELS: Record<SaleStageKey, string> = {
  upcoming: 'Upcoming',
  contribution: 'Contribution Open',
  closed: 'Sale Closed',
  finalized: 'Allocation Finalized',
  claim: 'Claim Open',
};

export function getCurrentStage(schedule: SaleSchedule, nowMs: number): SaleStageKey {
  if (nowMs < schedule.saleStartMs) return 'upcoming';
  if (nowMs < schedule.saleEndMs) return 'contribution';
  if (!schedule.finalized) return 'closed';
  if (schedule.claimStartMs === 0 || nowMs >= schedule.claimStartMs) return 'claim';
  return 'finalized';
}

/**
 * Whether the on-chain claim window has closed. The contract's `stage` is
 * derived from time and finalization; the one lifecycle bit not captured by
 * getCurrentStage is the claim deadline (`block.timestamp + CLAIM_WINDOW`),
 * after which claims revert. Mirrors that here from the on-chain claimDeadline.
 */
export function isClaimWindowClosed(schedule: SaleSchedule, nowMs: number): boolean {
  return schedule.finalized && schedule.claimDeadlineMs > 0 && nowMs >= schedule.claimDeadlineMs;
}

export type StageStatus = 'completed' | 'active' | 'pending';

export function getStageStatus(stage: SaleStageKey, current: SaleStageKey): StageStatus {
  const stageIndex = STAGE_ORDER.indexOf(stage);
  const currentIndex = STAGE_ORDER.indexOf(current);
  if (stageIndex < currentIndex) return 'completed';
  if (stageIndex === currentIndex) return 'active';
  return 'pending';
}

export function getCountdownLabel(targetMs: number, nowMs: number): string {
  const diff = Math.max(0, targetMs - nowMs);
  const days = Math.floor(diff / 86_400_000);
  const hours = Math.floor((diff % 86_400_000) / 3_600_000);
  const minutes = Math.floor((diff % 3_600_000) / 60_000);
  const seconds = Math.floor((diff % 60_000) / 1000);
  if (days > 0) return `${days}d ${hours}h ${minutes}m ${seconds}s`;
  return `${hours}h ${minutes}m ${seconds}s`;
}

export function formatDateTimeUtc(ms: number): string {
  if (!Number.isFinite(ms) || ms === 0) return 'TBA';
  const date = new Intl.DateTimeFormat('en-CA', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    timeZone: 'UTC',
  }).format(ms);
  const time = new Intl.DateTimeFormat('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
    timeZone: 'UTC',
  }).format(ms);
  return `${date} ${time} (UTC)`;
}
