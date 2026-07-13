import { Box, Button, Dialog, DialogActions, DialogContent, DialogTitle } from '@mui/material';
import Typography from '@mui/material/Typography';
import { TokenIcon } from 'src/components/primitives/TokenIcon';
import { useAddTokenToWallet, WatchableToken } from 'src/hooks/useAddTokenToWallet';

type AddTokenToWalletDialogProps = {
  /** Set by the caller once the transaction it follows has succeeded. */
  open: boolean;
  token: WatchableToken | null;
  description: string;
  onClose: () => void;
};

/**
 * Post-transaction offer to track a freshly relevant token in the wallet.
 *
 * Self-suppressing: it stays closed when the wallet cannot watch assets, when the
 * user already added this token, or when they turned the offer down earlier in the
 * session — so callers can open it after every successful transaction without
 * having to track any of that.
 */
export function AddTokenToWalletDialog({
  open,
  token,
  description,
  onClose,
}: AddTokenToWalletDialogProps) {
  const { shouldPrompt, pending, addToken, dismiss } = useAddTokenToWallet(token);

  const handleClose = () => {
    // Closing without adding is an answer too — don't ask again this session.
    dismiss();
    onClose();
  };

  const handleAdd = async () => {
    await addToken();
    onClose();
  };

  if (!token || !open || !shouldPrompt) return null;

  return (
    <Dialog open onClose={handleClose} maxWidth="xs" fullWidth>
      <DialogTitle>{`Add ${token.symbol} to your wallet`}</DialogTitle>
      <DialogContent>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <TokenIcon symbol={token.symbol} sx={{ fontSize: 32 }} />
          <Typography variant="body2" color="text.secondary">
            {description}
          </Typography>
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose} color="inherit" disabled={pending}>
          Not now
        </Button>
        <Button onClick={handleAdd} variant="contained" disabled={pending}>
          {pending ? 'Adding…' : `Add ${token.symbol}`}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
