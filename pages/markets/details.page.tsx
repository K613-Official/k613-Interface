import Head from 'next/head';
import MarketAssetDetailsPage from 'src/components/MarketAssetDetailsPage';
import { Meta } from 'src/components/Meta';

export default function MarketDetails() {
  return (
    <>
      <Head>
        <meta name="viewport" content="initial-scale=1, width=device-width" />
      </Head>
      <Meta
        title={'Market details'}
        description={
          'Reserve details including liquidity, utilization, configuration parameters, and historical rates for the selected asset.'
        }
      />
      <MarketAssetDetailsPage />
    </>
  );
}
