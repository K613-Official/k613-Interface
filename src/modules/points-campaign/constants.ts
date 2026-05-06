export type CampaignTab = 'leaderboard' | 'overview' | 'rules';

export type WeekNumber = 1 | 2;

export type WeekOverview = {
  total: number;
  supply: number;
  borrow: number;
  rank: number;
  tokens: number;
};

export type LeaderboardRow = {
  rank: number;
  address: string;
  supply: number;
  borrow: number;
  social: number;
  total: number;
};

export const weekData: Record<WeekNumber, WeekOverview> = {
  1: {
    total: 128420,
    supply: 54100,
    borrow: 52800,
    rank: 7,
    tokens: 12840,
  },
  2: {
    total: 163920,
    supply: 69200,
    borrow: 64100,
    rank: 4,
    tokens: 18940,
  },
};

export const leaderboard: LeaderboardRow[] = Array.from({ length: 20 }, (_, index) => {
  const rank = index + 1;
  const supply = Math.max(18000, 92000 - index * 3270);
  const borrow = Math.max(9000, 84000 - index * 2910);
  const social = Math.max(220, 5200 - index * 190);

  return {
    rank,
    address:
      rank === 7
        ? '0x8f41d5b4c21bEFd92a9D21'
        : `0x${(rank * 771231).toString(16).padStart(8, '0')}...${(rank * 991)
            .toString(16)
            .padStart(4, '0')}`,
    supply,
    borrow,
    social,
    total: Math.round((supply + borrow + social) * (rank <= 3 ? 1.18 : 1.05)),
  };
});

const numberFormatter = new Intl.NumberFormat('en-US');

export function formatNumber(value: number): string {
  return numberFormatter.format(Math.round(value));
}
