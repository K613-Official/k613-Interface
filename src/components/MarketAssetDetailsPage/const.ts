import { ChartRange } from './types';

export const CHART_RANGES: readonly ChartRange[] = ['1w', '1m', '6m'] as const;
export const DEFAULT_CHART_RANGE: ChartRange = '1w';
