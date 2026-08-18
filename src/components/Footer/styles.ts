import { Box, styled } from '@mui/material';

export const Container = styled(Box)(({ theme }) => ({
  width: '100%',
  backgroundColor: theme.palette.background.default,
  paddingBlock: 24,
  marginTop: 'auto',
  marginBottom: 0,
}));

export const Wrapper = styled(Box)(({ theme }) => ({
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',

  [theme.breakpoints.down('sm')]: {
    alignItems: 'flex-end',
  },
}));

export const LinksWrapper = styled(Box)(({ theme }) => ({
  display: 'flex',
  gap: 16,

  [theme.breakpoints.down('sm')]: {
    flexDirection: 'column',
  },
}));

/**
 * Social icons as a gradient fill rather than flat white.
 *
 * The SVG is used as a mask, not as an <img>: CSS cannot reach inside a file
 * loaded through <img>, and repainting six third-party logos by hand would drift
 * apart on the next icon added. As a mask every logo takes the same gradient,
 * the same box and the same hover, whatever its own markup says.
 */
export const SocialIcon = styled(Box, {
  shouldForwardProp: (prop) => prop !== 'icon' && prop !== 'scale',
})<{ icon: string; scale?: number }>(({ icon, scale = 1 }) => ({
  width: 24,
  height: 24,
  display: 'block',
  background: 'linear-gradient(180deg, #FFFFFF 0%, #E6E8EA 38%, #8A9099 100%)',
  transition: 'background .2s ease, transform .2s ease',
  maskImage: `url(${icon})`,
  maskRepeat: 'no-repeat',
  maskPosition: 'center',
  maskSize: `${Math.round(scale * 100)}%`,
  WebkitMaskImage: `url(${icon})`,
  WebkitMaskRepeat: 'no-repeat',
  WebkitMaskPosition: 'center',
  WebkitMaskSize: `${Math.round(scale * 100)}%`,
  '&:hover': {
    background: 'linear-gradient(180deg, #FFFFFF 0%, #FFFFFF 45%, #C9CED6 100%)',
    transform: 'translateY(-1px)',
  },
}));
