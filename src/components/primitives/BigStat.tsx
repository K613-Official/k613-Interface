import { Box, Skeleton, Typography } from '@mui/material';

import { FormattedNumber } from './FormattedNumber';

interface BigStatProps {
  value: string | number;
  loading?: boolean;
  symbol?: string;
  percent?: boolean;
  showDollar?: boolean;
  visibleDecimals?: number;
  fontSizeXs?: number;
  fontSizeMd?: number;
  fontWeight?: number;
}

export function BigStat({
  value,
  loading,
  symbol,
  percent,
  showDollar = true,
  visibleDecimals,
  fontSizeXs = 14,
  fontSizeMd = 20,
  fontWeight = 500,
}: BigStatProps) {
  if (loading) {
    return <Skeleton width={120} height={36} sx={{ mt: 0.5 }} />;
  }
  return (
    <Box sx={{ display: 'flex', alignItems: 'baseline', gap: 0.5 }}>
      {showDollar && !symbol && !percent && (
        <Typography
          component="span"
          color="text.secondary"
          sx={{ fontSize: { xs: fontSizeXs, md: fontSizeMd }, fontWeight: fontWeight, lineHeight: 1 }}
        >
          $
        </Typography>
      )}
      <FormattedNumber
        value={value}
        component="span"
        color="text.primary"
        compact
        symbol={symbol}
        percent={percent}
        visibleDecimals={visibleDecimals}
        sx={{ fontSize: { xs: fontSizeXs, md: fontSizeMd }, fontWeight: fontWeight, lineHeight: 1.1 }}
      />
    </Box>
  );
}
