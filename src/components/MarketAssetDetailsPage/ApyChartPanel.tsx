import { ButtonGroup, Typography } from '@mui/material';

import { CHART_RANGES } from './const';
import {
  ApyRangeButton,
  ChartAvgPill,
  ChartBlock,
  ChartPlaceholder,
  ChartSvg,
  ChartTag,
  ChartToolbar,
} from './styles';
import { ChartRange } from './types';

export function ApyChartPanel({
  title,
  avgLabel,
  range,
  onRangeChange,
  accent,
}: {
  title: string;
  avgLabel: string;
  range: ChartRange;
  onRangeChange: (r: ChartRange) => void;
  accent: 'supply' | 'borrow';
}) {
  const stroke = accent === 'supply' ? '#4CAF50' : '#29B6F6';
  const gradId = `grad-${accent}`;

  return (
    <ChartBlock>
      <ChartToolbar>
        <ChartTag>
          <Typography variant="subtitle2">{title}</Typography>
        </ChartTag>
        <ButtonGroup size="small" variant="outlined" color="inherit">
          {CHART_RANGES.map((r) => (
            <ApyRangeButton
              key={r}
              onClick={() => onRangeChange(r)}
              variant={range === r ? 'contained' : 'outlined'}
              color="inherit"
            >
              {r}
            </ApyRangeButton>
          ))}
        </ButtonGroup>
      </ChartToolbar>
      <ChartPlaceholder>
        <ChartSvg viewBox="0 0 400 140" preserveAspectRatio="none">
          <defs>
            <linearGradient id={gradId} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={stroke} stopOpacity="0.35" />
              <stop offset="100%" stopColor={stroke} stopOpacity="0" />
            </linearGradient>
          </defs>
          <path
            d="M0,100 C60,95 80,40 140,55 S220,20 280,48 S360,30 400,38 L400,140 L0,140 Z"
            fill={`url(#${gradId})`}
          />
          <path
            d="M0,100 C60,95 80,40 140,55 S220,20 280,48 S360,30 400,38"
            fill="none"
            stroke={stroke}
            strokeWidth="2"
            vectorEffect="non-scaling-stroke"
          />
        </ChartSvg>
        <ChartAvgPill>
          <Typography variant="caption">{avgLabel}</Typography>
        </ChartAvgPill>
      </ChartPlaceholder>
    </ChartBlock>
  );
}
