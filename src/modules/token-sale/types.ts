export type SaleStageKey = 'upcoming' | 'contribution' | 'closed' | 'finalized' | 'claim';

export type SaleSchedule = {
  saleStartMs: number;
  saleEndMs: number;
  claimStartMs: number;
  finalized: boolean;
};

export type SaleAction = 'approve' | 'deposit' | 'claimTokens' | 'claimRefund';

export type SaleStats = {
  totalDeposited: bigint;
  participantCount: number;
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
};
