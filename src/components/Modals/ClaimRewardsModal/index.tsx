import { Button, CircularProgress, Typography } from '@mui/material';
import { BigNumber, constants, Contract } from 'ethers';
import { formatUnits, Interface } from 'ethers/lib/utils';
import { useMemo, useState } from 'react';
import { useAppDataContext } from 'src/hooks/app-data-provider/useAppDataProvider';
import { useOnChainClaimable } from 'src/hooks/pool/useOnChainClaimable';
import { useWeb3Context } from 'src/libs/hooks/useWeb3Context';
import { useRootStore } from 'src/store/root';

import { BaseModalProps, ClaimRewardsModalProps } from '../types';
import { Actions, Content, Dialog, Header } from './styles';

type Props = BaseModalProps & ClaimRewardsModalProps;

const RC_IFACE = new Interface([
  'function claimAllRewards(address[] assets, address to) returns (address[], uint256[])',
]);
const TOKEN_ABI = ['function getIncentivesController() view returns (address)'];

export default function ClaimRewardsModal({ open, onClose }: Props) {
  const currentMarketData = useRootStore((s) => s.currentMarketData);
  const account = useRootStore((s) => s.account);
  const { sendTx, provider } = useWeb3Context();
  const { reserves } = useAppDataContext();
  const { data: rewards = [] } = useOnChainClaimable(currentMarketData);

  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [txHash, setTxHash] = useState<string | null>(null);

  const totalByReward = useMemo(
    () =>
      rewards
        .filter((r) => (r.amount as BigNumber)?.gt(0))
        .map((r) => ({
          symbol: r.symbol,
          human: Number(formatUnits(r.amount, r.decimals)),
        })),
    [rewards]
  );
  const hasClaimable = totalByReward.length > 0;

  const handleClaim = async () => {
    if (!account || !provider) return;
    setBusy(true);
    setError(null);
    setTxHash(null);
    try {
      const assets: string[] = [];
      for (const reserve of reserves) {
        if (reserve.aTokenAddress) assets.push(reserve.aTokenAddress);
        if (reserve.variableDebtTokenAddress) assets.push(reserve.variableDebtTokenAddress);
      }

      let rcAddress = constants.AddressZero;
      for (const a of assets) {
        try {
          const got: string = await new Contract(a, TOKEN_ABI, provider).getIncentivesController();
          if (got && got !== constants.AddressZero) {
            rcAddress = got;
            break;
          }
        } catch {
          // skip
        }
      }
      if (rcAddress === constants.AddressZero) {
        throw new Error('RewardsController not found for this market');
      }

      const data = RC_IFACE.encodeFunctionData('claimAllRewards', [assets, account]);
      const tx = await sendTx({ from: account, to: rcAddress, data });
      setTxHash(tx.hash);
      await tx.wait();
      setBusy(false);
      onClose();
    } catch (e) {
      setError(((e as Error).message || 'Transaction failed').slice(0, 240));
      setBusy(false);
    }
  };

  return (
    <Dialog open={open} onClose={busy ? undefined : onClose}>
      <Header>
        <Typography variant="h6" sx={{ color: 'rgba(0,0,0,0.87)' }}>
          Claim rewards
        </Typography>
      </Header>

      <Content>
        {hasClaimable ? (
          totalByReward.map((r) => (
            <Typography
              key={r.symbol}
              variant="body2"
              sx={{ color: 'rgba(0,0,0,0.87)', mb: 0.5 }}
            >
              {r.human.toFixed(4)} {r.symbol}
            </Typography>
          ))
        ) : (
          <Typography variant="body2" sx={{ color: 'rgba(0,0,0,0.87)' }}>
            You have no rewards to claim at this time
          </Typography>
        )}
        {error && (
          <Typography variant="caption" sx={{ color: 'error.main', mt: 1, display: 'block' }}>
            {error}
          </Typography>
        )}
        {txHash && !error && (
          <Typography variant="caption" sx={{ color: 'success.main', mt: 1, display: 'block' }}>
            Sent: {txHash.slice(0, 10)}…
          </Typography>
        )}
      </Content>

      <Actions>
        <Button variant="text" color="info" onClick={onClose} disabled={busy}>
          close
        </Button>
        <Button
          variant="text"
          color="inherit"
          onClick={handleClaim}
          disabled={!hasClaimable || busy || !account}
          startIcon={busy ? <CircularProgress size={14} /> : undefined}
        >
          {busy ? 'Claiming…' : 'Claim'}
        </Button>
      </Actions>
    </Dialog>
  );
}
