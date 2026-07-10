export type SaleStageKey = 'upcoming' | 'contribution' | 'closed' | 'finalized' | 'claim';

export type SaleSchedule = {
  saleStartMs: number;
  saleEndMs: number;
  claimStartMs: number;
  /** On-chain claim deadline (ms). 0 until finalization sets it. */
  claimDeadlineMs: number;
  finalized: boolean;
};

export type SaleAction = 'approve' | 'deposit' | 'claimTokens' | 'claimRefund';

export type SaleStats = {
  totalDeposited: bigint;
  participantCount: number;
  /** On-chain hard cap (USDC, 6 decimals). Falls back to the config until read. */
  hardCap: bigint;
  /** On-chain sale allocation (K613, 18 decimals). Falls back to the config until read. */
  saleAllocation: bigint;
  /** K613 sold, set by finalize(). 0 before finalization. */
  totalTokensSold: bigint;
};

export type UserSaleState = {
  deposit: bigint;
  usdcBalance: bigint;
  usdcAllowance: bigint;
  tokensClaimed: boolean;
  refundClaimed: boolean;
  /** Final on-chain allocation, available after finalization. */
  finalAllocation: bigint | null;
  /** Final on-chain refund, available after finalization. */
  finalRefund: bigint | null;
  /** Contract-reported claimable K613 right now (0 unless finalized & claim window open & unclaimed). */
  claimableTokens: bigint;
  /** Contract-reported claimable USDC refund right now. */
  claimableRefund: bigint;
};
