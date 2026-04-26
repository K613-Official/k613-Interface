import { Check } from '@mui/icons-material';
import { Box, Button, Typography } from '@mui/material';
import { useRootStore } from 'src/store/root';

interface SuccessViewProps {
  action: string;
  amount: string;
  symbol: string;
  txHash?: string;
  onClose: () => void;
  addToWalletAddress?: string;
  addToWalletSymbol?: string;
  addToWalletDecimals?: number;
}

export function SuccessView({
  action,
  amount,
  symbol,
  txHash,
  onClose,
  addToWalletAddress,
  addToWalletSymbol,
  addToWalletDecimals = 18,
}: SuccessViewProps) {
  const currentNetworkConfig = useRootStore((s) => s.currentNetworkConfig);

  const explorerUrl = txHash
    ? currentNetworkConfig.explorerLinkBuilder({ tx: txHash })
    : undefined;

  const handleAddToWallet = async () => {
    if (!addToWalletAddress || !addToWalletSymbol) return;
    try {
      await (window as any).ethereum?.request({
        method: 'wallet_watchAsset',
        params: {
          type: 'ERC20',
          options: {
            address: addToWalletAddress,
            symbol: addToWalletSymbol.slice(0, 11),
            decimals: addToWalletDecimals,
          },
        },
      });
    } catch {}
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2.5, py: 1 }}>

      <Box
        sx={{
          width: 72,
          height: 72,
          borderRadius: '50%',
          backgroundColor: 'rgba(97, 208, 0, 0.15)',
          border: '2px solid rgba(97, 208, 0, 0.4)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Check sx={{ fontSize: 36, color: '#61d000' }} />
      </Box>

      <Box sx={{ textAlign: 'center' }}>
        <Typography variant="h4" fontWeight={700} mb={0.5}>
          All done
        </Typography>
        <Typography variant="body1" color="text.secondary">
          You {action}{' '}
          <Box component="span" color="text.primary" fontWeight={600}>
            {Number(amount).toFixed(7)} {symbol}
          </Box>
        </Typography>
      </Box>

      {addToWalletAddress && (
        <Box
          sx={{
            width: '100%',
            border: '1px solid rgba(255,255,255,0.12)',
            borderRadius: 2,
            p: 2,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 1.5,
          }}
        >
          <Typography variant="body2" color="text.secondary" textAlign="center">
            Add {addToWalletSymbol} to wallet to track your balance.
          </Typography>
          <Button
            variant="outlined"
            size="small"
            onClick={handleAddToWallet}
            sx={{
              borderColor: 'rgba(255,255,255,0.3)',
              color: 'text.primary',
              textTransform: 'uppercase',
              fontSize: 13,
              letterSpacing: 0.5,
              '&:hover': { borderColor: 'rgba(255,255,255,0.6)' },
            }}
          >
            Add to wallet →
          </Button>
        </Box>
      )}

      <Button
        variant="contained"
        size="large"
        fullWidth
        onClick={onClose}
        sx={{
          backgroundColor: '#61d000',
          color: '#000',
          fontWeight: 700,
          fontSize: 15,
          letterSpacing: 1,
          textTransform: 'uppercase',
          '&:hover': { backgroundColor: '#78e800' },
        }}
      >
        OK, Close
      </Button>


      {explorerUrl && (
        <Button
          variant="text"
          size="small"
          fullWidth
          href={explorerUrl}
          target="_blank"
          rel="noopener"
          sx={{
            color: 'text.secondary',
            textTransform: 'uppercase',
            fontSize: 13,
            letterSpacing: 1,
            '&:hover': { color: 'text.primary' },
          }}
        >
          View Details
        </Button>
      )}
    </Box>
  );
}
