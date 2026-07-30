import { ReserveIncentiveResponse } from '@aave/math-utils/dist/esm/formatters/incentive/calculate-reserve-incentives';

export type InfoCardType = 'supply' | 'borrow';

export type InfoMetric = {
  label: string;
  value: string;
  showAlert?: boolean;
};

export type InfoPosition = {
  id: string;
  name: string;
  symbol: string;
  iconSymbol: string;
  primaryLabel: 'Balance' | 'Debt';
  primaryValue: string;
  secondaryValue: string;
  accrued?: string;
  apy: string;
  /** Same rate as `apy`, unformatted, so the total APY can be computed and sorted on. */
  apyValue: number;
  /** On-chain reward emissions (xK613), folded into the displayed total APY. */
  incentives?: ReserveIncentiveResponse[];
  collateralEnabled?: boolean;
  canToggleCollateral?: boolean;
  disableAction: boolean;
  onAction: () => void;
  onToggleCollateral?: () => void;
};

export type InfoCardViewData = {
  title: string;
  extra?: string;
  actionLabel: string;
  emptyText: string;
  metrics: InfoMetric[];
  positions: InfoPosition[];
};
