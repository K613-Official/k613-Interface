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
  userReserves(where: { user: $user }) {
    currentATokenBalance
    currentVariableDebt
    reserve { underlyingAsset decimals }
  }
}
`;

type Tx = {
  amount: string;
  reserve: { underlyingAsset: string; decimals: number };
};

type UserReserve = {
  currentATokenBalance: string;
  currentVariableDebt: string;
  reserve: { underlyingAsset: string; decimals: number };
};

export type Position = {
  /** net deposited/borrowed principal: Σ in − Σ out */
  principal: BigNumber;
  /** current balance incl. accrued interest, from the SAME subgraph snapshot */
  balance: BigNumber;
  /** accrued interest = max(0, balance − principal) */
  earned: BigNumber;
};

export type NetMap = Record<string, Position>;

const accumulate = (map: Record<string, BigNumber>, txs: Tx[], sign: 1 | -1) => {
  for (const t of txs) {
    const key = t.reserve.underlyingAsset.toLowerCase();
    const amt = new BigNumber(t.amount).shiftedBy(-t.reserve.decimals);
    map[key] = (map[key] ?? new BigNumber(0)).plus(amt.multipliedBy(sign));
  }
};

const buildMap = (
  principals: Record<string, BigNumber>,
  balances: Record<string, BigNumber>
): NetMap => {
  const map: NetMap = {};
  const keys = new Set([...Object.keys(principals), ...Object.keys(balances)]);
  for (const key of keys) {
    const principal = principals[key] ?? new BigNumber(0);
    const balance = balances[key] ?? new BigNumber(0);
    const earned = BigNumber.max(balance.minus(principal), 0);
    map[key] = { principal, balance, earned };
  }
  return map;
};

/**
 * Pure parser. Principal AND current balance are derived from the SAME
 * subgraph response, so a freshly supplied amount can never leak into
 * `earned` — it is reflected in both operands together once indexed, or in
 * neither until then. This eliminates the on-chain-vs-subgraph latency
 * mismatch that previously counted new deposits as accrued interest.
 */
export const parseNetPositions = (json: unknown): { supplied: NetMap; borrowed: NetMap } => {
  const data = (json as { data?: Record<string, unknown> } | null)?.data ?? {};
  const userReserves = (data.userReserves as UserReserve[] | undefined) ?? [];

  const suppliedPrincipal: Record<string, BigNumber> = {};
  accumulate(suppliedPrincipal, (data.supplies as Tx[] | undefined) ?? [], 1);
  accumulate(suppliedPrincipal, (data.redeems as Tx[] | undefined) ?? [], -1);

  const borrowedPrincipal: Record<string, BigNumber> = {};
  accumulate(borrowedPrincipal, (data.borrows as Tx[] | undefined) ?? [], 1);
  accumulate(borrowedPrincipal, (data.repays as Tx[] | undefined) ?? [], -1);

  const suppliedBalance: Record<string, BigNumber> = {};
  const borrowedBalance: Record<string, BigNumber> = {};
  for (const ur of userReserves) {
    const key = ur.reserve.underlyingAsset.toLowerCase();
    suppliedBalance[key] = new BigNumber(ur.currentATokenBalance).shiftedBy(-ur.reserve.decimals);
    borrowedBalance[key] = new BigNumber(ur.currentVariableDebt).shiftedBy(-ur.reserve.decimals);
  }

  return {
    supplied: buildMap(suppliedPrincipal, suppliedBalance),
    borrowed: buildMap(borrowedPrincipal, borrowedBalance),
  };
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
  return parseNetPositions(json);
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
