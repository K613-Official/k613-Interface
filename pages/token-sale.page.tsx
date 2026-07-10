import Head from 'next/head';
import Layout from 'src/components/Layout';
import { Meta } from 'src/components/Meta';
import { TokenSalePage } from 'src/modules/token-sale/TokenSalePage';

export default function TokenSale() {
  return (
    <Layout>
      <Head>
        <meta name="viewport" content="initial-scale=1, width=device-width" />
      </Head>
      <Meta
        title={'K613 Public Token Sale'}
        description={
          '10,000,000 K613 at a fixed price of $0.01 with a $100,000 hard cap on Monad. Pro-rata allocation, no deposit limits, 100% unlock at claim.'
        }
      />
      <TokenSalePage />
    </Layout>
  );
}
