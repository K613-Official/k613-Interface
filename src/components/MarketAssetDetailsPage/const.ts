export type ChartRange = '1w' | '1m' | '6m';

export type EmodeRow = { label: string; value: string };

export type EmodeCategory = {
  title: string;
  collateral: 'yes' | 'no';
  borrowable: 'yes' | 'no';
  rows: EmodeRow[];
};
