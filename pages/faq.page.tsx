import Head from 'next/head';
import FaqPage from 'src/components/FaqPage';
import { Meta } from 'src/components/Meta';

export default function Faq() {
  return (
    <>
      <Head>
        <meta name="viewport" content="initial-scale=1, width=device-width" />
      </Head>
      <Meta
        title={'K613 FAQ & Knowledge Base'}
        description={
          'Answers to questions about the protocol. Learn more about K613 security, supplying assets, withdrawing funds, and liquidation risks.'
        }
      />
      <FaqPage />
    </>
  );
}
