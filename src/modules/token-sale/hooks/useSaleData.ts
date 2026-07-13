import saleArtifact from 'src/abis/K613Sale/K613Sale.json';
import { useRootStore } from 'src/store/root';
import { useAccount, useReadContract } from 'wagmi';

import { ERC20_ABI, HARD_CAP_USDC, SALE_ALLOCATION_K613 } from '../constants';
import { SaleSchedule, SaleStats, UserSaleState } from '../types';
import { useTokenSaleConfig } from './useTokenSaleConfig';

export const SALE_ABI = (saleArtifact as unknown as { abi: unknown[] }).abi;

const POLLING_INTERVAL = 30_000;

// Mirror of the K613PublicSale.saleInfo() return tuple.
type SaleInfo = {
  stage: number;
  saleStart: bigint;
  saleEnd: bigint;
  saleAllocation: bigint;
  hardCap: bigint;
  totalDeposits: bigint;
  participants: bigint;
  finalized: boolean;
  funded: boolean;
  totalTokensSold: bigint;
  claimDeadline: bigint;
};

// Mirror of the K613PublicSale.userInfo(address) return tuple.
type UserInfo = {
  deposited: bigint;
  allocation: bigint;
  refund: bigint;
  tokensClaimed: boolean;
  refundClaimed: boolean;
  claimableTokens: bigint;
  claimableRefund: bigint;
};

export type SaleData = {
  isSaleConfigured: boolean;
  schedule: SaleSchedule;
  stats: SaleStats;
  user: UserSaleState;
  /** K613 address, straight from the sale contract — never hardcoded per network. */
  saleTokenAddress?: `0x${string}`;
  isLoading: boolean;
  refetchAll: () => Promise<unknown>;
};

export function useSaleData(): SaleData {
  const config = useTokenSaleConfig();
  const { address } = useAccount();

  // Sale stats are public — they must render for a visitor with no wallet. Without
  // an explicit chainId wagmi reads through the *connected* chain, which does not
  // exist when disconnected, so it falls back to the config's first chain and the
  // calls silently return nothing. Pin every read to the chain the sale lives on.
  const saleChainId = useRootStore((s) => s.currentMarketData.chainId) as number | undefined;

  const saleAddress = (config?.SALE_CONTRACT || undefined) as `0x${string}` | undefined;
  const usdcAddress = (config?.USDC || undefined) as `0x${string}` | undefined;
  const saleEnabled = Boolean(saleAddress);
  const userEnabled = Boolean(saleAddress && address);

  // Aggregate views — one call each instead of polling every field separately.
  const saleInfoRead = useReadContract({
    address: saleAddress,
    abi: SALE_ABI,
    functionName: 'saleInfo',
    chainId: saleChainId,
    query: { enabled: saleEnabled, refetchInterval: POLLING_INTERVAL },
  });
  const userInfoRead = useReadContract({
    address: saleAddress,
    abi: SALE_ABI,
    functionName: 'userInfo',
    args: address ? [address] : undefined,
    chainId: saleChainId,
    query: { enabled: userEnabled, refetchInterval: POLLING_INTERVAL },
  });

  // Immutable on the contract, so it never needs polling.
  const saleTokenRead = useReadContract({
    address: saleAddress,
    abi: SALE_ABI,
    functionName: 'saleToken',
    chainId: saleChainId,
    query: { enabled: saleEnabled },
  });

  const usdcBalanceRead = useReadContract({
    address: usdcAddress,
    abi: ERC20_ABI,
    functionName: 'balanceOf',
    args: address ? [address] : undefined,
    chainId: saleChainId,
    query: { enabled: Boolean(usdcAddress && address), refetchInterval: POLLING_INTERVAL },
  });
  const usdcAllowanceRead = useReadContract({
    address: usdcAddress,
    abi: ERC20_ABI,
    functionName: 'allowance',
    args: address && saleAddress ? [address, saleAddress] : undefined,
    chainId: saleChainId,
    query: { enabled: Boolean(usdcAddress && address && saleAddress) },
  });

  const saleInfo = saleInfoRead.data as SaleInfo | undefined;
  const userInfo = userInfoRead.data as UserInfo | undefined;
  const finalized = Boolean(saleInfo?.finalized);

  // On-chain schedule wins once the contract is deployed; the config schedule
  // keeps the page functional before deployment.
  const onChainStart = Number(saleInfo?.saleStart ?? 0n);
  const onChainEnd = Number(saleInfo?.saleEnd ?? 0n);
  // claimDeadline is 0 until finalize() sets it to block.timestamp + CLAIM_WINDOW.
  const onChainClaimDeadline = Number(saleInfo?.claimDeadline ?? 0n);

  const schedule: SaleSchedule = {
    saleStartMs: (onChainStart || config?.CONTRIBUTION_START_TS || 0) * 1000,
    saleEndMs: (onChainEnd || config?.CONTRIBUTION_END_TS || 0) * 1000,
    // K613PublicSale has no separate claim start: claiming opens the moment the
    // sale is finalized. 0 makes getCurrentStage() flip to "claim" on finalize.
    claimStartMs: 0,
    claimDeadlineMs: onChainClaimDeadline * 1000,
    finalized,
  };

  const stats: SaleStats = {
    totalDeposited: saleInfo?.totalDeposits ?? 0n,
    participantCount: Number(saleInfo?.participants ?? 0n),
    // On-chain parameters win once the contract is deployed; the config values
    // keep the page functional (and the price derivable) before deployment.
    hardCap: saleInfo?.hardCap && saleInfo.hardCap > 0n ? saleInfo.hardCap : HARD_CAP_USDC,
    saleAllocation:
      saleInfo?.saleAllocation && saleInfo.saleAllocation > 0n
        ? saleInfo.saleAllocation
        : SALE_ALLOCATION_K613,
    totalTokensSold: saleInfo?.totalTokensSold ?? 0n,
  };

  const user: UserSaleState = {
    deposit: userInfo?.deposited ?? 0n,
    usdcBalance: (usdcBalanceRead.data as bigint | undefined) ?? 0n,
    usdcAllowance: (usdcAllowanceRead.data as bigint | undefined) ?? 0n,
    tokensClaimed: Boolean(userInfo?.tokensClaimed),
    refundClaimed: Boolean(userInfo?.refundClaimed),
    finalAllocation: finalized ? userInfo?.allocation ?? null : null,
    finalRefund: finalized ? userInfo?.refund ?? null : null,
    claimableTokens: userInfo?.claimableTokens ?? 0n,
    claimableRefund: userInfo?.claimableRefund ?? 0n,
  };

  const refetchAll = () =>
    Promise.all([
      saleInfoRead.refetch(),
      userInfoRead.refetch(),
      usdcBalanceRead.refetch(),
      usdcAllowanceRead.refetch(),
    ]);

  return {
    isSaleConfigured: saleEnabled,
    schedule,
    stats,
    user,
    saleTokenAddress: saleTokenRead.data as `0x${string}` | undefined,
    isLoading: saleEnabled && saleInfoRead.isLoading,
    refetchAll,
  };
}
