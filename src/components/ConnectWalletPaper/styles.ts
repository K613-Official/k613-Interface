import { Box, styled } from '@mui/material';

export const Container = styled(Box)(() => ({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  gap: 24,
  width: '100%',
  minHeight: 500,
  backgroundColor: '#FFFFFF14',
  border: '1px solid #FFFFFF4D',
  borderRadius: 4,
  padding: 8,
}));
