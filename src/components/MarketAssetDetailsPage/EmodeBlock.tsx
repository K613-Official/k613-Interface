import { Box, Typography } from '@mui/material';

import { StatusFlag } from './StatusFlag';
import { EmodeCategoryCard, FlagRow, ParamRow, ParamRows } from './styles';
import { EmodeCategory } from './types';

export function EmodeBlock({ category }: { category: EmodeCategory }) {
  return (
    <EmodeCategoryCard>
      <Box display="flex" flexDirection="column" gap={1.5}>
        <Typography variant="body1">{category.title}</Typography>
        <FlagRow>
          <StatusFlag ok={category.collateral === 'yes'} label="Collateral" />
          <StatusFlag ok={category.borrowable === 'yes'} label="Borrowable" />
        </FlagRow>
      </Box>
      <ParamRows>
        {category.rows.map((row) => (
          <ParamRow key={row.label}>
            <Typography variant="body2" color="text.secondary">
              {row.label}
            </Typography>
            <Typography variant="h6">{row.value}</Typography>
          </ParamRow>
        ))}
      </ParamRows>
    </EmodeCategoryCard>
  );
}
