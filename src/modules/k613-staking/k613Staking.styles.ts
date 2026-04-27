import {
  Box,
  Button,
  Checkbox,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Tab as MuiTab,
  Tabs as MuiTabs,
  Typography,
} from '@mui/material';
import { styled } from '@mui/material/styles';
import TextField from '@mui/material/TextField';

export const PageRoot = styled(Box)(({ theme }) => ({
  width: '100%',
  maxWidth: 1280,
  marginInline: 'auto',
  paddingInline: 24,
  paddingBlock: theme.spacing(5),
  [theme.breakpoints.down('md')]: {
    paddingInline: 16,
    paddingBlock: theme.spacing(4),
  },
}));

export const HeaderBlock = styled(Box)(() => ({
  display: 'flex',
  flexDirection: 'column',
  gap: 8,
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
  maxWidth: 800,
}));

export const PanelShell = styled(Box)(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  gap: 0,
  width: '100%',
  maxWidth: 800,
  marginInline: 'auto',
  [theme.breakpoints.down('sm')]: {
    padding: 0,
  },
}));

/* ─── Main tab bar (MUI Tabs, primary underline style) ─── */

export const MainTabs = styled(MuiTabs)(() => ({
  width: '100%',
  minHeight: 48,
  borderBottom: '1px solid rgba(255,255,255,0.12)',
  '& .MuiTabs-indicator': {
    height: 3,
    borderRadius: '100px 100px 0 0',
    backgroundColor: '#5fcc00',
  },
  '& .MuiTabs-flexContainer': {
    gap: 0,
  },
}));

export const MainTab = styled(MuiTab)(() => ({
  flex: 1,
  minHeight: 48,
  fontFamily: 'Roboto, sans-serif',
  fontWeight: 500,
  fontSize: 14,
  lineHeight: '20px',
  letterSpacing: '0.1px',
  textTransform: 'none',
  color: '#bdbdbd',
  opacity: 0.5,
  padding: '14px 16px',
  '&.Mui-selected': {
    color: '#5fcc00',
    opacity: 1,
  },
}));

/* ─── Per-tab section: heading + stats ─── */

export const TabSectionHeader = styled(Box)(() => ({
  display: 'flex',
  flexDirection: 'column',
  gap: 8,
  paddingTop: 64,
  paddingBottom: 16,
}));

export const TabSectionTitle = styled(Typography)(() => ({
  fontFamily: 'Roboto, sans-serif',
  fontWeight: 400,
  fontSize: 32,
  lineHeight: 1.235,
  letterSpacing: '0.25px',
  color: '#FFFFFF',
}));

export const TabSectionSubtitle = styled(Typography)(() => ({
  fontFamily: 'Roboto, sans-serif',
  fontWeight: 400,
  fontSize: 14,
  lineHeight: 1.43,
  letterSpacing: '0.17px',
  color: '#BDBDBD',
}));

/* ─── Stats grids ─── */

export const StatsOuter = styled(Box)(() => ({
  display: 'flex',
  flexDirection: 'column',
  gap: 8,
  alignSelf: 'stretch',
  paddingBottom: 12,
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

export const StatsCaption = styled(Typography)(() => ({
  fontFamily: 'Roboto, sans-serif',
  fontWeight: 400,
  fontSize: 12,
  lineHeight: 1.66,
  letterSpacing: '0.4px',
  color: 'rgba(255, 255, 255, 0.6)',
  paddingTop: 4,
}));

export const StatCard = styled(Box)(() => ({
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'center',
  gap: 8,
  padding: 16,
  flex: '1 1 0',
  minWidth: 120,
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
  letterSpacing: '0.17px',
  color: '#757575',
}));

export const StatValue = styled(Typography)(() => ({
  fontFamily: 'Roboto, sans-serif',
  fontWeight: 600,
  fontSize: 24,
  lineHeight: 1.235,
  letterSpacing: '0.25px',
  color: '#FFFFFF',
}));

export const StatValueAccent = styled(StatValue)(({ theme }) => ({
  color: theme.palette.primary.main,
}));

/* ─── Sub-tab bar (segmented buttons) ─── */

export const TabBar = styled(Box)(() => ({
  display: 'flex',
  flexDirection: 'row',
  justifyContent: 'stretch',
  alignItems: 'center',
  alignSelf: 'stretch',
  gap: 4,
  padding: 0,
  width: '100%',
  marginTop: 64,
}));

export const TabBarInner = styled(Box)(() => ({
  display: 'flex',
  flexDirection: 'row',
  justifyContent: 'center',
  alignItems: 'stretch',
  gap: 4,
  flex: 1,
  height: 38,
  borderRadius: 4,
  backgroundColor: 'rgba(255, 255, 255, 0.12)',
  border: '1px solid rgba(255, 255, 255, 0.3)',
  padding: 4,
}));

export const TabItem = styled(Button, {
  shouldForwardProp: (prop) => prop !== 'active',
})<{ active?: boolean }>(({ active }) => ({
  flex: 1,
  minHeight: 0,
  height: '100%',
  padding: '4px 10px',
  borderRadius: 4,
  textTransform: 'uppercase',
  fontFamily: 'Roboto, sans-serif',
  fontWeight: 500,
  fontSize: 13,
  lineHeight: '22px',
  letterSpacing: '0.46px',
  color: '#FFFFFF',
  backgroundColor: active ? 'rgba(255, 255, 255, 0.12)' : 'transparent',
  border: active ? '1px solid rgba(255, 255, 255, 0.3)' : '1px solid transparent',
  boxShadow: 'none',
  '&:hover': {
    backgroundColor: 'rgba(255, 255, 255, 0.18)',
    boxShadow: 'none',
  },
}));

/* ─── Content section spacing ─── */

export const TabContentColumn = styled(Box)(() => ({
  display: 'flex',
  flexDirection: 'column',
  gap: 16,
  width: '100%',
  marginTop: 16,
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

/* ─── Main panel ─── */

export const MainPanel = styled(Box)(() => ({
  display: 'flex',
  flexDirection: 'column',
  gap: 16,
  width: '100%',
  maxWidth: 800,
  marginInline: 'auto',
}));

/* ─── Form card ─── */

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
  lineHeight: '24px',
  letterSpacing: '0.17px',
  color: '#FFFFFF',
}));

export const PanelCaption = styled(Typography)(() => ({
  fontFamily: 'Roboto, sans-serif',
  fontWeight: 400,
  fontSize: 12,
  lineHeight: 1.66,
  letterSpacing: '0.4px',
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
  lineHeight: '24px',
  letterSpacing: '0.17px',
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
    lineHeight: '24px',
    letterSpacing: '0.15px',
    paddingBlock: 16,
    color: 'rgba(255, 255, 255, 0.7)',
  },
}));

export const BalanceRow = styled(Box)(() => ({
  display: 'flex',
  flexDirection: 'row',
  justifyContent: 'space-between',
  alignItems: 'center',
  alignSelf: 'stretch',
  gap: 10,
  paddingBlock: 8,
}));

export const BalanceCaption = styled(Typography)(() => ({
  fontFamily: 'Roboto, sans-serif',
  fontWeight: 400,
  fontSize: 12,
  lineHeight: 1.66,
  letterSpacing: '0.4px',
  color: 'rgba(255, 255, 255, 0.7)',
  '& strong': {
    color: '#FFFFFF',
    fontWeight: 600,
  },
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
  letterSpacing: '0.4px',
  color: theme.palette.primary.main,
  textTransform: 'uppercase',
  '&:disabled': {
    opacity: 0.4,
    cursor: 'not-allowed',
  },
}));

export const CtaButton = styled(Button)(({ theme }) => ({
  width: '100%',
  minHeight: 42,
  borderRadius: 4,
  textTransform: 'uppercase',
  fontFamily: 'Roboto, sans-serif',
  fontWeight: 500,
  fontSize: 15,
  lineHeight: '26px',
  letterSpacing: '0.46px',
  backgroundColor: theme.palette.primary.main,
  color: 'rgba(0, 0, 0, 0.87)',
  boxShadow:
    '0px 3px 1px -2px rgba(0,0,0,0.2), 0px 2px 2px 0px rgba(0,0,0,0.14), 0px 1px 5px 0px rgba(0,0,0,0.12)',

  '&.Mui-disabled': {
    backgroundColor: 'rgba(255, 255, 255, 0.12)',
    color: 'rgba(255, 255, 255, 0.3)',
    boxShadow: 'none',
  },
}));

export const CtaOutlined = styled(Button)(() => ({
  width: '100%',
  minHeight: 42,
  borderRadius: 4,
  textTransform: 'uppercase',
  fontFamily: 'Roboto, sans-serif',
  fontWeight: 500,
  fontSize: 15,
  lineHeight: '26px',
  letterSpacing: '0.46px',
  backgroundColor: 'rgba(255, 255, 255, 0.12)',
  color: '#FFFFFF',
  border: '1px solid rgba(255, 255, 255, 0.12)',
  '&:hover': {
    backgroundColor: 'rgba(255, 255, 255, 0.18)',
  },
  '&.Mui-disabled': {
    backgroundColor: 'rgba(255, 255, 255, 0.04)',
    color: 'rgba(255, 255, 255, 0.3)',
  },
}));

/* ─── Rewards stats row (horizontal key-value pair cards) ─── */

export const RewardStatsRow = styled(Box)(({ theme }) => ({
  display: 'flex',
  flexDirection: 'row',
  gap: 8,
  width: '100%',
  [theme.breakpoints.down('sm')]: {
    flexDirection: 'column',
  },
}));

export const RewardStatCard = styled(Box)(() => ({
  display: 'flex',
  flexDirection: 'row',
  alignItems: 'center',
  justifyContent: 'space-between',
  flex: '1 1 0',
  padding: 16,
  backgroundColor: 'rgba(255, 255, 255, 0.04)',
  border: '1px solid rgba(255, 255, 255, 0.1)',
  borderRadius: 4,
  gap: 16,
}));

export const RewardStatLabel = styled(Typography)(() => ({
  fontFamily: 'Roboto, sans-serif',
  fontWeight: 400,
  fontSize: 14,
  lineHeight: 1.43,
  letterSpacing: '0.17px',
  color: '#757575',
  whiteSpace: 'nowrap',
}));

export const RewardStatValue = styled(Typography)(() => ({
  fontFamily: 'Roboto, sans-serif',
  fontWeight: 600,
  fontSize: 24,
  lineHeight: 1.235,
  letterSpacing: '0.25px',
  color: '#FFFFFF',
  whiteSpace: 'nowrap',
}));

/* ─── Instant exit checkbox ─── */

export const InstantExitRow = styled(Box)(() => ({
  display: 'flex',
  flexDirection: 'row',
  alignItems: 'center',
  gap: 8,
}));

export const StyledCheckbox = styled(Checkbox)(({ theme }) => ({
  padding: 0,
  color: 'rgba(255, 255, 255, 0.23)',
  '&.Mui-checked': {
    color: theme.palette.primary.main,
  },
  '& .MuiSvgIcon-root': {
    fontSize: 18,
  },
}));

export const InstantExitLabel = styled(Typography)(() => ({
  fontFamily: 'Roboto, sans-serif',
  fontWeight: 400,
  fontSize: 14,
  lineHeight: 1.43,
  letterSpacing: '0.17px',
  color: '#FFFFFF',
  cursor: 'pointer',
}));

/* ─── Exit queue section ─── */

export const ExitQueueSection = styled(Box)(() => ({
  display: 'flex',
  flexDirection: 'column',
  gap: 0,
  marginTop: 0,
  backgroundColor: 'rgba(255, 255, 255, 0.04)',
  border: '1px solid rgba(255, 255, 255, 0.1)',
  borderRadius: 4,
  overflow: 'hidden',
}));

export const ExitQueueHeader = styled(Box)(() => ({
  display: 'flex',
  flexDirection: 'row',
  alignItems: 'center',
  justifyContent: 'space-between',
  padding: '12px 16px',
  borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
}));

export const ExitQueueTitle = styled(Typography)(() => ({
  fontFamily: 'Roboto, sans-serif',
  fontWeight: 500,
  fontSize: 14,
  lineHeight: '24px',
  letterSpacing: '0.17px',
  color: '#FFFFFF',
}));

export const ExitQueueCount = styled(Typography)(() => ({
  fontFamily: 'Roboto, sans-serif',
  fontWeight: 400,
  fontSize: 12,
  lineHeight: 1.66,
  letterSpacing: '0.4px',
  color: 'rgba(255, 255, 255, 0.6)',
}));

export const ExitQueueSubtitle = styled(Typography)(() => ({
  fontFamily: 'Roboto, sans-serif',
  fontWeight: 400,
  fontSize: 12,
  lineHeight: 1.66,
  letterSpacing: '0.4px',
  color: 'rgba(255, 255, 255, 0.6)',
  paddingInline: 16,
  paddingBottom: 8,
  borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
}));

export const ExitQueueTableHead = styled(Box)(() => ({
  display: 'grid',
  gridTemplateColumns: '1fr 1fr 1fr 1fr auto',
  gap: 0,
  paddingInline: 16,
  paddingBlock: '8px',
  borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
}));

export const ExitQueueTableRow = styled(Box)(() => ({
  display: 'grid',
  gridTemplateColumns: '1fr 1fr 1fr 1fr auto',
  gap: 0,
  paddingInline: 16,
  paddingBlock: '12px',
  alignItems: 'center',
  borderBottom: '1px solid rgba(255, 255, 255, 0.06)',
  '&:last-child': {
    borderBottom: 'none',
  },
}));

export const ExitQueueThCell = styled(Box)(() => ({
  fontFamily: 'Roboto, sans-serif',
  fontWeight: 500,
  fontSize: 12,
  lineHeight: '16px',
  letterSpacing: '0.17px',
  color: 'rgba(255, 255, 255, 0.5)',
  paddingRight: 8,
}));

export const ExitQueueTdCell = styled(Box)(() => ({
  fontFamily: 'Roboto, sans-serif',
  fontWeight: 400,
  fontSize: 14,
  lineHeight: '20px',
  letterSpacing: '0.17px',
  color: '#FFFFFF',
  paddingRight: 8,
}));

export const StatusChip = styled(Box, {
  shouldForwardProp: (prop) => prop !== 'ready',
})<{ ready?: boolean }>(({ ready, theme }) => ({
  display: 'inline-flex',
  alignItems: 'center',
  fontFamily: 'Roboto, sans-serif',
  fontWeight: 400,
  fontSize: 12,
  lineHeight: 1,
  letterSpacing: '0.17px',
  color: ready ? theme.palette.primary.main : theme.palette.primary.main,
}));

export const QueueCancelButton = styled(Button)(() => ({
  textTransform: 'uppercase',
  fontFamily: 'Roboto, sans-serif',
  fontWeight: 500,
  fontSize: 13,
  lineHeight: '22px',
  letterSpacing: '0.46px',
  color: '#FFFFFF',
  border: '1px solid rgba(255, 255, 255, 0.23)',
  borderRadius: 4,
  padding: '4px 10px',
  minWidth: 0,
  whiteSpace: 'nowrap',
  '&:hover': {
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    border: '1px solid rgba(255, 255, 255, 0.3)',
  },
  '&.Mui-disabled': {
    color: 'rgba(255, 255, 255, 0.3)',
    border: '1px solid rgba(255, 255, 255, 0.12)',
  },
}));

export const QueueExitButton = styled(Button)(({ theme }) => ({
  textTransform: 'uppercase',
  fontFamily: 'Roboto, sans-serif',
  fontWeight: 500,
  fontSize: 13,
  lineHeight: '22px',
  letterSpacing: '0.46px',
  color: 'rgba(0, 0, 0, 0.87)',
  backgroundColor: theme.palette.primary.main,
  borderRadius: 4,
  padding: '4px 10px',
  minWidth: 0,
  whiteSpace: 'nowrap',
  '&:hover': {
    backgroundColor: theme.palette.primary.dark,
  },
  '&.Mui-disabled': {
    backgroundColor: 'rgba(255, 255, 255, 0.12)',
    color: 'rgba(255, 255, 255, 0.3)',
  },
}));

/* ─── Legacy / misc ─── */

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

export const QueueNotice = styled(Typography)(() => ({
  fontFamily: 'Roboto, sans-serif',
  fontWeight: 500,
  fontSize: 12,
  lineHeight: 1.5,
  letterSpacing: '0.014166667em',
  color: 'rgba(255, 255, 255, 0.5)',
  textTransform: 'lowercase',
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
    minWidth: 320,
    maxWidth: 500,
  },
}));

export const DialogTitleStyled = styled(DialogTitle)(() => ({
  fontFamily: 'Roboto, sans-serif',
  fontWeight: 500,
  fontSize: 18,
  color: '#FFFFFF',
  paddingBottom: 8,
  backgroundColor: '#FFFFFF0D',
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

export const OnboardingHead = styled(Box)(() => ({
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  width: '100%',
  marginBottom: 8,
}));

export const OnboardingTitle = styled(Typography)(() => ({
  fontFamily: 'Roboto, sans-serif',
  fontWeight: 500,
  fontSize: 24,
  lineHeight: 1,
  letterSpacing: '0.007083333em',
  color: '#FFFFFF',
}));

export const OnboardingText = styled(Typography)(() => ({
  fontFamily: 'Roboto, sans-serif',
  fontWeight: 400,
  fontSize: 16,
  lineHeight: 1.5,
  letterSpacing: '0.010625em',
  color: '#FFFFFF',
}));

export const OnboardingHeadingText = styled(OnboardingText)(() => ({
  marginTop: 16,
}));

export const OnboardingBodyText = styled(OnboardingText)(() => ({
  marginTop: 8,
}));

export const OnboardingStepRow = styled(Box)(() => ({
  display: 'flex',
  gap: 8,
  width: '100%',
  marginTop: 24,
}));

export const OnboardingStepPill = styled(Box, {
  shouldForwardProp: (prop) => prop !== 'active',
})<{ active?: boolean }>(({ active }) => ({
  flex: 1,
  height: 4,
  borderRadius: 4,
  backgroundColor: active ? '#99FF33' : 'rgba(255,255,255,0.2)',
}));

export const OnboardingCaption = styled(Typography)(() => ({
  fontFamily: 'Roboto, sans-serif',
  fontWeight: 400,
  fontSize: 16,
  lineHeight: 1.5,
  letterSpacing: '0.010625em',
  color: '#FFFFFF',
  marginTop: 16,
  opacity: 0.7,
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

export const StakingStartCard = styled(Box)(({ theme }) => ({
  display: 'flex',
  flexDirection: 'row',
  justifyContent: 'space-between',
  alignItems: 'center',
  gap: 16,
  boxSizing: 'border-box',
  width: '100%',
  minHeight: 128,
  padding: 24,
  background:
    'linear-gradient(135deg, rgba(95,204,0,0.2) 0%, rgba(255,255,255,0.04) 48%, rgba(255,255,255,0.08) 100%)',
  border: '1px solid rgba(255, 255, 255, 0.2)',
  borderRadius: 12,
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
  fontWeight: 500,
  fontSize: 28,
  lineHeight: 1.2,
  color: '#FFFFFF',
}));

export const StakingStartSubtitle = styled(Typography)(() => ({
  fontFamily: 'Roboto, sans-serif',
  fontWeight: 400,
  fontSize: 15,
  lineHeight: 1.5,
  color: 'rgba(255, 255, 255, 0.74)',
  maxWidth: 460,
}));

export const StakingStartCta = styled(Button)(({ theme }) => ({
  flexShrink: 0,
  borderRadius: 8,
  minHeight: 40,
  padding: '8px 14px',
  fontFamily: 'Roboto, sans-serif',
  fontSize: 14,
  fontWeight: 500,
  lineHeight: 1.5,
  letterSpacing: '0.01em',
  textTransform: 'none',
  boxShadow: theme.shadows[4],
  [theme.breakpoints.down('sm')]: {
    alignSelf: 'stretch',
    width: '100%',
  },
}));

/* ─── Step strip (kept for backward compat with onboarding) ─── */

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

/* ─── Misc cards kept for dialog compatibility ─── */

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
