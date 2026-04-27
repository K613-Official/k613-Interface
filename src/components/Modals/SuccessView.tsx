import { Check } from '@mui/icons-material';
import { Box, Button, Stack, Typography } from '@mui/material';
import { ReactNode, useState } from 'react';
import { TokenIcon } from 'src/components/primitives/TokenIcon';
import { useDevice } from 'src/hooks';
import { useWeb3Context } from 'src/libs/hooks/useWeb3Context';
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
  const { addERC20Token } = useWeb3Context();
  const [adding, setAdding] = useState(false);
  const [addError, setAddError] = useState<string | undefined>();

  const explorerUrl = txHash ? currentNetworkConfig.explorerLinkBuilder({ tx: txHash }) : undefined;
  const baseIcon = iconSymbol ?? symbol;
  // MetaMask validates the symbol against the on-chain contract AND limits it to 11 chars.
  // Long debt symbols like `variableDebtUSDC` cannot satisfy both, so we fall back to copying the address.
  const walletSymbol = addToWalletSymbol ?? '';
  const canAutoAdd = walletSymbol.length > 0 && walletSymbol.length <= 11;
  const [copied, setCopied] = useState(false);

  const { isMobile } = useDevice();

  const handleAddToWallet = async () => {
    if (!addToWalletAddress || !walletSymbol) return;
    setAddError(undefined);
    setAdding(true);
    try {
      const ok = await addERC20Token({
        address: addToWalletAddress,
        symbol: walletSymbol,
        decimals: addToWalletDecimals,
        aToken: addToWalletKind === 'aToken',
      });
      if (!ok) setAddError('Wallet rejected or unsupported.');
    } catch (e) {
      setAddError((e as Error)?.message ?? 'Failed to add token.');
    } finally {
      setAdding(false);
    }
  };

  const handleCopyAddress = async () => {
    if (!addToWalletAddress) return;
    try {
      await navigator.clipboard.writeText(addToWalletAddress);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
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
        pt: 4,
        width: '100%',
      }}
    >
      <Box
        sx={{
          width: 100,
          height: 100,
          borderRadius: '50%',
          backgroundColor: 'rgba(97, 208, 0, 0.15)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Check sx={{ fontSize: 60, color: '#61d000' }} />
      </Box>

      <Box sx={{ textAlign: 'center' }}>
        <Typography variant="h5" fontSize={32} fontWeight={500} mb={0.5}>
          All done
        </Typography>
        {description ? (
          <Typography variant="body2" color="text.secondary">
            {description}
          </Typography>
        ) : (
          <Stack
            direction={isMobile ? 'column' : 'row'}
            spacing={0.75}
            alignItems="center"
            justifyContent="center"
          >
            <Typography variant="h5">You {action}</Typography>
            <Box display="flex" gap={0.75} alignItems="center">
              <TokenIcon symbol={baseIcon} sx={{ fontSize: 24 }} />
              <Typography variant="h5" color="text.primary" fontWeight={500}>
                {Number(amount ?? 0).toFixed(7)} {symbol}
              </Typography>
            </Box>
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
            <TokenIcon symbol={baseIcon} sx={{ fontSize: 16 }} />
            <Typography variant="caption" color="text.primary">
              {walletSymbol}
            </Typography>
            <Typography variant="caption" color="text.primary">
              to wallet to track your balance.
            </Typography>
          </Stack>
          {canAutoAdd ? (
            <Button variant="contained" size="small" onClick={handleAddToWallet} disabled={adding}>
              {adding ? 'Adding…' : 'ADD TO WALLET →'}
            </Button>
          ) : (
            <Button variant="contained" size="small" onClick={handleCopyAddress}>
              {copied ? 'COPIED ✓' : 'COPY ADDRESS'}
            </Button>
          )}
          {!canAutoAdd && (
            <Typography variant="caption" color="text.secondary" textAlign="center">
              Symbol too long for MetaMask — paste this address into &quot;Import token&quot;.
            </Typography>
          )}
          {addError && (
            <Typography variant="caption" color="error.main" textAlign="center">
              {addError}
            </Typography>
          )}
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
