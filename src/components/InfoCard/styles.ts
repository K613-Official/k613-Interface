import ErrorRoundedIcon from '@mui/icons-material/ErrorRounded';
import { Box, Button, Paper as PaperBase, Stack, styled, Typography } from '@mui/material';

export const Paper = styled(PaperBase)(() => ({
  flex: 1,
  border: '1px solid #ffffff4d',
  borderRadius: 8,
  backgroundColor: '#111114',
  padding: 24,
}));

export const HeaderRow = styled(Box)(() => ({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  gap: 12,
}));

export const TitleStack = styled(Stack)(() => ({
  alignItems: 'center',
  gap: 12,
}));

export const ExtraText = styled(Typography)(() => ({
  color: '#72757a',
}));

export const ToggleButton = styled(Button)(() => ({
  color: '#f3f4f6',
  fontWeight: 600,
  fontSize: 14,
  lineHeight: '20px',
  minWidth: 0,
  padding: 0,
  textTransform: 'none',
  '&:hover': {
    backgroundColor: 'transparent',
  },
}));

export const MetricsRow = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  gap: 8,
  marginTop: 16,
  marginBottom: 18,
  flexWrap: 'wrap',
  [theme.breakpoints.down('sm')]: {
    marginTop: 14,
    marginBottom: 16,
  },
}));

export const MetricChip = styled(Box)(() => ({
  display: 'inline-flex',
  alignItems: 'center',
  gap: 8,
  borderRadius: 6,
  border: '1px solid #64676d',
  backgroundColor: '#3b3b3d',
  padding: '6px 10px',
  color: '#fafafa',
}));

export const MetricLabel = styled(Typography)(() => ({
  color: '#a7aaaf',
  fontSize: 14,
  lineHeight: '20px',
}));

export const MetricValue = styled(Typography)(() => ({
  color: '#f2f3f5',
  fontSize: 14,
  lineHeight: '20px',
}));

export const MetricAlertIcon = styled(ErrorRoundedIcon)(() => ({
  color: '#8f9398',
  fontSize: 14,
}));

export const Content = styled(Box)(() => ({
  width: '100%',
}));

export const StateText = styled(Typography)(() => ({
  marginTop: 16,
  color: '#e0e0e0',
  fontSize: 16,
  lineHeight: '24px',
}));

export const DesktopOnly = styled(Box)(({ theme }) => ({
  display: 'block',
  [theme.breakpoints.down('md')]: {
    display: 'none',
  },
}));

export const TabletMobileOnly = styled(Box)(({ theme }) => ({
  display: 'none',
  [theme.breakpoints.down('md')]: {
    display: 'block',
  },
}));
