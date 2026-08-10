'use client';

import { Button } from '@mui/material';

import {
  DialogActionsStyled,
  DialogBodyStyled,
  DialogTitleStyled,
  StyledDialog,
} from './k613Staking.styles';

export type K613ConfirmRequest = {
  title: string;
  body: string;
  confirmLabel: string;
  /** Colours the confirm button as a warning — used where the user gives up value. */
  danger?: boolean;
};

export function K613ConfirmDialog({
  request,
  onResolve,
}: {
  request: K613ConfirmRequest | null;
  onResolve: (confirmed: boolean) => void;
}) {
  return (
    <StyledDialog open={request !== null} onClose={() => onResolve(false)} maxWidth="xs" fullWidth>
      <DialogTitleStyled>{request?.title}</DialogTitleStyled>
      <DialogBodyStyled>{request?.body}</DialogBodyStyled>
      <DialogActionsStyled>
        <Button variant="text" color="inherit" onClick={() => onResolve(false)}>
          Cancel
        </Button>
        <Button
          variant="contained"
          color={request?.danger ? 'warning' : 'primary'}
          onClick={() => onResolve(true)}
        >
          {request?.confirmLabel}
        </Button>
      </DialogActionsStyled>
    </StyledDialog>
  );
}
