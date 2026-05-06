import {
  Box,
  Button,
  Chip,
  FormControl,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  TableCell,
  tableCellClasses,
  Typography,
} from '@mui/material';
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

export const Topbar = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  gap: 18,
  minHeight: 82,
  marginBottom: 64,
  borderBottom: `1px solid ${theme.palette.primary.main}4D`,
  '@media (max-width: 920px)': {
    alignItems: 'flex-start',
  },
  '@media (max-width: 640px)': {
    display: 'grid',
  },
}));

export const Brand = styled(Box)({
  display: 'flex',
  alignItems: 'center',
  gap: 12,
});

export const BrandMark = styled(Box)(({ theme }) => ({
  display: 'grid',
  width: 40,
  height: 40,
  placeItems: 'center',
  color: theme.palette.primary.main,
  border: `1px solid ${theme.palette.primary.main}4D`,
  borderRadius: 4,
  background: theme.palette.background.surface,
  fontWeight: 500,
}));

export const TopNav = styled(Box)({
  display: 'flex',
  gap: 8,
  '@media (max-width: 1180px)': {
    display: 'none',
  },
});

export const TopNavButton = styled(Button, {
  shouldForwardProp: (prop) => prop !== 'active',
})<{ active?: boolean }>(({ theme, active }) => ({
  minHeight: 48,
  padding: '14px 16px',
  borderRadius: 0,
  color: active ? theme.palette.primary.main : '#bdbdbd',
  borderBottom: active ? `3px solid ${theme.palette.primary.main}` : '3px solid transparent',
  background: 'transparent',
  textTransform: 'none',
  '&:hover': {
    background: 'transparent',
    color: '#fff',
  },
}));

export const Hero = styled(Box)(() => ({
  marginTop: 28,
  display: 'grid',
  gridTemplateColumns: 'minmax(0, 1.45fr) minmax(260px, 0.85fr)',
  gap: 22,
  marginBottom: 64,
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

export const GhostCta = styled(Button)(() => ({
  minHeight: 38,
  paddingInline: 16,
  borderRadius: 1,
  color: '#fff',
  border: '1px solid rgba(255, 255, 255, 0.3)',
  background: 'transparent',
  textTransform: 'capitalize',
  '&:hover': {
    background: 'rgba(255, 255, 255, 0.08)',
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

export const WeekRow = styled(Paper)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  gap: 16,
  marginBottom: 16,
  padding: 16,
  border: '1px solid rgba(255, 255, 255, 0.3)',
  borderRadius: 4,
  background: theme.palette.background.paper,
  [theme.breakpoints.down('sm')]: {
    flexDirection: 'column',
    alignItems: 'stretch',
  },
}));

export const WeekSelectControl = styled(FormControl)(({ theme }) => ({
  minWidth: 180,
  '& .MuiInputLabel-root': {
    color: '#bdbdbd',
  },
  '& .MuiOutlinedInput-root': {
    minHeight: 38,
    color: '#fff',
    backgroundColor: theme.palette.background.paper,
    '& fieldset': {
      borderColor: 'rgba(255, 255, 255, 0.3)',
    },
    '&:hover fieldset': {
      borderColor: 'rgba(255, 255, 255, 0.45)',
    },
  },
}));

export const WeekSelect = styled(Select)({
  minHeight: 38,
});

export const SectionTabs = styled(Box)(() => ({
  display: 'flex',
  gap: 4,
  marginBottom: 24,
  padding: 4,
  border: '1px solid rgba(255, 255, 255, 0.3)',
  borderRadius: 4,
  background: 'rgba(255, 255, 255, 0.12)',
  '@media (max-width: 920px)': {
    width: '100%',
    overflowX: 'auto',
    justifyContent: 'flex-start',
  },
}));

export const SectionTabButton = styled(Button, {
  shouldForwardProp: (prop) => prop !== 'active',
})<{ active?: boolean }>(({ active }) => ({
  flex: 1,
  minHeight: 38,
  minWidth: 120,
  padding: '4px 12px',
  color: active ? '#fff' : '#bdbdbd',
  fontSize: 13,
  fontWeight: 500,
  letterSpacing: '0.46px',
  textTransform: 'uppercase',
  border: active ? '1px solid rgba(255, 255, 255, 0.3)' : '1px solid transparent',
  borderRadius: 4,
  background: active ? 'rgba(255, 255, 255, 0.12)' : 'transparent',
  whiteSpace: 'nowrap',
  '&:hover': {
    background: 'rgba(255, 255, 255, 0.16)',
  },
  '@media (max-width: 920px)': {
    flex: '0 0 auto',
  },
}));

export const Card = styled(Paper)(({ theme }) => ({
  border: '1px solid rgba(255, 255, 255, 0.3)',
  borderRadius: 4,
  background: theme.palette.background.paper,
  padding: 22,
  minWidth: 0,
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
  gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
  gap: 12,
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
  minHeight: 300,
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

export const TableWrap = styled(Box)({
  '@media (max-width: 640px)': {
    overflowX: 'auto',
  },
});

export const LeaderboardTableCell = styled(TableCell)(() => ({
  padding: '14px 12px',
  borderBottom: '1px solid rgba(255, 255, 255, 0.12)',
  [`&.${tableCellClasses.head}`]: {
    color: '#757575',
    fontSize: 12,
    fontWeight: 500,
    letterSpacing: '0.4px',
    textTransform: 'uppercase',
  },
}));

export const Rank = styled(Box)({
  display: 'inline-grid',
  width: 30,
  height: 30,
  placeItems: 'center',
  borderRadius: 4,
  background: 'rgba(255, 255, 255, 0.08)',
});

export const Address = styled(Box)({
  display: 'flex',
  alignItems: 'center',
  gap: 10,
});

export const Avatar = styled(Box)(({ theme }) => ({
  width: 28,
  height: 28,
  borderRadius: 4,
  background: theme.palette.background.surface,
  border: `1px solid ${theme.palette.primary.main}4D`,
}));

export const Pagination = styled(Box)({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  gap: 12,
  marginTop: 16,
});

export const RulesStack = styled(Box)({
  display: 'grid',
  gap: 10,
});

export const WalletTopButton = styled(PrimaryCta)(() => ({
  minHeight: 44,
}));

export const SelectLabel = styled(InputLabel)({
  display: 'none',
});

export const SelectOption = styled(MenuItem)({});
