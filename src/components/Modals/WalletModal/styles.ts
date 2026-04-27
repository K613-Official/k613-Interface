import {
  Box,
  Button as ButtonBase,
  Dialog as DialogBase,
  IconButton as IconButtonBase,
  styled,
  Typography,
} from '@mui/material';

export const Dialog = styled(DialogBase)(({ theme }) => ({
  '& .MuiPaper-root': {
    backgroundColor: theme.palette.text.primary,
    borderRadius: 4,
    padding: 24,
    minWidth: 360,
    backgroundImage: 'none',
  },
}));

export const Header = styled(Box)({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  position: 'relative',
});

export const CloseButton = styled(IconButtonBase)({
  position: 'absolute',
  right: 10,
  color: '#000',
  padding: 4,
});

export const AvatarSection = styled(Box)({
  display: 'flex',
  justifyContent: 'center',
  margin: '24px auto 16px',
});

export const AddressRow = styled(Box)({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  gap: 4,
});

export const CopyButton = styled(IconButtonBase)(({ theme }) => ({
  color: theme.palette.background.default,
  padding: 4,
}));

export const Balance = styled(Typography)({
  color: '#BDBDBD',
  textAlign: 'center',
  marginTop: 4,
});

export const DisconnectButton = styled(ButtonBase)({
  marginTop: 24,
  width: '100%',
  background: '#EEEEEE',
  color: '#000',
});
