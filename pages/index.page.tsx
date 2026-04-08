import Head from 'next/head';
import DashboardPage from 'src/components/DashboardPage';
import { Meta } from 'src/components/Meta';

export default function HomePage() {
  return (
    <>
      <Head>
        <meta name="viewport" content="initial-scale=1, width=device-width" />
      </Head>
      <Meta
        title={'K613 Dashboard'}
        description={
          'Track your portfolio, yield, and lending activity in real time. Supply ETH and other assets, use them as collateral, and manage loans within the K613 protocol.'
        }
      />
      <DashboardPage />
    </>
  );
}
