import { ButtonOwnProps } from '@mui/material';
import { Theme } from '@mui/material/styles';

const buttonConfig = () => ({
  MuiButton: {
    styleOverrides: {
      root: ({ ownerState, theme }: { ownerState: ButtonOwnProps; theme: Theme }) => ({
        textTransform: 'capitalize',

        ...(ownerState.size === 'small' && {
          paddingBlock: 4,
          paddingInline: 8,
        }),

        ...(ownerState.color === 'accent' && {
          backgroundColor: theme.palette.primary.main,
          color: theme.palette.background.default,
          transition: 'opacity 0.25s ease',

          '&:hover': {
            opacity: 0.8,
          },
        }),

        ...(ownerState.color === 'primary' && {
          transition: 'opacity 0.25s ease',

          '&:hover': {
            backgroundColor: theme.palette.primary.main,
            opacity: 0.8,
          },
        }),

        ...(ownerState.color === 'secondary' &&
          ownerState.variant === 'contained' && {
            backgroundColor: '#FFFFFF14',
            color: theme.palette.text.primary,
          }),

        ...(ownerState.color === 'info' &&
          ownerState.variant === 'contained' && {
            backgroundColor: theme.palette.secondary.main,
            color: '#000000DE',
          }),

        ...(ownerState.variant === 'text' && {
          '&:hover': {
            background: 'transparent',

            boxShadow: '4px 4px 8px 0px rgba(0, 0, 0, 0.2)',
          },
        }),

        ...(ownerState.variant === 'outlined' && {
          backgroundColor: '#FFFFFF1F',
          borderColor: '#FFFFFF4D',
          color: '#FFF',
          transition: 'background-color 150ms cubic-bezier(0.4, 0, 0.2, 1) 0ms',

          '&:hover': {
            backgroundColor: '#ffffff14',
          },
        }),
      }),
    },
  },
});

export default buttonConfig;
