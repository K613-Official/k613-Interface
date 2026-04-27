import { Check } from '@mui/icons-material';
import { Box, Button, Stack, Typography } from '@mui/material';
import { ReactNode } from 'react';
import { ATokenIcon, TokenIcon } from 'src/components/primitives/TokenIcon';
import { useRootStore } from 'src/store/root';

interface SuccessViewProps {
  action: string;
  amount?: string;
  symbol: string;
  iconSymbol?: string;
  txHash?: string;
  onClose: () => void;
  addToWalletAddress?: string;
  addToWalletSymbol?: string;
  addToWalletDecimals?: number;
  addToWalletKind?: 'aToken' | 'debtToken';
  description?: ReactNode;
}

export function SuccessView({
  action,
  amount,
  symbol,
  iconSymbol,
  txHash,
  onClose,
  addToWalletAddress,
  addToWalletSymbol,
  addToWalletDecimals = 18,
  addToWalletKind = 'aToken',
  description,
}: SuccessViewProps) {
  const currentNetworkConfig = useRootStore((s) => s.currentNetworkConfig);

  const explorerUrl = txHash ? currentNetworkConfig.explorerLinkBuilder({ tx: txHash }) : undefined;
  const baseIcon = iconSymbol ?? symbol;

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
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 2,
        py: 0.5,
        width: '100%',
      }}
    >
      <Box
        sx={{
          width: 56,
          height: 56,
          borderRadius: '50%',
          backgroundColor: 'rgba(97, 208, 0, 0.15)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Check sx={{ fontSize: 30, color: '#61d000' }} />
      </Box>

      <Box sx={{ textAlign: 'center' }}>
        <Typography variant="h5" fontWeight={700} mb={0.5}>
          All done
        </Typography>
        {description ? (
          <Typography variant="body2" color="text.secondary">
            {description}
          </Typography>
        ) : (
          <Stack direction="row" spacing={0.75} alignItems="center" justifyContent="center">
            <Typography variant="body2" color="text.secondary">
              You {action}
            </Typography>
            <TokenIcon symbol={baseIcon} sx={{ fontSize: 16 }} />
            <Typography variant="body2" color="text.primary" fontWeight={600}>
              {Number(amount ?? 0).toFixed(7)} {symbol}
            </Typography>
          </Stack>
        )}
      </Box>

      {addToWalletAddress && (
        <Box
          sx={{
            width: '100%',
            border: '1px solid #FFFFFF4D',
            backgroundColor: '#FFFFFF1F',
            borderRadius: 1,
            p: 1.5,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 1,
          }}
        >
          <Stack direction="row" spacing={0.75} alignItems="center" justifyContent="center">
            <Typography variant="caption" color="text.primary" textAlign="center">
              Add
            </Typography>
            {addToWalletKind === 'aToken' ? (
              <ATokenIcon symbol={baseIcon} sx={{ fontSize: 16 }} />
            ) : (
              <TokenIcon symbol={baseIcon} sx={{ fontSize: 16 }} />
            )}
            <Typography variant="caption" color="text.primary">
              {addToWalletSymbol}
            </Typography>
            <Typography variant="caption" color="text.primary">
              to wallet to track your balance.
            </Typography>
          </Stack>
          <Button variant="contained" size="small" onClick={handleAddToWallet}>
            ADD TO WALLET →
          </Button>
        </Box>
      )}

      <Button variant="contained" size="medium" fullWidth onClick={onClose}>
        OK, CLOSE
      </Button>

      {explorerUrl && (
        <Button
          variant="contained"
          color="secondary"
          size="medium"
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
