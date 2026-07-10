import { Box, Button, Chip, Paper, Typography } from '@mui/material';
import { styled } from '@mui/material/styles';

export const PageRoot = styled(Box)(({ theme }) => ({
  width: 'min(1280px, calc(100% - 48px))',
  margin: '0 auto',
  paddingBottom: 64,
  [theme.breakpoints.down('sm')]: {
    width: 'min(100% - 20px, 1180px)',
    paddingTop: 12,
  },
}));

export const Hero = styled(Box)(() => ({
  marginTop: 28,
  display: 'grid',
  gridTemplateColumns: 'minmax(0, 1.45fr) minmax(260px, 0.85fr)',
  gap: 22,
  marginBottom: 40,
  '@media (max-width: 920px)': {
    gridTemplateColumns: '1fr',
  },
}));

export const Eyebrow = styled(Box)(({ theme }) => ({
  display: 'inline-flex',
  alignItems: 'center',
  gap: 8,
  width: 'fit-content',
  marginBottom: 18,
  padding: '5px 8px',
  color: theme.palette.primary.main,
  fontSize: 12,
  fontWeight: 500,
  letterSpacing: '0.4px',
  border: `1px solid ${theme.palette.primary.main}4D`,
  borderRadius: 4,
  background: `${theme.palette.primary.main}14`,
}));

export const Dot = styled(Box)(({ theme }) => ({
  width: 8,
  height: 8,
  borderRadius: '50%',
  background: theme.palette.primary.main,
}));

export const HeroTitle = styled('h1')(() => ({
  margin: 0,
  maxWidth: 760,
  overflowWrap: 'break-word',
  fontSize: 'clamp(36px, 5vw, 48px)',
  fontWeight: 400,
  lineHeight: 1.08,
  letterSpacing: '-0.015em',
}));

export const HeroSubtitle = styled(Typography)(() => ({
  maxWidth: 680,
  marginTop: 18,
  fontSize: 16,
  lineHeight: 1.5,
  letterSpacing: '0.15px',
  color: '#bdbdbd',
}));

export const HeroActions = styled(Box)({
  display: 'flex',
  flexWrap: 'wrap',
  gap: 12,
  marginTop: 26,
});

const sharedCtaButton = {
  minHeight: 44,
  paddingInline: 16,
  borderRadius: 1,
  boxShadow: 'none',
  textTransform: 'capitalize' as const,
};

export const PrimaryCta = styled(Button)(({ theme }) => ({
  ...sharedCtaButton,
  color: '#000',
  background: theme.palette.primary.main,
  '&:hover': {
    background: theme.palette.primary.main,
    opacity: 0.9,
    boxShadow: 'none',
  },
  '&.Mui-disabled': {
    background: 'rgba(255, 255, 255, 0.12)',
    color: '#757575',
  },
}));

export const SecondaryCta = styled(Button)(() => ({
  ...sharedCtaButton,
  color: '#fff',
  border: '1px solid rgba(255, 255, 255, 0.3)',
  background: 'rgba(255, 255, 255, 0.12)',
  '&:hover': {
    background: 'rgba(255, 255, 255, 0.16)',
    boxShadow: 'none',
  },
}));

export const HeroSide = styled(Box)({
  display: 'grid',
  gap: 14,
  minWidth: 0,
});

export const StatCard = styled(Paper)(({ theme }) => ({
  border: '1px solid rgba(255, 255, 255, 0.3)',
  borderRadius: 4,
  background: theme.palette.background.paper,
  padding: 24,
}));

export const Label = styled(Typography)(() => ({
  color: '#757575',
  fontSize: 14,
  lineHeight: 1.43,
  letterSpacing: '0.17px',
  textTransform: 'uppercase',
}));

export const Value = styled(Typography)(() => ({
  marginTop: 8,
  fontSize: 24,
  fontWeight: 600,
  lineHeight: 1.235,
  letterSpacing: '0.25px',
}));

export const Small = styled(Typography)(() => ({
  color: '#bdbdbd',
  fontSize: 14,
  lineHeight: 1.43,
  letterSpacing: '0.17px',
}));

export const Card = styled(Paper)(({ theme }) => ({
  border: '1px solid rgba(255, 255, 255, 0.3)',
  borderRadius: 4,
  background: theme.palette.background.paper,
  padding: 22,
  minWidth: 0,
  marginBottom: 24,
  '@media (max-width: 640px)': {
    borderRadius: 20,
    padding: 18,
  },
}));

export const CardHead = styled(Box)({
  display: 'flex',
  alignItems: 'flex-start',
  justifyContent: 'space-between',
  gap: 16,
  marginBottom: 18,
});

export const CardTitle = styled('h2')(() => ({
  margin: 0,
  fontSize: 24,
  fontWeight: 400,
  lineHeight: 1.235,
  letterSpacing: '0.25px',
}));

export const CardSub = styled(Small)({
  marginTop: 4,
});

export const StatusBadge = styled(Chip)(({ theme }) => ({
  borderRadius: 4,
  color: theme.palette.primary.main,
  border: `1px solid ${theme.palette.primary.main}4D`,
  background: `${theme.palette.primary.main}14`,
  '&.MuiChip-colorWarning': {
    color: '#ffd166',
    borderColor: 'rgba(255, 211, 111, 0.28)',
    background: 'rgba(255, 211, 111, 0.08)',
  },
}));

export const MetricsGrid = styled(Box)({
  display: 'grid',
  gridTemplateColumns: 'repeat(3, minmax(0, 1fr))',
  gap: 12,
  '@media (max-width: 920px)': {
    gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
  },
  '@media (max-width: 640px)': {
    gridTemplateColumns: '1fr',
  },
});

export const Metric = styled(Box)({
  minHeight: 104,
  padding: 16,
  border: '1px solid rgba(255, 255, 255, 0.1)',
  borderRadius: 4,
  background: 'rgba(255, 255, 255, 0.045)',
});

export const MetricValue = styled(Typography)({
  marginTop: 10,
  fontSize: 24,
  fontWeight: 600,
  lineHeight: 1.235,
  letterSpacing: '0.25px',
});

export const EmptyState = styled(Box)({
  display: 'grid',
  minHeight: 220,
  placeItems: 'center',
  textAlign: 'center',
  border: '1px dashed rgba(255, 255, 255, 0.3)',
  borderRadius: 4,
  background: 'rgba(255, 255, 255, 0.035)',
  padding: 24,
});

export const EmptyTitle = styled('h3')({
  margin: 0,
  fontSize: 24,
  fontWeight: 400,
});

export const EmptyDescription = styled(Typography)({
  maxWidth: 420,
  margin: '10px auto 20px',
  color: '#bdbdbd',
  lineHeight: 1.5,
});

// ---------------------------------------------------------------------------
// Stage timeline
// ---------------------------------------------------------------------------

export const StagesTrack = styled(Box)(() => ({
  display: 'flex',
  alignItems: 'flex-start',
  marginTop: 8,
  '@media (max-width: 920px)': {
    overflowX: 'auto',
    paddingBottom: 12,
  },
}));

export const StageStep = styled(Box)({
  position: 'relative',
  flex: 1,
  minWidth: 120,
  textAlign: 'center',
});

export const StageConnector = styled(Box, {
  shouldForwardProp: (prop) => prop !== 'completed',
})<{ completed?: boolean }>(({ theme, completed }) => ({
  position: 'absolute',
  top: 13,
  left: '50%',
  width: '100%',
  height: 2,
  background: completed ? theme.palette.primary.main : 'rgba(255, 255, 255, 0.16)',
}));

export const StageIcon = styled(Box, {
  shouldForwardProp: (prop) => prop !== 'status',
})<{ status: 'completed' | 'active' | 'pending' }>(({ theme, status }) => ({
  position: 'relative',
  zIndex: 1,
  display: 'inline-grid',
  width: 28,
  height: 28,
  placeItems: 'center',
  borderRadius: '50%',
  color: '#000',
  background:
    status === 'completed'
      ? theme.palette.primary.main
      : status === 'active'
      ? theme.palette.background.paper
      : 'rgba(255, 255, 255, 0.12)',
  border:
    status === 'active'
      ? `2px solid ${theme.palette.primary.main}`
      : status === 'pending'
      ? '2px solid rgba(255, 255, 255, 0.16)'
      : `2px solid ${theme.palette.primary.main}`,
  '& svg': {
    fontSize: 16,
  },
}));

export const StageInnerDot = styled(Box, {
  shouldForwardProp: (prop) => prop !== 'active',
})<{ active?: boolean }>(({ theme, active }) => ({
  width: 10,
  height: 10,
  borderRadius: '50%',
  background: active ? theme.palette.primary.main : 'rgba(255, 255, 255, 0.3)',
}));

export const StageName = styled(Typography, {
  shouldForwardProp: (prop) => prop !== 'dimmed',
})<{ dimmed?: boolean }>(({ dimmed }) => ({
  marginTop: 10,
  fontSize: 14,
  fontWeight: 600,
  lineHeight: 1.3,
  color: dimmed ? '#757575' : '#fff',
}));

export const StageMeta = styled(Typography)({
  marginTop: 4,
  fontSize: 12,
  lineHeight: 1.4,
  color: '#757575',
  whiteSpace: 'pre-line',
});

export const StageCountdown = styled(Typography)(({ theme }) => ({
  marginTop: 4,
  fontSize: 12,
  fontWeight: 600,
  color: theme.palette.primary.main,
  fontVariantNumeric: 'tabular-nums',
}));

// ---------------------------------------------------------------------------
// Raise progress
// ---------------------------------------------------------------------------

export const ProgressTrack = styled(Box)({
  width: '100%',
  height: 12,
  marginTop: 16,
  borderRadius: 2,
  background: 'rgba(255, 255, 255, 0.1)',
  overflow: 'hidden',
});

export const ProgressFill = styled(Box)(({ theme }) => ({
  height: '100%',
  background: theme.palette.primary.main,
  transition: 'width 0.6s ease',
}));

export const ProgressLegend = styled(Box)({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  gap: 12,
  marginTop: 8,
});

// ---------------------------------------------------------------------------
// Deposit dialog
// ---------------------------------------------------------------------------

export const AmountRow = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  gap: 10,
  padding: '14px 16px',
  border: '1px solid rgba(255, 255, 255, 0.3)',
  borderRadius: 4,
  background: theme.palette.background.paper,
  '&:focus-within': {
    borderColor: 'rgba(255, 255, 255, 0.6)',
  },
}));

export const AmountInput = styled('input')({
  flex: 1,
  minWidth: 0,
  border: 'none',
  background: 'transparent',
  color: '#fff',
  fontSize: 22,
  fontWeight: 600,
  fontFamily: 'inherit',
  outline: 'none',
  MozAppearance: 'textfield',
  '&::-webkit-outer-spin-button, &::-webkit-inner-spin-button': {
    WebkitAppearance: 'none',
    margin: 0,
  },
  '&::placeholder': {
    color: '#546066',
  },
});

export const MaxButton = styled(Button)(({ theme }) => ({
  minHeight: 30,
  minWidth: 0,
  padding: '2px 10px',
  borderRadius: 1,
  color: theme.palette.primary.main,
  border: `1px solid ${theme.palette.primary.main}4D`,
  background: `${theme.palette.primary.main}14`,
  fontSize: 12,
  fontWeight: 600,
  '&:hover': {
    background: `${theme.palette.primary.main}29`,
  },
}));

export const AmountSymbol = styled(Typography)({
  fontSize: 16,
  fontWeight: 600,
  color: '#bdbdbd',
});

export const BalanceRow = styled(Box)({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  gap: 12,
  marginTop: 10,
});

export const EstimateList = styled(Box)({
  display: 'grid',
  gap: 10,
  marginTop: 18,
  padding: 16,
  border: '1px solid rgba(255, 255, 255, 0.1)',
  borderRadius: 4,
  background: 'rgba(255, 255, 255, 0.045)',
});

export const EstimateRow = styled(Box)({
  display: 'flex',
  alignItems: 'baseline',
  justifyContent: 'space-between',
  gap: 12,
});

export const EstimateValue = styled(Typography)({
  fontSize: 15,
  fontWeight: 600,
  fontVariantNumeric: 'tabular-nums',
});

export const DialogActionsRow = styled(Box)({
  display: 'grid',
  gridTemplateColumns: '1fr 1fr',
  gap: 12,
  marginTop: 20,
  '@media (max-width: 640px)': {
    gridTemplateColumns: '1fr',
  },
});

// ---------------------------------------------------------------------------
// Mechanics / FAQ / disclaimer
// ---------------------------------------------------------------------------

export const StepsGrid = styled(Box)({
  display: 'grid',
  gridTemplateColumns: 'repeat(3, minmax(0, 1fr))',
  gap: 12,
  '@media (max-width: 920px)': {
    gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
  },
  '@media (max-width: 640px)': {
    gridTemplateColumns: '1fr',
  },
});

export const StepNumber = styled(Box)(({ theme }) => ({
  display: 'inline-grid',
  width: 30,
  height: 30,
  placeItems: 'center',
  marginBottom: 10,
  borderRadius: 4,
  color: theme.palette.primary.main,
  border: `1px solid ${theme.palette.primary.main}4D`,
  background: `${theme.palette.primary.main}14`,
  fontWeight: 600,
}));

export const FaqStack = styled(Box)({
  display: 'grid',
  gap: 10,
});

export const DisclaimerText = styled(Typography)({
  color: '#9e9e9e',
  fontSize: 13,
  lineHeight: 1.6,
  whiteSpace: 'pre-line',
});

export const FormulaBlock = styled('pre')(() => ({
  margin: '12px 0 0',
  padding: 16,
  overflowX: 'auto',
  border: '1px solid rgba(255, 255, 255, 0.1)',
  borderRadius: 4,
  background: 'rgba(255, 255, 255, 0.045)',
  color: '#bdbdbd',
  fontSize: 13,
  lineHeight: 1.7,
}));
