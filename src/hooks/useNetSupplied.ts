import { useQuery } from '@tanstack/react-query';
import { BigNumber } from 'bignumber.js';
import { useRootStore } from 'src/store/root';
import { useShallow } from 'zustand/shallow';

const NET_POSITIONS_QUERY = `
query NetPositions($user: String!) {
  supplies: userTransactions(
    where: { user: $user, action: Supply }
    first: 1000
    orderBy: timestamp
    orderDirection: asc
  ) {
    ... on Supply {
      amount
      reserve { underlyingAsset decimals }
    }
  }
  redeems: userTransactions(
    where: { user: $user, action: RedeemUnderlying }
    first: 1000
    orderBy: timestamp
    orderDirection: asc
  ) {
    ... on RedeemUnderlying {
      amount
      reserve { underlyingAsset decimals }
    }
  }
  borrows: userTransactions(
    where: { user: $user, action: Borrow }
    first: 1000
    orderBy: timestamp
    orderDirection: asc
  ) {
    ... on Borrow {
      amount
      reserve { underlyingAsset decimals }
    }
  }
  repays: userTransactions(
    where: { user: $user, action: Repay }
    first: 1000
    orderBy: timestamp
    orderDirection: asc
  ) {
    ... on Repay {
      amount
      reserve { underlyingAsset decimals }
    }
  }
}
`;

type Tx = {
  amount: string;
  reserve: { underlyingAsset: string; decimals: number };
};

export type NetMap = Record<string, BigNumber>;

const accumulate = (map: NetMap, txs: Tx[], sign: 1 | -1) => {
  for (const t of txs) {
    const key = t.reserve.underlyingAsset.toLowerCase();
    const amt = new BigNumber(t.amount).shiftedBy(-t.reserve.decimals);
    map[key] = (map[key] ?? new BigNumber(0)).plus(amt.multipliedBy(sign));
  }
};

const fetchNetPositions = async (
  subgraphUrl: string,
  user: string
): Promise<{ supplied: NetMap; borrowed: NetMap }> => {
  const res = await fetch(subgraphUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      query: NET_POSITIONS_QUERY,
      variables: { user: user.toLowerCase() },
    }),
  });
  const json = await res.json();

  const supplied: NetMap = {};
  accumulate(supplied, json?.data?.supplies ?? [], 1);
  accumulate(supplied, json?.data?.redeems ?? [], -1);

  const borrowed: NetMap = {};
  accumulate(borrowed, json?.data?.borrows ?? [], 1);
  accumulate(borrowed, json?.data?.repays ?? [], -1);

  return { supplied, borrowed };
};

const useNetPositions = () => {
  const [account, currentMarketData] = useRootStore(
    useShallow((s) => [s.account, s.currentMarketData])
  );
  const subgraphUrl = currentMarketData.subgraphUrl ?? '';

  return useQuery({
    queryKey: ['netPositions', subgraphUrl, account],
    queryFn: () => fetchNetPositions(subgraphUrl, account),
    enabled: !!account && !!subgraphUrl,
    staleTime: 30_000,
  });
};

export const useNetSupplied = () => {
  const q = useNetPositions();
  return { ...q, data: q.data?.supplied };
};

export const useNetBorrowed = () => {
  const q = useNetPositions();
  return { ...q, data: q.data?.borrowed };
};
