'use client';

import { Box } from '@mui/material';
import { FC, PropsWithChildren } from 'react';
import Footer from 'src/components/Footer';
import Header from 'src/components/Header';

const Layout: FC<PropsWithChildren> = (props) => {
  const { children } = props;

  return (
    <Box display="flex" flexDirection="column" minHeight="100vh">
      <Header />
      {children}
      <Footer />
    </Box>
  );
};

export default Layout;
