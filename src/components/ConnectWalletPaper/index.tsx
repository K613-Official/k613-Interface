import { Box, Typography } from '@mui/material';
import Image from 'next/image';
import { ConnectWalletButton } from 'src/components/WalletConnection/ConnectWalletButton';

import { Container } from './styles';

export const ConnectWalletPaper = () => {
  return (
    <Container>
      <Image src="/account.svg" width={84} height={84} alt="account" />
      <Box display="flex" flexDirection="column" maxWidth={284} gap={1} textAlign="center">
        <Typography fontSize={24} fontWeight={400}>
          Connect your wallet
        </Typography>
        <Typography fontSize={14} fontWeight={400} color="#7A7A7A">
          Link your wallet to access your portfolio, track performance, and manage your assets
        </Typography>
      </Box>
      <ConnectWalletButton />
    </Container>
  );
};
