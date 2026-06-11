import { waitForTransactionReceipt } from '@wagmi/core';
import { useState } from 'react';
import { useConfig, useWriteContract } from 'wagmi';

import { ERC20_ABI } from '../constants';
import { SaleAction } from '../types';
import { SALE_ABI } from './useSaleData';
import { useTokenSaleConfig } from './useTokenSaleConfig';

export function useSaleActions(refetchAll: () => Promise<unknown>) {
  const config = useTokenSaleConfig();
  const wagmiConfig = useConfig();
  const { writeContractAsync } = useWriteContract();
  const [pendingAction, setPendingAction] = useState<SaleAction | null>(null);

  const saleAddress = (config?.SALE_CONTRACT || undefined) as `0x${string}` | undefined;
  const usdcAddress = (config?.USDC || undefined) as `0x${string}` | undefined;

  const run = async (action: SaleAction, sendTx: () => Promise<`0x${string}`>) => {
    setPendingAction(action);
    try {
      const hash = await sendTx();
      await waitForTransactionReceipt(wagmiConfig, { hash });
      await refetchAll();
      return hash;
    } finally {
      setPendingAction(null);
    }
  };

  const approve = async (amount: bigint) => {
    if (!usdcAddress || !saleAddress) return;
    return run('approve', () =>
      writeContractAsync({
        address: usdcAddress,
        abi: ERC20_ABI,
        functionName: 'approve',
        args: [saleAddress, amount],
      })
    );
  };

  const deposit = async (amount: bigint) => {
    if (!saleAddress) return;
    return run('deposit', () =>
      writeContractAsync({
        address: saleAddress,
        abi: SALE_ABI,
        functionName: 'deposit',
        args: [amount],
      })
    );
  };

  const claimTokens = async () => {
    if (!saleAddress) return;
    return run('claimTokens', () =>
      writeContractAsync({
        address: saleAddress,
        abi: SALE_ABI,
        functionName: 'claimTokens',
      })
    );
  };

  const claimRefund = async () => {
    if (!saleAddress) return;
    return run('claimRefund', () =>
      writeContractAsync({
        address: saleAddress,
        abi: SALE_ABI,
        functionName: 'claimRefund',
      })
    );
  };

  return { approve, deposit, claimTokens, claimRefund, pendingAction };
}
