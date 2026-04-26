import UnfoldMoreIcon from '@mui/icons-material/UnfoldMore';
import { Box, Button, styled, TableCell, TableRow, Typography } from '@mui/material';
import { TokenIcon } from 'src/components/primitives/TokenIcon';

export const HeaderCell = styled(TableCell)(() => ({
  borderBottom: '1px solid #2f333a',
  color: '#f2f3f5',
  fontSize: 14,
  lineHeight: '20px',
  fontWeight: 600,
  paddingTop: 14,
  paddingBottom: 14,
}));

export const DataRow = styled(TableRow)(() => ({
  '& td': {
    borderBottom: '1px solid #2f333a',
    paddingTop: 18,
    paddingBottom: 18,
  },
  '&:last-of-type td': {
    borderBottom: 'none',
  },
}));

export const AssetCell = styled(Box)(() => ({
  display: 'flex',
  alignItems: 'center',
  gap: 12,
}));

export const NameText = styled(Typography)(() => ({
  color: '#f5f5f5',
  fontSize: 14,
  lineHeight: '20px',
}));

export const SymbolText = styled(Typography)(() => ({
  color: '#f5f5f5',
  fontSize: 14,
  lineHeight: '20px',
}));

export const PrimaryValue = styled(Typography)(() => ({
  color: '#f4f5f6',
  fontSize: 16,
  lineHeight: '24px',
  fontWeight: 600,
}));

export const SecondaryValue = styled(Typography)(() => ({
  color: '#a7aaaf',
  fontSize: 14,
  lineHeight: '20px',
}));

export const TablePrimaryValue = styled(Typography)(() => ({
  color: '#f4f5f6',
  fontSize: 14,
  lineHeight: '20px',
  fontWeight: 400,
}));

export const TableSecondaryValue = styled(Typography)(() => ({
  color: '#a7aaaf',
  fontSize: 14,
  lineHeight: '20px',
  fontWeight: 400,
}));

export const ValueStack = styled(Box)(() => ({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'flex-end',
  gap: 2,
}));

export const ActionButton = styled(Button)(() => ({
  borderRadius: 6,
  border: '1px solid #b4b7bd',
  backgroundColor: '#ebebeb',
  color: '#242424',
  padding: '4px 12px',
  minWidth: 86,
  fontSize: 14,
  lineHeight: '20px',
  textTransform: 'none',
  '&:hover': {
    backgroundColor: '#f4f4f4',
  },
}));

export const SortIcon = styled(UnfoldMoreIcon)(() => ({
  color: '#7c8088',
  fontSize: 18,
  marginLeft: 4,
  verticalAlign: 'middle',
}));

export const CollateralSwitch = styled(Box, {
  shouldForwardProp: (prop) => prop !== 'enabled',
})<{ enabled: boolean }>(({ enabled }) => ({
  position: 'relative',
  width: 44,
  height: 20,
  borderRadius: 14,
  backgroundColor: enabled ? '#2f5f00' : '#2f3135',
  '&::after': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: enabled ? 24 : 0,
    width: 20,
    height: 20,
    borderRadius: '50%',
    backgroundColor: enabled ? '#61d000' : '#dadbdd',
    transition: 'left .2s ease',
  },
}));

export const CollateralSwitchButton = styled('button')(() => ({
  border: 'none',
  background: 'transparent',
  padding: 0,
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  cursor: 'pointer',
  '&:disabled': {
    cursor: 'not-allowed',
    opacity: 0.6,
  },
}));

export const TableAssetIcon = styled(TokenIcon)(() => ({
  width: 24,
  height: 24,
  fontSize: 24,
}));

export const MobileAssetIcon = styled(TokenIcon)(() => ({
  width: 44,
  height: 44,
  fontSize: 44,
}));

export const MobileGrid = styled(Box)(({ theme }) => ({
  display: 'grid',
  gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
  gap: 14,
  [theme.breakpoints.down('sm')]: {
    gridTemplateColumns: '1fr',
  },
}));

export const MobileCard = styled(Box)(() => ({
  border: '1px solid #5f636a',
  borderRadius: 14,
  background: 'linear-gradient(180deg, #2f2f31 0%, #27282b 100%)',
  padding: 14,
}));

export const MobileHeader = styled(Box)(() => ({
  display: 'flex',
  alignItems: 'flex-start',
  gap: 12,
  marginBottom: 20,
}));

export const MobileRow = styled(Box)(() => ({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  marginBottom: 16,
}));

export const MobileLabel = styled(Typography)(() => ({
  color: '#f2f3f5',
  fontSize: 14,
  lineHeight: '20px',
  fontWeight: 600,
}));

export const MobileActionButton = styled(Button)(() => ({
  width: '100%',
  borderRadius: 4,
  border: '1px solid #76797f',
  backgroundColor: '#454649',
  color: '#f2f3f5',
  textTransform: 'uppercase',
  fontWeight: 600,
  fontSize: 14,
  lineHeight: '20px',
  paddingBlock: 6,
}));
