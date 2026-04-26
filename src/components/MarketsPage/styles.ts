import { Box, Paper as PaperBase, styled } from '@mui/material';

export const PageWrapper = styled(Box)(({ theme }) => ({
  marginTop: 64,
  paddingInline: 0,
  display: 'flex',
  flexDirection: 'column',
  gap: 64,
  [theme.breakpoints.down('md')]: {
    marginTop: 32,
    gap: 40,
  },
  [theme.breakpoints.down('xsm')]: {
    marginTop: 24,
    paddingInline: 16,
    paddingBottom: 16,
    gap: 32,
  },
}));

export const CoreInstanceBlock = styled(Box)(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  gap: 24,
  [theme.breakpoints.up('md')]: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  [theme.breakpoints.down('xsm')]: {
    gap: 16,
  },
}));

export const CoreInstanceInfo = styled(Box)({
  display: 'flex',
  flexDirection: 'column',
  gap: 12,
});

export const StatsCard = styled(Box)(({ theme }) => ({
  display: 'flex',
  gap: 16,
  backgroundColor: theme.palette.background.paper,
  borderRadius: 4,
  paddingBlock: 24,
  paddingInline: 40,
  flexWrap: 'wrap',
  [theme.breakpoints.down('md')]: {
    paddingBlock: 16,
    paddingInline: 20,
  },
  [theme.breakpoints.down('sm')]: {
    paddingInline: 16,
  },
  [theme.breakpoints.down('xsm')]: {
    paddingInline: 16,
  },
}));

export const StatItem = styled(Box)({
  display: 'flex',
  flexDirection: 'column',
  gap: 8,
});

export const VerticalDivider = styled(Box)(({ theme }) => ({
  width: 1,
  minHeight: 56,
  backgroundColor: 'rgba(255, 255, 255, 0.12)',
  [theme.breakpoints.down('sm')]: {
    width: 1,
    minHeight: 40,
  },
  [theme.breakpoints.down('xsm')]: {
    width: 1,
    minHeight: 40,
  },
}));

export const CoreAssetsSection = styled(PaperBase)(({ theme }) => ({
  marginTop: 24,
  padding: 24,
  borderRadius: 4,
  border: '1px solid rgba(255, 255, 255, 0.08)',
  display: 'flex',
  flexDirection: 'column',
  gap: 24,

  [theme.breakpoints.down('xsm')]: {
    marginTop: 24,
    gap: 16,
    padding: 16,
  },
}));

export const FiltersRow = styled(Box)(({ theme }) => ({
  display: 'flex',
  flexDirection: 'row',
  flexWrap: 'wrap',
  gap: 16,
  alignItems: 'center',
  [theme.breakpoints.down('xsm')]: {
    flexDirection: 'column',
    alignItems: 'stretch',
  },
}));

export const TablePaper = styled(PaperBase)(({ theme }) => ({
  borderRadius: 4,
  overflow: 'auto',
  backgroundColor: 'transparent',
  boxShadow: 'none',
  backgroundImage: 'none',
  [theme.breakpoints.down('md')]: {
    overflowX: 'auto',
  },
  [theme.breakpoints.down('xsm')]: {
    border: 'none',
    backgroundColor: 'transparent',
    overflow: 'visible',
  },
}));

export const MobileAssetCard = styled(Box)(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  gap: 12,
  padding: 16,
  border: `1px solid ${theme.palette.divider}`,
  borderRadius: 12,
  backgroundColor: theme.palette.background.paper,
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

