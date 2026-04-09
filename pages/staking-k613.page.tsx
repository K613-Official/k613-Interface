import Head from 'next/head';
import { ConnectWalletPaper } from 'src/components/ConnectWalletPaper';
import { K613StakingPanel } from 'src/components/K613StakingPanel';
import Layout from 'src/components/Layout';
import { Meta } from 'src/components/Meta';
import { useWeb3Context } from 'src/libs/hooks/useWeb3Context';
import { PageRoot } from 'src/modules/k613-staking/k613Staking.styles';

export default function StakingK613() {
  const { currentAccount } = useWeb3Context();

  return (
    <Layout>
      <Head>
        <meta name="viewport" content="initial-scale=1, width=device-width" />
      </Head>
      <Meta
        title={'K613 Staking'}
        description={
          'Lock your K613 tokens to earn rewards. Receive xK613, track undistributed rewards, and manage the withdrawal queue. High yields and transparent mechanisms powered by K613.'
        }
      />
      {currentAccount ? (
        <K613StakingPanel />
      ) : (
        <PageRoot>
          <ConnectWalletPaper />
        </PageRoot>
      )}
    </Layout>
  );
}
