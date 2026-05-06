import Head from 'next/head';
import Layout from 'src/components/Layout';
import { Meta } from 'src/components/Meta';
import { PointsCampaignPage } from 'src/modules/points-campaign/PointsCampaignPage';

export default function PointsCampaign() {
  return (
    <Layout>
      <Head>
        <meta name="viewport" content="initial-scale=1, width=device-width" />
      </Head>
      <Meta
        title={'K613S1 Campaign'}
        description={
          'Season 1 K613S1 campaign with weekly snapshots, leaderboard standings, and rules overview.'
        }
      />
      <PointsCampaignPage />
    </Layout>
  );
}
