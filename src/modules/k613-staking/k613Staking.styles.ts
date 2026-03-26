import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Typography,
} from '@mui/material';
import { styled } from '@mui/material/styles';
import TextField from '@mui/material/TextField';

export const PageRoot = styled(Box)(({ theme }) => ({
  width: '100%',
  maxWidth: 1252,
  marginInline: 'auto',
  paddingInline: 24,
  paddingBlock: theme.spacing(4),
  [theme.breakpoints.down('md')]: {
    paddingInline: 16,
  },
}));

export const HeaderBlock = styled(Box)(() => ({
  display: 'flex',
  flexDirection: 'column',
  gap: 24,
  marginBottom: 24,
}));

export const TitleH4 = styled('h1')(() => ({
  margin: 0,
  fontFamily: 'Roboto, sans-serif',
  fontWeight: 400,
  fontSize: 32,
  lineHeight: 1.235,
  letterSpacing: '0.0078125em',
  color: '#FFFFFF',
}));

export const SubtitleMuted = styled(Typography)(() => ({
  fontFamily: 'Roboto, sans-serif',
  fontWeight: 400,
  fontSize: 14,
  lineHeight: 1.43,
  letterSpacing: '0.012142857em',
  color: '#BDBDBD',
  maxWidth: 720,
}));

export const StatsOuter = styled(Box)(() => ({
  display: 'flex',
  flexDirection: 'column',
  gap: 8,
  alignSelf: 'stretch',
}));

export const StatsRow = styled(Box)(({ theme }) => ({
  display: 'flex',
  flexDirection: 'row',
  flexWrap: 'wrap',
  gap: 8,
  alignItems: 'stretch',
  alignSelf: 'stretch',
  [theme.breakpoints.down('sm')]: {
    flexDirection: 'column',
  },
}));

export const StatCard = styled(Box)(() => ({
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'center',
  gap: 16,
  padding: 16,
  flex: '1 1 0',
  minWidth: 160,
  backgroundColor: 'rgba(255, 255, 255, 0.04)',
  border: '1px solid rgba(255, 255, 255, 0.1)',
  borderRadius: 4,
}));

export const StatCardWide = styled(StatCard)(() => ({
  flex: '2 1 260px',
}));

export const StatInner = styled(Box)(() => ({
  display: 'flex',
  flexDirection: 'column',
  gap: 8,
}));

export const StatLabel = styled(Typography)(() => ({
  fontFamily: 'Roboto, sans-serif',
  fontWeight: 400,
  fontSize: 14,
  lineHeight: 1.43,
  letterSpacing: '0.012142857em',
  color: '#757575',
}));

export const StatValue = styled(Typography)(() => ({
  fontFamily: 'Roboto, sans-serif',
  fontWeight: 600,
  fontSize: 24,
  lineHeight: 1.235,
  letterSpacing: '0.010416667em',
  color: '#FFFFFF',
}));

export const StatValueAccent = styled(StatValue)(({ theme }) => ({
  color: theme.palette.primary.main,
}));

export const MainPanel = styled(Box)(() => ({
  display: 'flex',
  flexDirection: 'column',
  gap: 16,
  width: '100%',
}));

export const TabContentColumn = styled(Box)(() => ({
  display: 'flex',
  flexDirection: 'column',
  gap: 16,
  width: '100%',
  marginTop: 8,
}));

export const PausedBanner = styled(Box)(() => ({
  width: '100%',
  padding: '12px 16px',
  borderRadius: 4,
  border: '1px solid rgba(255, 193, 7, 0.5)',
  backgroundColor: 'rgba(255, 193, 7, 0.08)',
  color: '#FFC107',
  fontFamily: 'Roboto, sans-serif',
  fontSize: 14,
}));

export const TabBar = styled(Box)(() => ({
  display: 'flex',
  flexDirection: 'row',
  justifyContent: 'center',
  alignItems: 'center',
  alignSelf: 'stretch',
  gap: 4,
  padding: 4,
  width: '100%',
}));

export const TabBarInner = styled(Box)(() => ({
  display: 'flex',
  flexDirection: 'row',
  justifyContent: 'center',
  alignItems: 'stretch',
  gap: 4,
  flex: 1,
  borderRadius: 4,
}));

export const TabItem = styled(Button, {
  shouldForwardProp: (prop) => prop !== 'active',
})<{ active?: boolean }>(({ active, theme }) => ({
  flex: 1,
  minHeight: 38,
  padding: '4px 10px',
  borderRadius: 4,
  textTransform: 'uppercase',
  fontFamily: 'Roboto, sans-serif',
  fontWeight: 500,
  fontSize: 13,
  lineHeight: 1.69,
  letterSpacing: '0.035384616em',
  color: '#FFFFFF',
  backgroundColor: active ? 'rgba(255, 255, 255, 0.16)' : 'rgba(255, 255, 255, 0.12)',
  border: active
    ? `1px solid ${theme.palette.primary.main}`
    : '1px solid rgba(255, 255, 255, 0.12)',
  boxShadow: active ? `0 0 0 1px rgba(95, 204, 0, 0.35)` : 'none',
  '&:hover': {
    backgroundColor: active ? 'rgba(255, 255, 255, 0.2)' : 'rgba(255, 255, 255, 0.16)',
  },
}));

export const StepStrip = styled(Box)(() => ({
  display: 'flex',
  flexDirection: 'row',
  gap: 7,
  width: '100%',
}));

export const StepRow = styled(Box)(() => ({
  display: 'flex',
  flexDirection: 'row',
  alignItems: 'center',
  gap: 8,
  padding: 16,
  flex: 1,
  backgroundColor: 'rgba(255, 255, 255, 0.04)',
  border: '1px solid rgba(255, 255, 255, 0.1)',
  borderRadius: 4,
}));

export const StepCircle = styled(Box, {
  shouldForwardProp: (prop) => prop !== 'active',
})<{ active?: boolean }>(({ active, theme }) => ({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  width: 32,
  height: 32,
  borderRadius: '50%',
  flexShrink: 0,
  fontFamily: 'Roboto, sans-serif',
  fontWeight: 500,
  fontSize: 15,
  lineHeight: 1.73,
  letterSpacing: '0.030666667em',
  textTransform: 'uppercase',
  backgroundColor: active ? theme.palette.primary.main : 'rgba(255, 255, 255, 0.12)',
  color: active ? 'rgba(0, 0, 0, 0.87)' : 'rgba(255, 255, 255, 0.3)',
}));

export const StepTextCol = styled(Box)(() => ({
  display: 'flex',
  flexDirection: 'column',
  gap: 0,
  flex: 1,
  minWidth: 0,
}));

export const StepTitle = styled(Typography)(() => ({
  fontFamily: 'Roboto, sans-serif',
  fontWeight: 500,
  fontSize: 14,
  lineHeight: 1.714,
  letterSpacing: '0.012142857em',
  color: '#FFFFFF',
}));

export const StepCaption = styled(Typography)(() => ({
  fontFamily: 'Roboto, sans-serif',
  fontWeight: 500,
  fontSize: 12,
  lineHeight: 1.5,
  letterSpacing: '0.014166667em',
  color: 'rgba(255, 255, 255, 0.5)',
}));

export const PanelCard = styled(Box)(() => ({
  display: 'flex',
  flexDirection: 'column',
  gap: 16,
  padding: 16,
  width: '100%',
  backgroundColor: 'rgba(255, 255, 255, 0.04)',
  border: '1px solid rgba(255, 255, 255, 0.1)',
  borderRadius: 4,
}));

export const PanelSection = styled(Box)(() => ({
  display: 'flex',
  flexDirection: 'column',
  gap: 8,
}));

export const PanelHeading = styled(Typography)(() => ({
  fontFamily: 'Roboto, sans-serif',
  fontWeight: 500,
  fontSize: 14,
  lineHeight: 1.714,
  letterSpacing: '0.012142857em',
  color: '#FFFFFF',
}));

export const PanelCaption = styled(Typography)(() => ({
  fontFamily: 'Roboto, sans-serif',
  fontWeight: 400,
  fontSize: 12,
  lineHeight: 1.66,
  letterSpacing: '0.033333333em',
  textAlign: 'center',
  color: 'rgba(255, 255, 255, 0.7)',
}));

export const PanelCaptionLeft = styled(PanelCaption)(() => ({
  textAlign: 'left',
}));

export const FieldLabel = styled(Typography)(() => ({
  fontFamily: 'Roboto, sans-serif',
  fontWeight: 500,
  fontSize: 14,
  lineHeight: 1.714,
  letterSpacing: '0.012142857em',
  color: '#FFFFFF',
}));

export const AmountFieldWrap = styled(Box)(() => ({
  display: 'flex',
  flexDirection: 'column',
  alignSelf: 'stretch',
}));

export const StyledAmountField = styled(TextField)(() => ({
  '& .MuiOutlinedInput-root': {
    borderRadius: 4,
    paddingInline: 14,
    color: 'rgba(255, 255, 255, 0.7)',
    '& fieldset': {
      borderColor: 'rgba(255, 255, 255, 0.23)',
    },
    '&:hover fieldset': {
      borderColor: 'rgba(255, 255, 255, 0.35)',
    },
    '&.Mui-focused fieldset': {
      borderColor: 'rgba(255, 255, 255, 0.5)',
    },
  },
  '& .MuiInputBase-input': {
    fontFamily: 'Roboto, sans-serif',
    fontSize: 16,
    lineHeight: 1.5,
    letterSpacing: '0.009375em',
    paddingBlock: 16,
  },
}));

export const BalanceRow = styled(Box)(() => ({
  display: 'flex',
  flexDirection: 'row',
  justifyContent: 'space-between',
  alignItems: 'center',
  alignSelf: 'stretch',
  gap: 10,
  padding: '8px 0',
}));

export const BalanceCaption = styled(Typography)(() => ({
  fontFamily: 'Roboto, sans-serif',
  fontWeight: 400,
  fontSize: 12,
  lineHeight: 1.66,
  letterSpacing: '0.033333333em',
  color: 'rgba(255, 255, 255, 0.7)',
}));

export const MaxLink = styled('button')(({ theme }) => ({
  border: 'none',
  background: 'none',
  padding: 0,
  cursor: 'pointer',
  fontFamily: 'Roboto, sans-serif',
  fontWeight: 400,
  fontSize: 12,
  lineHeight: 1.66,
  letterSpacing: '0.033333333em',
  color: theme.palette.primary.main,
  textTransform: 'uppercase',
  '&:disabled': {
    opacity: 0.4,
    cursor: 'not-allowed',
  },
}));

export const CtaButton = styled(Button)(() => ({
  width: '100%',
  minHeight: 48,
  borderRadius: 4,
  textTransform: 'uppercase',
  fontFamily: 'Roboto, sans-serif',
  fontWeight: 500,
  fontSize: 15,
  lineHeight: 1.73,
  letterSpacing: '0.030666667em',
}));

export const CtaOutlined = styled(CtaButton)(() => ({
  backgroundColor: 'rgba(255, 255, 255, 0.12)',
  color: '#FFFFFF',
  border: '1px solid rgba(255, 255, 255, 0.12)',
  '&:hover': {
    backgroundColor: 'rgba(255, 255, 255, 0.18)',
  },
}));

export const SuccessBanner = styled(Box)(() => ({
  display: 'flex',
  flexDirection: 'row',
  justifyContent: 'space-between',
  alignItems: 'center',
  alignSelf: 'stretch',
  gap: 10,
  padding: '8px 16px',
  borderRadius: 4,
  border: '1px solid rgba(153, 255, 51, 0.5)',
}));

export const SuccessTitle = styled(Typography)(({ theme }) => ({
  fontFamily: 'Roboto, sans-serif',
  fontWeight: 500,
  fontSize: 12,
  lineHeight: 1.833,
  letterSpacing: '0.038333334em',
  textTransform: 'uppercase',
  color: theme.palette.primary.main,
}));

export const SuccessSubtitle = styled(Typography)(({ theme }) => ({
  fontFamily: 'Roboto, sans-serif',
  fontWeight: 400,
  fontSize: 12,
  lineHeight: 1.833,
  letterSpacing: '0.038333334em',
  color: theme.palette.primary.main,
}));

export const MiniStatsRow = styled(Box)(({ theme }) => ({
  display: 'flex',
  flexDirection: 'row',
  flexWrap: 'wrap',
  gap: 8,
  width: '100%',
  [theme.breakpoints.down('sm')]: {
    flexDirection: 'column',
  },
}));

export const SendPanel = styled(Box)(() => ({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  gap: 24,
  padding: 16,
  width: '100%',
  backgroundColor: 'rgba(255, 255, 255, 0.04)',
  border: '1px solid rgba(255, 255, 255, 0.1)',
  borderRadius: 4,
}));

export const ClaimTwoCol = styled(Box)(({ theme }) => ({
  display: 'flex',
  flexDirection: 'row',
  gap: 16,
  width: '100%',
  flexWrap: 'wrap',
  [theme.breakpoints.down('md')]: {
    flexDirection: 'column',
  },
}));

export const ClaimCol = styled(Box)(() => ({
  display: 'flex',
  flexDirection: 'column',
  gap: 16,
  flex: '1 1 280px',
  minWidth: 0,
}));

export const RewardCard = styled(Box)(() => ({
  display: 'flex',
  flexDirection: 'column',
  gap: 16,
  padding: 16,
  backgroundColor: 'rgba(255, 255, 255, 0.04)',
  border: '1px solid rgba(255, 255, 255, 0.1)',
  borderRadius: 4,
}));

export const RewardRow = styled(Box)(() => ({
  display: 'flex',
  flexDirection: 'row',
  justifyContent: 'space-between',
  alignItems: 'center',
  gap: 16,
}));

export const QueueNotice = styled(Typography)(() => ({
  fontFamily: 'Roboto, sans-serif',
  fontWeight: 500,
  fontSize: 12,
  lineHeight: 1.5,
  letterSpacing: '0.014166667em',
  color: 'rgba(255, 255, 255, 0.5)',
  textTransform: 'lowercase',
}));

export const ExitQueueSection = styled(Box)(() => ({
  display: 'flex',
  flexDirection: 'column',
  gap: 16,
  marginTop: 8,
}));

export const ExitQueueHeading = styled(Typography)(() => ({
  fontFamily: 'Roboto, sans-serif',
  fontWeight: 500,
  fontSize: 14,
  lineHeight: 1.714,
  color: '#FFFFFF',
}));

export const ExitQueueCaption = styled(Typography)(() => ({
  fontFamily: 'Roboto, sans-serif',
  fontWeight: 400,
  fontSize: 12,
  lineHeight: 1.66,
  color: 'rgba(255, 255, 255, 0.7)',
}));

export const ExitCard = styled(Box)(() => ({
  display: 'flex',
  flexDirection: 'column',
  gap: 16,
  padding: 16,
  backgroundColor: 'rgba(255, 255, 255, 0.04)',
  border: '1px solid rgba(255, 255, 255, 0.1)',
  borderRadius: 4,
}));

export const ExitCardHeader = styled(Box)(() => ({
  display: 'flex',
  flexDirection: 'row',
  justifyContent: 'space-between',
  alignItems: 'center',
}));

export const ExitBadge = styled(Box)(() => ({
  fontFamily: 'Roboto, sans-serif',
  fontWeight: 500,
  fontSize: 12,
  color: '#FFFFFF',
  padding: '4px 8px',
  borderRadius: 4,
  backgroundColor: 'rgba(255, 255, 255, 0.08)',
  border: '1px solid rgba(255, 255, 255, 0.1)',
}));

export const ExitGridFixed = styled(Box)(({ theme }) => ({
  display: 'grid',
  gridTemplateColumns: '1fr 1fr',
  gap: 12,
  [theme.breakpoints.down('sm')]: {
    gridTemplateColumns: '1fr',
  },
}));

export const ExitCellLabel = styled(Typography)(() => ({
  fontFamily: 'Roboto, sans-serif',
  fontSize: 12,
  lineHeight: 1.66,
  color: '#757575',
}));

export const ExitCellValue = styled(Typography)(() => ({
  fontFamily: 'Roboto, sans-serif',
  fontWeight: 500,
  fontSize: 14,
  color: '#FFFFFF',
}));

export const SmallActionButton = styled(Button)(() => ({
  textTransform: 'uppercase',
  fontSize: 13,
  fontWeight: 500,
  borderRadius: 4,
}));

export const ManageSummaryRow = styled(Box)(({ theme }) => ({
  display: 'flex',
  flexDirection: 'row',
  flexWrap: 'wrap',
  gap: 8,
  width: '100%',
  [theme.breakpoints.down('sm')]: {
    flexDirection: 'column',
  },
}));

export const InstantPanel = styled(Box)(() => ({
  display: 'flex',
  flexDirection: 'column',
  gap: 16,
  padding: 16,
  marginTop: 8,
  backgroundColor: 'rgba(255, 255, 255, 0.04)',
  border: '1px solid rgba(255, 255, 255, 0.1)',
  borderRadius: 4,
}));

export const TableWrap = styled(Box)(() => ({
  width: '100%',
  overflowX: 'auto',
}));

export const TableRoot = styled('table')(() => ({
  width: '100%',
  borderCollapse: 'collapse',
  minWidth: 640,
}));

export const ThCell = styled('th')(() => ({
  textAlign: 'left',
  padding: '10px 16px',
  fontFamily: 'Roboto, sans-serif',
  fontWeight: 500,
  fontSize: 14,
  lineHeight: 1.714,
  color: '#FFFFFF',
  borderBottom: '1px solid rgba(255, 255, 255, 0.12)',
}));

export const TdCell = styled('td')(() => ({
  padding: '12px 16px',
  fontFamily: 'Roboto, sans-serif',
  fontSize: 14,
  lineHeight: 1.43,
  color: '#FFFFFF',
  borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
}));

export const TrSelectable = styled('tr', {
  shouldForwardProp: (prop) => prop !== 'selected',
})<{ selected?: boolean }>(({ selected }) => ({
  cursor: 'pointer',
  backgroundColor: selected ? 'rgba(255, 255, 255, 0.06)' : 'transparent',
}));

export const FooterNote = styled(Typography)(() => ({
  marginTop: 32,
  fontFamily: 'Roboto, sans-serif',
  fontWeight: 400,
  fontSize: 12,
  lineHeight: 1.66,
  letterSpacing: '0.033333333em',
  textAlign: 'center',
  color: 'rgba(255, 255, 255, 0.6)',
}));

export const StatePaper = styled(Box)(() => ({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  gap: 16,
  padding: 32,
  maxWidth: 560,
  marginInline: 'auto',
  backgroundColor: 'rgba(255, 255, 255, 0.04)',
  border: '1px solid rgba(255, 255, 255, 0.1)',
  borderRadius: 4,
}));

export const StateText = styled(Typography)(() => ({
  color: '#BDBDBD',
  textAlign: 'center',
}));

export const StyledDialog = styled(Dialog)(() => ({
  '& .MuiDialog-paper': {
    backgroundColor: '#0b0b0b',
    border: '1px solid rgba(255, 255, 255, 0.12)',
    borderRadius: 8,
    padding: 8,
    minWidth: 320,
  },
}));

export const DialogTitleStyled = styled(DialogTitle)(() => ({
  fontFamily: 'Roboto, sans-serif',
  fontWeight: 500,
  fontSize: 18,
  color: '#FFFFFF',
  paddingBottom: 8,
}));

export const DialogBodyStyled = styled(DialogContent)(() => ({
  fontFamily: 'Roboto, sans-serif',
  fontSize: 14,
  lineHeight: 1.43,
  color: '#BDBDBD',
  paddingTop: 0,
}));

export const DialogActionsStyled = styled(DialogActions)(() => ({
  padding: 16,
  justifyContent: 'flex-end',
}));

export const ErrorText = styled(Typography)(() => ({
  color: '#f44336',
  fontSize: 13,
  marginTop: 8,
}));

export const InputSuffix = styled('span')(() => ({
  fontFamily: 'Roboto, sans-serif',
  fontSize: 16,
  lineHeight: 1.5,
  letterSpacing: '0.009375em',
  color: 'rgba(255, 255, 255, 0.7)',
  marginLeft: 8,
}));

export const LoadingBox = styled(Box)(() => ({
  display: 'flex',
  justifyContent: 'center',
  padding: 24,
}));

export const StakingStartCard = styled(Box)(({ theme }) => ({
  display: 'flex',
  flexDirection: 'row',
  justifyContent: 'space-between',
  alignItems: 'center',
  gap: 16,
  boxSizing: 'border-box',
  width: '100%',
  minHeight: 116,
  padding: 24,
  backgroundColor: 'rgba(255, 255, 255, 0.08)',
  border: '1px solid rgba(255, 255, 255, 0.3)',
  borderRadius: 4,
  [theme.breakpoints.down('sm')]: {
    flexDirection: 'column',
    alignItems: 'stretch',
    minHeight: 'auto',
  },
}));

export const StakingStartTextCol = styled(Box)(() => ({
  display: 'flex',
  flexDirection: 'column',
  gap: 8,
  flex: 1,
  minWidth: 0,
}));

export const StakingStartTitle = styled(Typography)(() => ({
  margin: 0,
  fontFamily: 'Roboto, sans-serif',
  fontWeight: 400,
  fontSize: 24,
  lineHeight: 1.334,
  color: '#FFFFFF',
}));

export const StakingStartSubtitle = styled(Typography)(() => ({
  fontFamily: 'Roboto, sans-serif',
  fontWeight: 400,
  fontSize: 14,
  lineHeight: 1.43,
  letterSpacing: '0.012142857em',
  color: '#A3A3A3',
  maxWidth: 400,
}));

export const StakingStartCta = styled(Button)(({ theme }) => ({
  flexShrink: 0,
  borderRadius: 4,
  minHeight: 32,
  padding: '4px 10px',
  fontFamily: 'Roboto, sans-serif',
  fontSize: 13,
  fontWeight: 500,
  lineHeight: 1.75,
  letterSpacing: '0.028571429em',
  textTransform: 'none',
  boxShadow: theme.shadows[2],
  [theme.breakpoints.down('sm')]: {
    alignSelf: 'stretch',
    width: '100%',
  },
}));
