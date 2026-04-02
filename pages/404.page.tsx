import { Box, Button, Typography } from '@mui/material';
import Image from 'next/image';
import Layout from 'src/components/Layout';

export default function NotFound() {
  return (
    <Layout>
      <Box
        display="flex"
        flexDirection="column"
        gap={3}
        alignItems="center"
        justifyContent="center"
        width="100%"
        flexGrow={1}
      >
        <Image src="/404/404.png" width={100} height={100} alt="404" />
        <Box display="flex" flexDirection="column" gap={1} textAlign="center" maxWidth={340}>
          <Typography fontSize={24}>Page not found</Typography>
          <Typography fontSize={14} color="secondary.main">
            Sorry, we couldn&apos;t find the page you were looking for.
            <br />
            We suggest you go back to the home page
          </Typography>
        </Box>
        <Button href="/" variant="contained">
          BACK HOME
        </Button>
      </Box>
    </Layout>
  );
}
