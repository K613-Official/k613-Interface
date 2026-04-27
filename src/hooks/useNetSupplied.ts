import { useQuery } from '@tanstack/react-query';
import { BigNumber } from 'bignumber.js';
import { useRootStore } from 'src/store/root';
import { useShallow } from 'zustand/shallow';

const NET_SUPPLIED_QUERY = `
query NetSupplied($user: String!) {
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
}
`;

type Tx = {
  amount: string;
  reserve: { underlyingAsset: string; decimals: number };
};

export type NetSuppliedMap = Record<string, BigNumber>;

const fetchNetSupplied = async (subgraphUrl: string, user: string): Promise<NetSuppliedMap> => {
  const res = await fetch(subgraphUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      query: NET_SUPPLIED_QUERY,
      variables: { user: user.toLowerCase() },
    }),
  });
  const json = await res.json();
  const supplies: Tx[] = json?.data?.supplies ?? [];
  const redeems: Tx[] = json?.data?.redeems ?? [];

  const map: NetSuppliedMap = {};
  for (const s of supplies) {
    const key = s.reserve.underlyingAsset.toLowerCase();
    const amt = new BigNumber(s.amount).shiftedBy(-s.reserve.decimals);
    map[key] = (map[key] ?? new BigNumber(0)).plus(amt);
  }
  for (const r of redeems) {
    const key = r.reserve.underlyingAsset.toLowerCase();
    const amt = new BigNumber(r.amount).shiftedBy(-r.reserve.decimals);
    map[key] = (map[key] ?? new BigNumber(0)).minus(amt);
  }
  return map;
};

export const useNetSupplied = () => {
  const [account, currentMarketData] = useRootStore(
    useShallow((s) => [s.account, s.currentMarketData])
  );
  const subgraphUrl = currentMarketData.subgraphUrl ?? '';

  return useQuery({
    queryKey: ['netSupplied', subgraphUrl, account],
    queryFn: () => fetchNetSupplied(subgraphUrl, account),
    enabled: !!account && !!subgraphUrl,
    staleTime: 30_000,
  });
};
