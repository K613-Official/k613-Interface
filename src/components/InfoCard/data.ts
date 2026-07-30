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
  /** On-chain reward emissions (xK613) rendered as a badge next to the APY. */
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
