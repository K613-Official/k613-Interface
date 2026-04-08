import Head from 'next/head';
import MarketsPage from 'src/components/MarketsPage';
import { Meta } from 'src/components/Meta';

export default function Markets() {
  return (
    <>
      <Head>
        <meta name="viewport" content="initial-scale=1, width=device-width" />
      </Head>
      <Meta
        title={'K613 Markets'}
        description={
          'Overview of available lending and borrowing markets on K613 protocol. Track total supplied, total borrowed, and current interest rates for all assets in real time.'
        }
      />
      <MarketsPage />
    </>
  );
}
