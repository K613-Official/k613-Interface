import { Button, ButtonProps } from '@mui/material';
import { TokenIcon } from 'src/components/primitives/TokenIcon';
import { useAddTokenToWallet, WatchableToken } from 'src/hooks/useAddTokenToWallet';

type AddTokenToWalletButtonProps = Omit<ButtonProps, 'onClick' | 'children'> & {
  token: WatchableToken | null;
};

/**
 * Small always-available "Add to wallet" affordance to sit next to a balance —
 * the way back for anyone who dismissed the post-transaction prompt.
 *
 * Renders nothing when the connected wallet cannot watch assets.
 */
export function AddTokenToWalletButton({ token, ...rest }: AddTokenToWalletButtonProps) {
  const { canAdd, added, pending, addToken } = useAddTokenToWallet(token);

  if (!token || !canAdd) return null;

  return (
    <Button
      variant="text"
      size="small"
      startIcon={<TokenIcon symbol={token.symbol} sx={{ fontSize: 16 }} />}
      onClick={addToken}
      disabled={pending}
      {...rest}
    >
      {pending ? 'Adding…' : added ? `${token.symbol} added` : `Add ${token.symbol} to wallet`}
    </Button>
  );
}
