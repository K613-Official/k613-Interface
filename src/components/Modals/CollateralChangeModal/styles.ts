import { Box, Dialog as DialogBase, styled } from '@mui/material';

export const Dialog = styled(DialogBase)({
  '& .MuiPaper-root': {
    width: '100%',
    backgroundColor: 'transparent',
    boxShadow: 'none',
    backgroundImage: 'none',
    overflow: 'visible',
  },
});

export const ModalCard = styled(Box)({
  backgroundColor: 'rgba(255, 255, 255, 0.08)',
  border: '1px solid rgba(255, 255, 255, 0.3)',
  backdropFilter: 'blur(200px)',
  borderRadius: 4,
  padding: '16px 24px 24px',
  display: 'flex',
  flexDirection: 'column',
  gap: 16,
  width: '100%',
  maxWidth: 500,
  margin: '0 auto',
});

export const Header = styled(Box)({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
});

export const AssetSummary = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  gap: 12,
  padding: '12px 16px',
  border: `1px solid ${theme.palette.divider}`,
  borderRadius: 4,
  backgroundColor: theme.palette.background.paper,
}));

export const AssetMeta = styled(Box)({
  display: 'flex',
  alignItems: 'center',
  gap: 12,
  minWidth: 0,
});

export const AssetText = styled(Box)({
  display: 'flex',
  flexDirection: 'column',
  minWidth: 0,
});

export const AssetAmount = styled(Box)({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'flex-end',
  textAlign: 'right',
});

export const OverviewSection = styled(Box)({
  display: 'flex',
  flexDirection: 'column',
  gap: 8,
  width: '100%',
});

export const OverviewRow = styled(Box)(({ theme }) => ({
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  padding: '8px 12px',
  border: `1px solid ${theme.palette.divider}`,
  borderRadius: 4,
}));

export const Transition = styled(Box)({
  display: 'inline-flex',
  alignItems: 'center',
  gap: 6,
});
