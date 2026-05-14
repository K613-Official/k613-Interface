import { POINTS_SNAPSHOTS_BASE_URL } from 'src/const/env';

import type { LeaderboardSnapshot, UserProof } from '../types';

class HttpError extends Error {
  constructor(public status: number, message: string) {
    super(message);
    this.name = 'HttpError';
  }
}

function toBigInt(value: unknown, field: string): bigint {
  if (typeof value !== 'string' && typeof value !== 'number') {
    throw new Error(`Invalid ${field}: expected string|number, got ${typeof value}`);
  }
  try {
    return BigInt(value);
  } catch (err) {
    throw new Error(`Invalid ${field} bigint: ${String(value)}`);
  }
}

function parseLeaderboard(json: unknown): LeaderboardSnapshot {
  if (!json || typeof json !== 'object') throw new Error('Invalid leaderboard payload');
  const obj = json as Record<string, unknown>;
  const rawRows = obj.rows;
  if (!Array.isArray(rawRows)) throw new Error('Invalid leaderboard.rows');

  return {
    week: Number(obj.week),
    weekStart: Number(obj.weekStart),
    weekEnd: Number(obj.weekEnd),
    finalizedAt: String(obj.finalizedAt ?? ''),
    totalPoints: toBigInt(obj.totalPoints, 'totalPoints'),
    rows: rawRows.map((raw, idx) => {
      if (!raw || typeof raw !== 'object') {
        throw new Error(`Invalid leaderboard row[${idx}]`);
      }
      const row = raw as Record<string, unknown>;
      return {
        rank: Number(row.rank),
        address: String(row.address).toLowerCase(),
        minSupplyUsd: toBigInt(row.minSupplyUsd, `rows[${idx}].minSupplyUsd`),
        minBorrowUsd: toBigInt(row.minBorrowUsd, `rows[${idx}].minBorrowUsd`),
        weeklyPoints: toBigInt(row.weeklyPoints, `rows[${idx}].weeklyPoints`),
        cumulativePoints: toBigInt(row.cumulativePoints, `rows[${idx}].cumulativePoints`),
      };
    }),
  };
}

function parseProof(json: unknown): UserProof {
  if (!json || typeof json !== 'object') throw new Error('Invalid proof payload');
  const obj = json as Record<string, unknown>;
  if (!Array.isArray(obj.proof)) throw new Error('Invalid proof.proof');
  return {
    address: String(obj.address).toLowerCase(),
    amount: toBigInt(obj.amount, 'amount'),
    proof: obj.proof.map((p) => String(p) as `0x${string}`),
    root: String(obj.root) as `0x${string}`,
  };
}

async function fetchJson(url: string): Promise<unknown | null> {
  const res = await fetch(url, { cache: 'no-store' });
  if (res.status === 404) return null;
  if (!res.ok) {
    throw new HttpError(res.status, `GET ${url} failed: ${res.status}`);
  }
  return res.json();
}

export async function fetchLeaderboard(week: number): Promise<LeaderboardSnapshot | null> {
  const url = `${POINTS_SNAPSHOTS_BASE_URL}/week-${week}/leaderboard.json`;
  const json = await fetchJson(url);
  if (json === null) return null;
  return parseLeaderboard(json);
}

export async function fetchUserProof(week: number, address: string): Promise<UserProof | null> {
  const normalized = address.toLowerCase().replace(/^0x/, '');
  const url = `${POINTS_SNAPSHOTS_BASE_URL}/week-${week}/proofs/${normalized}.json`;
  const json = await fetchJson(url);
  if (json === null) return null;
  return parseProof(json);
}
