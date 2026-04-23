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
  apy: string;
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
