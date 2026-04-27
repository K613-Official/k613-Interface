import { Box, Link, Paper as PaperBase, styled } from '@mui/material';

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
  [theme.breakpoints.down('lg')]: {
    display: 'none',
  },
}));

export const MobileCards = styled(Box)(({ theme }) => ({
  display: 'none',
  gap: 12,

  [theme.breakpoints.down('lg')]: {
    display: 'grid',
    gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
    marginTop: 16,
  },

  [theme.breakpoints.down('xsm')]: {
    gridTemplateColumns: '1fr',
  },
}));

export const MobileAssetCard = styled(Box)(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  gap: 24,
  padding: 16,
  border: `1px solid ${theme.palette.text.secondary}`,
  borderRadius: 12,
  backgroundColor: '#333333',
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

export const LinkItem = styled(Link)(({ theme }) => ({
  color: theme.palette.common.white,
  textDecoration: 'none',
}));
