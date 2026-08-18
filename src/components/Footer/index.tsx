import { Box, Link } from '@mui/material';
import { FC } from 'react';
import MaxWidthContainer from 'src/components/MaxWidthContainer';

import { SOCIAL_LINKS } from './const';
import { Container, LinksWrapper, SocialIcon, Wrapper } from './styles';

const Footer: FC = () => {
  return (
    <Container>
      <MaxWidthContainer>
        <Wrapper>
          <LinksWrapper>
            <Link
              href="/terms-of-service.pdf"
              fontWeight={400}
              fontSize={12}
              underline="none"
              color="inherit"
              target="_blank"
            >
              TERMS
            </Link>
            <Link
              href="/privacy-policy.pdf"
              fontWeight={400}
              fontSize={12}
              underline="none"
              color="inherit"
              target="_blank"
            >
              PRIVACY
            </Link>
          </LinksWrapper>

          <Box display="flex" alignItems="center" gap={2}>
            {SOCIAL_LINKS.map((link) => {
              const { id, href, icon, alt, scale } = link;

              return (
                <Link
                  key={id}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={alt}
                  sx={{ display: 'inline-flex' }}
                >
                  <SocialIcon icon={icon} scale={scale} role="img" />
                </Link>
              );
            })}
          </Box>
        </Wrapper>
      </MaxWidthContainer>
    </Container>
  );
};

export default Footer;
