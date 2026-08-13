import { EmodeDataHumanized, ReserveDataHumanized } from '@aave/contract-helpers';

/**
 * The v3.1 UiPoolDataProvider (LegacyUiPoolDataProvider in contract-helpers) has no getEModes()
 * view — its getEModesHumanized() is hardcoded to return an empty array. It does return the e-mode
 * fields inline on every reserve though, so the categories can be reconstructed from the reserves
 * payload without any extra RPC call.
 *
 * v3.1 semantics: a reserve belongs to exactly one category, and while the user is in that category
 * it uses the boosted LTV/LT as collateral and is the only thing borrowable. That maps 1:1 onto the
 * v3.2+ bitmap shape every formatter downstream expects.
 */
type LegacyEModeFields = {
  eModeCategoryId: number;
  eModeLtv: number;
  eModeLiquidationThreshold: number;
  eModeLiquidationBonus: number;
  eModeLabel: string;
};

export type LegacyReserveDataHumanized = ReserveDataHumanized & Partial<LegacyEModeFields>;

const BITMAP_BITS = 256;

// formatters read the bit of a reserve at `bitmap[bitmap.length - originalId - 1]`
const toBitmap = (reserveIds: number[]): string => {
  const bits = new Array<string>(BITMAP_BITS).fill('0');
  reserveIds.forEach((id) => {
    if (id >= 0 && id < BITMAP_BITS) {
      bits[BITMAP_BITS - id - 1] = '1';
    }
  });
  return bits.join('');
};

type CategoryDraft = {
  ltv: number;
  liquidationThreshold: number;
  liquidationBonus: number;
  label: string;
  collateral: number[];
  borrowable: number[];
};

export const deriveEModesFromReserves = (
  reserves: LegacyReserveDataHumanized[]
): EmodeDataHumanized[] => {
  const categories = new Map<number, CategoryDraft>();

  reserves.forEach((reserve) => {
    const categoryId = reserve.eModeCategoryId;
    if (!categoryId) return;

    let category = categories.get(categoryId);
    if (!category) {
      category = {
        ltv: reserve.eModeLtv ?? 0,
        liquidationThreshold: reserve.eModeLiquidationThreshold ?? 0,
        liquidationBonus: reserve.eModeLiquidationBonus ?? 0,
        label: reserve.eModeLabel ?? '',
        collateral: [],
        borrowable: [],
      };
      categories.set(categoryId, category);
    }

    // every reserve of a category reports the same params (they are read from the pool category),
    // but keep the first non-zero set in case a reserve was configured before the category itself
    if (category.ltv === 0 && reserve.eModeLtv) {
      category.ltv = reserve.eModeLtv;
      category.liquidationThreshold = reserve.eModeLiquidationThreshold ?? 0;
      category.liquidationBonus = reserve.eModeLiquidationBonus ?? 0;
      category.label = reserve.eModeLabel ?? category.label;
    }

    if (reserve.usageAsCollateralEnabled) {
      category.collateral.push(reserve.originalId);
    }
    if (reserve.borrowingEnabled) {
      category.borrowable.push(reserve.originalId);
    }
  });

  return Array.from(categories.entries())
    .sort(([a], [b]) => a - b)
    .map(([id, category]) => ({
      id,
      eMode: {
        ltv: category.ltv.toString(),
        liquidationThreshold: category.liquidationThreshold.toString(),
        liquidationBonus: category.liquidationBonus.toString(),
        label: category.label,
        collateralBitmap: toBitmap(category.collateral),
        borrowableBitmap: toBitmap(category.borrowable),
      },
    }));
};
