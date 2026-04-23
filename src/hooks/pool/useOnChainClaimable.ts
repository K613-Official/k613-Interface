import { useQuery } from '@tanstack/react-query';
import { BigNumber, constants } from 'ethers';
import { useRootStore } from 'src/store/root';
import { MarketDataType } from 'src/ui-config/marketsConfig';
import { POLLING_INTERVAL, queryKeysFactory } from 'src/ui-config/queries';
import { useSharedDependencies } from 'src/ui-config/SharedDependenciesProvider';

export type OnChainClaimableEntry = {
  reward: string;
  symbol: string;
  decimals: number;
  amount: BigNumber;
};

export type OnChainClaimable = {
  rcAddress: string;
  tokens: string[];
  rewards: OnChainClaimableEntry[];
};

const EMPTY: OnChainClaimable = {
  rcAddress: constants.AddressZero,
  tokens: [],
  rewards: [],
};

export const useOnChainClaimable = (marketData: MarketDataType) => {
  const { uiIncentivesService } = useSharedDependencies();
  const user = useRootStore((store) => store.account);
  return useQuery<OnChainClaimable>({
    queryKey: [
      ...queryKeysFactory.userPoolReservesIncentiveDataHumanized(user, marketData),
      'onchain-claimable',
    ],
    queryFn: () => uiIncentivesService.getOnChainClaimable(marketData, user),
    enabled: !!user && !!marketData.enabledFeatures?.incentives,
    refetchInterval: POLLING_INTERVAL,
    initialData: EMPTY,
  });
};
