import saleArtifact from 'src/abis/K613Sale/K613Sale.json';
import { useAccount, useReadContract } from 'wagmi';

import { ERC20_ABI } from '../constants';
import { SaleSchedule, SaleStats, UserSaleState } from '../types';
import { useTokenSaleConfig } from './useTokenSaleConfig';

export const SALE_ABI = (saleArtifact as unknown as { abi: unknown[] }).abi;

const POLLING_INTERVAL = 30_000;

export type SaleData = {
  isSaleConfigured: boolean;
  schedule: SaleSchedule;
  stats: SaleStats;
  user: UserSaleState;
  isLoading: boolean;
  refetchAll: () => Promise<unknown>;
};

export function useSaleData(): SaleData {
  const config = useTokenSaleConfig();
  const { address } = useAccount();

  const saleAddress = (config?.SALE_CONTRACT || undefined) as `0x${string}` | undefined;
  const usdcAddress = (config?.USDC || undefined) as `0x${string}` | undefined;
  const saleEnabled = Boolean(saleAddress);
  const userEnabled = Boolean(saleAddress && address);

  const saleQuery = { enabled: saleEnabled, refetchInterval: POLLING_INTERVAL };
  const userQuery = { enabled: userEnabled, refetchInterval: POLLING_INTERVAL };

  const totalDepositedRead = useReadContract({
    address: saleAddress,
    abi: SALE_ABI,
    functionName: 'totalDeposited',
    query: saleQuery,
  });
  const participantCountRead = useReadContract({
    address: saleAddress,
    abi: SALE_ABI,
    functionName: 'participantCount',
    query: saleQuery,
  });
  const saleStartRead = useReadContract({
    address: saleAddress,
    abi: SALE_ABI,
    functionName: 'saleStart',
    query: { enabled: saleEnabled },
  });
  const saleEndRead = useReadContract({
    address: saleAddress,
    abi: SALE_ABI,
    functionName: 'saleEnd',
    query: { enabled: saleEnabled },
  });
  const claimStartRead = useReadContract({
    address: saleAddress,
    abi: SALE_ABI,
    functionName: 'claimStart',
    query: { enabled: saleEnabled },
  });
  const finalizedRead = useReadContract({
    address: saleAddress,
    abi: SALE_ABI,
    functionName: 'finalized',
    query: saleQuery,
  });

  const depositRead = useReadContract({
    address: saleAddress,
    abi: SALE_ABI,
    functionName: 'deposits',
    args: address ? [address] : undefined,
    query: userQuery,
  });
  const tokensClaimedRead = useReadContract({
    address: saleAddress,
    abi: SALE_ABI,
    functionName: 'tokensClaimed',
    args: address ? [address] : undefined,
    query: userQuery,
  });
  const refundClaimedRead = useReadContract({
    address: saleAddress,
    abi: SALE_ABI,
    functionName: 'refundClaimed',
    args: address ? [address] : undefined,
    query: userQuery,
  });

  const finalized = Boolean(finalizedRead.data);

  const finalAllocationRead = useReadContract({
    address: saleAddress,
    abi: SALE_ABI,
    functionName: 'allocationOf',
    args: address ? [address] : undefined,
    query: { enabled: userEnabled && finalized },
  });
  const finalRefundRead = useReadContract({
    address: saleAddress,
    abi: SALE_ABI,
    functionName: 'refundOf',
    args: address ? [address] : undefined,
    query: { enabled: userEnabled && finalized },
  });

  const usdcBalanceRead = useReadContract({
    address: usdcAddress,
    abi: ERC20_ABI,
    functionName: 'balanceOf',
    args: address ? [address] : undefined,
    query: { enabled: Boolean(usdcAddress && address), refetchInterval: POLLING_INTERVAL },
  });
  const usdcAllowanceRead = useReadContract({
    address: usdcAddress,
    abi: ERC20_ABI,
    functionName: 'allowance',
    args: address && saleAddress ? [address, saleAddress] : undefined,
    query: { enabled: Boolean(usdcAddress && address && saleAddress) },
  });

  // On-chain schedule wins once the contract is deployed; the config schedule
  // keeps the page functional before deployment.
  const onChainStart = Number((saleStartRead.data as bigint | undefined) ?? 0n);
  const onChainEnd = Number((saleEndRead.data as bigint | undefined) ?? 0n);
  const onChainClaim = Number((claimStartRead.data as bigint | undefined) ?? 0n);

  const schedule: SaleSchedule = {
    saleStartMs: (onChainStart || config?.CONTRIBUTION_START_TS || 0) * 1000,
    saleEndMs: (onChainEnd || config?.CONTRIBUTION_END_TS || 0) * 1000,
    claimStartMs: (onChainClaim || config?.CLAIM_START_TS || 0) * 1000,
    finalized,
  };

  const stats: SaleStats = {
    totalDeposited: (totalDepositedRead.data as bigint | undefined) ?? 0n,
    participantCount: Number((participantCountRead.data as bigint | undefined) ?? 0n),
  };

  const user: UserSaleState = {
    deposit: (depositRead.data as bigint | undefined) ?? 0n,
    usdcBalance: (usdcBalanceRead.data as bigint | undefined) ?? 0n,
    usdcAllowance: (usdcAllowanceRead.data as bigint | undefined) ?? 0n,
    tokensClaimed: Boolean(tokensClaimedRead.data),
    refundClaimed: Boolean(refundClaimedRead.data),
    finalAllocation: finalized ? (finalAllocationRead.data as bigint | undefined) ?? null : null,
    finalRefund: finalized ? (finalRefundRead.data as bigint | undefined) ?? null : null,
  };

  const refetchAll = () =>
    Promise.all([
      totalDepositedRead.refetch(),
      participantCountRead.refetch(),
      finalizedRead.refetch(),
      depositRead.refetch(),
      tokensClaimedRead.refetch(),
      refundClaimedRead.refetch(),
      finalAllocationRead.refetch(),
      finalRefundRead.refetch(),
      usdcBalanceRead.refetch(),
      usdcAllowanceRead.refetch(),
    ]);

  return {
    isSaleConfigured: saleEnabled,
    schedule,
    stats,
    user,
    isLoading: saleEnabled && (totalDepositedRead.isLoading || finalizedRead.isLoading),
    refetchAll,
  };
}
