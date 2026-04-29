import { Box, Link } from '@mui/material';
import Image from 'next/image';
import { FC } from 'react';
import MaxWidthContainer from 'src/components/MaxWidthContainer';

import { SOCIAL_LINKS } from './const';
import { Container, LinksWrapper, Wrapper } from './styles';

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
              const { id, href, icon, alt } = link;

              return (
                <Link key={id} href={href}>
                  <Image src={icon} width={24} height={24} alt={alt} />
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
