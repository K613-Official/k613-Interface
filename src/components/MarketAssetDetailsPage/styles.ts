import { Check, CreditCard } from '@mui/icons-material';
import {
  Box,
  Button,
  IconButton,
  Paper as PaperBase,
  Skeleton,
  styled,
  Tab,
  Tabs,
  Typography,
} from '@mui/material';

export const PageWrapper = styled(Box)(({ theme }) => ({
  marginTop: 64,
  paddingInline: 0,
  display: 'flex',
  flexDirection: 'column',
  gap: 24,
  [theme.breakpoints.down('md')]: {
    marginTop: 32,
  },
  [theme.breakpoints.down('xsm')]: {
    marginTop: 24,
    paddingInline: 16,
    paddingBottom: 24,
    gap: 16,
  },
}));

export const TopRows = styled(Box)(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  gap: 24,
  alignItems: 'stretch',
  [theme.breakpoints.up('lg')]: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 64,
  },
}));

export const InstanceRow = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  gap: 8,
  flexWrap: 'wrap',
  [theme.breakpoints.down('xsm')]: {
    gap: 8,
  },
}));

export const AssetTitleRow = styled(Box)(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  gap: 16,
  flexShrink: 0,
  [theme.breakpoints.up('lg')]: {
    width: 266,
  },
}));

export const AssetIdentity = styled(Box)({
  display: 'flex',
  alignItems: 'center',
  gap: 12,
});

export const V3Badge = styled(Box)(({ theme }) => ({
  backgroundColor: theme.palette.primary.main,
  color: theme.palette.primary.dark,
  borderRadius: 100,
  paddingInline: 8,
  paddingBlock: 2,
}));

export const StatsStrip = styled(Box)(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  gap: 16,
  backgroundColor: theme.palette.action.hover,
  border: `1px solid ${theme.palette.divider}`,
  borderRadius: 4,
  paddingBlock: 24,
  paddingInline: 24,

  [theme.breakpoints.up('md')]: {
    paddingInline: 40,
    justifyContent: 'space-between',
    flex: '1 1 auto',
  },
}));

export const StatCell = styled(Box)({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'flex-start',
  gap: 4,
});

export const StatDivider = styled(Box)({
  height: 1,
  width: '100%',
  backgroundColor: 'rgba(255, 255, 255, 0.1)',
  flexShrink: 0,
});

export const OracleActions = styled(Box)({
  display: 'flex',
  alignItems: 'center',
  gap: 8,
  flexWrap: 'wrap',
});

export const SectionShell = styled(PaperBase)(({ theme }) => ({
  marginTop: 8,
  padding: 16,
  border: `1px solid ${theme.palette.divider}`,
  borderRadius: 4,
  display: 'flex',
  flexDirection: 'column',
  gap: 16,
  backgroundColor: theme.palette.background.paper,
  [theme.breakpoints.up('sm')]: {
    padding: 20,
  },
  [theme.breakpoints.up('md')]: {
    padding: 24,
    gap: 24,
  },
}));

export const SectionTitle = styled(Box)({
  marginBottom: 4,
});

export const ConfigCard = styled(Box)(({ theme }) => ({
  border: `1px solid ${theme.palette.divider}`,
  borderRadius: 4,
  padding: 16,
  backgroundColor:
    theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.04)' : theme.palette.background.default,
  display: 'flex',
  flexDirection: 'column',
  gap: 20,
  [theme.breakpoints.up('sm')]: {
    padding: 20,
  },
}));

export const CardBlockTitle = styled(Box)({});

export const SupplyBorrowMain = styled(Box)(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  gap: 20,
  [theme.breakpoints.up('md')]: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
}));

export const DonutBlock = styled(Box)({
  display: 'flex',
  alignItems: 'center',
  gap: 20,
  flexShrink: 0,
});

export const DonutRing = styled(Box, {
  shouldForwardProp: (p) => p !== 'pct' && p !== 'accent',
})<{ pct: number; accent: string }>(({ pct, accent, theme }) => ({
  width: 88,
  height: 88,
  borderRadius: '50%',
  background: `conic-gradient(${accent} ${pct * 3.6}deg, ${theme.palette.divider} 0deg)`,
  display: 'grid',
  placeItems: 'center',
  flexShrink: 0,
}));

export const DonutInner = styled(Box)(({ theme }) => ({
  width: 68,
  height: 68,
  borderRadius: '50%',
  backgroundColor: theme.palette.background.paper,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
}));

export const MetricsRow = styled(Box)({
  display: 'flex',
  flexDirection: 'row',
  flexWrap: 'wrap',
  gap: 16,
  flex: 1,
  alignItems: 'flex-start',
});

export const MetricCell = styled(Box)({
  display: 'flex',
  flexDirection: 'column',
  gap: 4,
  minWidth: 100,
});

export const MetricDivider = styled(Box)(({ theme }) => ({
  width: 1,
  alignSelf: 'stretch',
  minHeight: 48,
  backgroundColor: theme.palette.divider,
  display: 'none',
  [theme.breakpoints.up('sm')]: {
    display: 'block',
  },
}));

export const ChartBlock = styled(Box)({
  display: 'flex',
  flexDirection: 'column',
  gap: 12,
});

export const ChartToolbar = styled(Box)({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  flexWrap: 'wrap',
  gap: 8,
});

export const ChartTag = styled(Box)(({ theme }) => ({
  paddingInline: 8,
  paddingBlock: 4,
  borderRadius: 3,
  backgroundColor: theme.palette.action.hover,
}));

export const ChartPlaceholder = styled(Box)(({ theme }) => ({
  position: 'relative',
  height: 140,
  borderRadius: 4,
  border: `1px solid ${theme.palette.divider}`,
  background:
    theme.palette.mode === 'dark'
      ? 'linear-gradient(180deg, rgba(255,255,255,0.06) 0%, rgba(255,255,255,0.02) 100%)'
      : 'linear-gradient(180deg, rgba(0,0,0,0.04) 0%, rgba(0,0,0,0.01) 100%)',
  overflow: 'hidden',
}));

export const ChartAvgPill = styled(Box)(({ theme }) => ({
  position: 'absolute',
  bottom: 12,
  left: 12,
  paddingInline: 10,
  paddingBlock: 6,
  borderRadius: 4,
  border: `1px solid ${theme.palette.divider}`,
  backgroundColor: theme.palette.background.paper,
  boxShadow: theme.shadows[2],
}));

export const Subsection = styled(Box)({
  display: 'flex',
  flexDirection: 'column',
  gap: 12,
});

export const FlagRow = styled(Box)({
  display: 'flex',
  flexWrap: 'wrap',
  gap: 16,
  alignItems: 'center',
});

export const FlagItem = styled(Box)({
  display: 'flex',
  alignItems: 'center',
  gap: 8,
});

export const ParamRows = styled(Box)({
  display: 'flex',
  flexDirection: 'column',
  gap: 8,
});

export const ParamRow = styled(Box)(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  gap: 4,
  padding: 12,
  borderRadius: 4,
  border: `1px solid ${theme.palette.divider}`,
  backgroundColor:
    theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.03)' : theme.palette.grey[50],
}));

export const EmodeStack = styled(Box)({
  display: 'flex',
  flexDirection: 'column',
  gap: 24,
});

export const EmodeCategoryCard = styled(Box)(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  gap: 12,
  paddingBottom: 8,
  borderBottom: `1px solid ${theme.palette.divider}`,
  '&:last-of-type': {
    borderBottom: 'none',
    paddingBottom: 0,
  },
}));

export const InstanceTitle = styled(Typography)(({ theme }) => ({
  ...theme.typography.h6,
  lineHeight: theme.typography.h6.lineHeight,
  [theme.breakpoints.down('sm')]: {
    ...theme.typography.h4,
    lineHeight: 1.2,
  },
}));

export const FlagOkIcon = styled(Check)(({ theme }) => ({
  fontSize: 20,
  color: theme.palette.primary.main,
}));

export const FlagOffDot = styled('span')(({ theme }) => ({
  width: 20,
  height: 20,
  borderRadius: '50%',
  border: '1px solid',
  borderColor: theme.palette.text.disabled,
  display: 'inline-block',
  flexShrink: 0,
}));

export const OracleStatCell = styled(StatCell)({
  minWidth: 200,
});

export const OracleActionsLayout = styled(OracleActions)(({ theme }) => ({
  flexDirection: 'row',
  alignItems: 'center',
  [theme.breakpoints.down('sm')]: {
    flexDirection: 'column',
    alignItems: 'flex-start',
  },
}));

export const ActionButtonsRow = styled(Box)({
  display: 'flex',
  flexWrap: 'wrap',
  gap: 8,
});

export const StatValueGroup = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'baseline',
  gap: 4,
  fontSize: 32,
  lineHeight: 1.1,
  fontWeight: 500,
  color: theme.palette.text.primary,
  [theme.breakpoints.up('lg')]: {
    fontSize: 36,
  },
}));

export const OracleValueRow = styled(Box)({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  width: '100%',
  gap: 8,
});

export const SmallIconButton = styled(IconButton)(({ theme }) => ({
  width: 30,
  height: 30,
  borderRadius: 4,
  backgroundColor: 'rgba(255, 255, 255, 0.12)',
  border: `1px solid ${theme.palette.divider}`,
  color: theme.palette.text.primary,
  '&:hover': {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  },
})) as typeof IconButton;

export const ApyRangeButton = styled(Button)({
  minWidth: 44,
  paddingInline: 12,
});

export const ChartSvg = styled('svg')({
  width: '100%',
  height: '100%',
  opacity: 0.85,
});

export const DonutPct = styled(Typography)({
  fontWeight: 600,
});

export const GraphHost = styled(Box)({
  width: '100%',
  '& > *:first-of-type': {
    marginTop: 16,
    marginBottom: 16,
  },
});

export const LoadingSkeletonRow = styled(Box)({
  display: 'flex',
  flexDirection: 'column',
  gap: 12,
});

export const SkeletonStatValue = styled(Skeleton)({
  marginTop: 4,
});

export const StatsAndInfoRow = styled(Box)(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  gap: 16,
  flex: 1,
  minWidth: 0,
  [theme.breakpoints.up('md')]: {
    flexDirection: 'row',
    alignItems: 'stretch',
    gap: 16,
    '& > *:first-of-type': {
      flex: 1,
      minWidth: 0,
    },
  },
}));

export const YourInfoContainer = styled(Box)(({ theme }) => ({
  backdropFilter: 'blur(100px)',
  backgroundColor: theme.palette.action.hover,
  border: `1px solid ${theme.palette.divider}`,
  borderRadius: 4,
  padding: 24,
  display: 'flex',
  flexDirection: 'column',
  gap: 16,
  alignItems: 'center',
  justifyContent: 'center',
  [theme.breakpoints.up('md')]: {
    width: 500,
    flexShrink: 0,
  },
}));

export const YourInfoHeader = styled(Box)({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  width: '100%',
});

export const YourInfoDivider = styled(Box)({
  height: 1,
  width: '100%',
  backgroundColor: 'rgba(255, 255, 255, 0.1)',
});

export const WalletBalanceRow = styled(Box)({
  display: 'flex',
  alignItems: 'center',
  gap: 8,
  width: '100%',
});

export const WalletIconBox = styled(Box)({
  width: 44,
  height: 44,
  backgroundColor: 'rgba(255, 255, 255, 0.05)',
  borderRadius: 4,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  flexShrink: 0,
});

export const YourInfoActionRow = styled(Box)({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  gap: 16,
  width: '100%',
});

export const YourInfoActionInfo = styled(Box)({
  display: 'flex',
  flexDirection: 'column',
  flex: 1,
  minWidth: 0,
});

export const InfoMutedText = styled(Typography)({
  opacity: 0.5,
});

export const InfoSymbol = styled('span')({
  opacity: 0.5,
});

export const YourInfoTabs = styled(Tabs)(({ theme }) => ({
  width: '100%',
  minHeight: 'auto',
  '& .MuiTabs-indicator': {
    backgroundColor: theme.palette.primary.main,
    height: 2,
  },
}));

export const YourInfoTab = styled(Tab)(({ theme }) => ({
  flex: 1,
  minHeight: 'auto',
  padding: '9px 16px',
  textTransform: 'uppercase',
  fontWeight: theme.typography.fontWeightMedium,
  fontSize: '0.875rem',
  letterSpacing: '0.4px',
  lineHeight: '24px',
  color: theme.palette.text.secondary,
  '&.Mui-selected': {
    color: theme.palette.primary.main,
  },
}));

export const YourInfoCloseButton = styled(IconButton)({
  width: 30,
  height: 30,
  borderRadius: 4,
});

export const WalletCardIcon = styled(CreditCard)(({ theme }) => ({
  opacity: 0.5,
  fontSize: 24,
  color: theme.palette.text.primary,
}));
