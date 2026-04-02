import { Box, Paper as PaperBase, styled } from '@mui/material';

export const Paper = styled(PaperBase, {
  shouldForwardProp: (prop) => prop !== 'isOpen',
})<{ isOpen?: boolean }>(({ isOpen }) => ({
  flex: 1,
  border: '1px solid #FFFFFF4D',
  borderRadius: 4,
  padding: 24,
  maxBlockSize: 'fit-content',
  blockSize: isOpen ? 1200 : 88,
  overflow: 'hidden',
  transition: 'block-size .25s ease',
}));

export const DesktopTable = styled(Box)(({ theme }) => ({
  display: 'block',
  [theme.breakpoints.down('sm')]: {
    display: 'none',
  },
}));

export const MobileCards = styled(Box)(({ theme }) => ({
  display: 'none',
  flexDirection: 'column',
  gap: 12,
  [theme.breakpoints.down('sm')]: {
    display: 'flex',
  },
}));

export const MobileAssetCard = styled(Box)(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  gap: 12,
  padding: 16,
  border: `1px solid ${theme.palette.text.secondary}`,
  borderRadius: 12,
  backgroundColor: '#333333',

  '&:first-of-type': {
    marginTop: 14,
  },
}));

export const MobilePagination = styled(Box)(({ theme }) => ({
  display: 'none',
  marginTop: 12,
  [theme.breakpoints.down('sm')]: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
}));
