export enum ModalType {
  Wallet = 'Wallet',
  ClaimRewards = 'ClaimRewards',
  SupplySuccess = 'SupplySuccess',
  Supply = 'Supply',
  Withdraw = 'Withdraw',
  Borrow = 'Borrow',
  Repay = 'Repay',
}

export interface WalletModalProps {
  address: string;
}

export interface ClaimRewardsModalProps {}

export interface SupplySuccessModalProps {
  amount: string;
  token: string;
}

export interface SupplyModalProps {
  underlyingAsset: string;
}

export interface WithdrawModalProps {
  underlyingAsset: string;
}

export interface BorrowModalProps {
  underlyingAsset: string;
}

export interface RepayModalProps {
  underlyingAsset: string;
  isFrozen?: boolean;
}

export interface ModalPropsMap {
  [ModalType.Wallet]: WalletModalProps;
  [ModalType.ClaimRewards]: ClaimRewardsModalProps;
  [ModalType.SupplySuccess]: SupplySuccessModalProps;
  [ModalType.Supply]: SupplyModalProps;
  [ModalType.Withdraw]: WithdrawModalProps;
  [ModalType.Borrow]: BorrowModalProps;
  [ModalType.Repay]: RepayModalProps;
}

export interface BaseModalProps {
  open: boolean;
  onClose: () => void;
}
