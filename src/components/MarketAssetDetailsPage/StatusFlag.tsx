import { Typography } from '@mui/material';

import { FlagItem, FlagOffDot, FlagOkIcon } from './styles';

export function StatusFlag({ ok, label }: { ok: boolean; label: string }) {
  return (
    <FlagItem>
      {ok ? <FlagOkIcon /> : <FlagOffDot />}
      <Typography variant="body1" color={ok ? 'primary' : 'text.disabled'}>
        {label}
      </Typography>
    </FlagItem>
  );
}
