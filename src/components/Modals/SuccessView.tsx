import { Check } from '@mui/icons-material';
import { Box, Button, Typography } from '@mui/material';
import { ReactNode } from 'react';
import { useRootStore } from 'src/store/root';

interface SuccessViewProps {
  action: string;
  amount?: string;
  symbol: string;
  txHash?: string;
  onClose: () => void;
  addToWalletAddress?: string;
  addToWalletSymbol?: string;
  addToWalletDecimals?: number;
  description?: ReactNode;
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
  description,
}: SuccessViewProps) {
  const currentNetworkConfig = useRootStore((s) => s.currentNetworkConfig);

  const explorerUrl = txHash ? currentNetworkConfig.explorerLinkBuilder({ tx: txHash }) : undefined;

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
        {description ? (
          <Typography variant="body1" color="text.secondary">
            {description}
          </Typography>
        ) : (
          <Typography variant="body1" color="text.secondary">
            You {action}{' '}
            <Box component="span" color="text.primary" fontWeight={600}>
              {Number(amount ?? 0).toFixed(7)} {symbol}
            </Box>
          </Typography>
        )}
      </Box>

      {addToWalletAddress && (
        <Box
          sx={{
            width: '100%',
            border: '1px solid #FFFFFF4D',
            backgroundColor: '#FFFFFF1F',
            borderRadius: 1,
            p: 2,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 1.5,
          }}
        >
          <Typography variant="body2" color="text.primary" textAlign="center">
            Add {addToWalletSymbol} to wallet to track your balance.
          </Typography>
          <Button variant="contained" size="small" onClick={handleAddToWallet}>
            ADD TO WALLET →
          </Button>
        </Box>
      )}

      <Button variant="contained" size="large" fullWidth onClick={onClose}>
        OK, CLOSE
      </Button>

      {explorerUrl && (
        <Button
          variant="contained"
          color="secondary"
          size="large"
          fullWidth
          href={explorerUrl}
          target="_blank"
          rel="noopener"
        >
          VIEW DETAILS
        </Button>
      )}
    </Box>
  );
}
