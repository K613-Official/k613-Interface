import { ConnectWalletPaper } from 'src/components/ConnectWalletPaper';
import Layout from 'src/components/Layout';
import { useWeb3Context } from 'src/libs/hooks/useWeb3Context';
import { PageRoot } from 'src/modules/k613-staking/k613Staking.styles';
import { K613StakingPanel } from 'src/modules/k613-staking/K613StakingPanel';

export default function StakingK613() {
  const { currentAccount } = useWeb3Context();

  return (
    <Layout>
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
