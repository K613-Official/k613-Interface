'use client';

import { Button } from '@mui/material';

import {
  DialogActionsStyled,
  DialogBodyStyled,
  DialogTitleStyled,
  StyledDialog,
} from './k613Staking.styles';
import type { K613InfoDialogKind } from './k613Staking.types';

const COPY: Record<
  Exclude<K613InfoDialogKind, null>,
  { title: string; body: string; confirm: string }
> = {
  tokensLocked: {
    title: 'Tokens locked',
    body: 'Your tokens are locked but not earning rewards yet. Send them to staking to start accruing rewards',
    confirm: 'Got it',
  },
  stakingActivated: {
    title: 'Lock successful! xK613 minted',
    body: 'Deposit your xK613 into the rewards pool to start earning',
    confirm: 'Got it',
  },
};

export function K613InfoDialog({
  open,
  kind,
  onClose,
}: {
  open: boolean;
  kind: K613InfoDialogKind;
  onClose: () => void;
}) {
  if (!kind) return null;
  const c = COPY[kind];

  return (
    <StyledDialog open={open} onClose={onClose} maxWidth="xs" fullWidth>
      <DialogTitleStyled>{c.title}</DialogTitleStyled>
      <DialogBodyStyled>{c.body}</DialogBodyStyled>
      <DialogActionsStyled>
        <Button variant="contained" color="primary" onClick={onClose}>
          {c.confirm}
        </Button>
      </DialogActionsStyled>
    </StyledDialog>
  );
}
