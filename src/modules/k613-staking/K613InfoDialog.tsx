'use client';

import { Button } from '@mui/material';
import { AddTokenToWalletButton } from 'src/components/AddTokenToWallet';
import { XK613_TOKEN_META } from 'src/const/k613Tokens';
import { WatchableToken } from 'src/hooks/useAddTokenToWallet';

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
    body: 'Deposit your xK613 into the rewards pool to start earning rewards',
    confirm: 'Got it',
  },
};

export function K613InfoDialog({
  open,
  kind,
  xk613Address,
  onClose,
}: {
  open: boolean;
  kind: K613InfoDialogKind;
  /** `undefined` until the staking contract reports it; hides the offer until then. */
  xk613Address?: `0x${string}`;
  onClose: () => void;
}) {
  if (!kind) return null;
  const c = COPY[kind];

  // xK613 has just been minted to the user, so this is the moment to offer it.
  const xk613Token: WatchableToken | null =
    kind === 'stakingActivated' && xk613Address
      ? { address: xk613Address, ...XK613_TOKEN_META }
      : null;

  return (
    <StyledDialog open={open} onClose={onClose} maxWidth="xs" fullWidth>
      <DialogTitleStyled>{c.title}</DialogTitleStyled>
      <DialogBodyStyled>{c.body}</DialogBodyStyled>
      <DialogActionsStyled>
        <AddTokenToWalletButton token={xk613Token} />
        <Button variant="contained" color="primary" onClick={onClose}>
          {c.confirm}
        </Button>
      </DialogActionsStyled>
    </StyledDialog>
  );
}
