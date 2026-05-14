import { POINTS_CAMPAIGN_START_TS, POINTS_CAMPAIGN_WEEKS } from 'src/const/env';

const CAMPAIGN_START_MS = Number(POINTS_CAMPAIGN_START_TS) * 1000;
const TOTAL_WEEKS = Math.max(1, Number(POINTS_CAMPAIGN_WEEKS));
const WEEK_MS = 7 * 86_400_000;

export function getCampaignStartMs(): number {
  return CAMPAIGN_START_MS;
}

export function getTotalWeeks(): number {
  return TOTAL_WEEKS;
}

export function getUnlockedWeek(now = Date.now()): number {
  if (!Number.isFinite(CAMPAIGN_START_MS) || now < CAMPAIGN_START_MS) return 1;
  const idx = Math.floor((now - CAMPAIGN_START_MS) / WEEK_MS) + 1;
  return Math.min(Math.max(idx, 1), TOTAL_WEEKS);
}

export function getAvailableWeeks(now = Date.now()): number[] {
  const unlocked = getUnlockedWeek(now);
  const weeks: number[] = [];
  for (let i = 1; i <= unlocked; i += 1) weeks.push(i);
  return weeks;
}

export function getCountdownLabel(week: number, now = Date.now()): string {
  const weekEnd = CAMPAIGN_START_MS + week * WEEK_MS;
  const diff = Math.max(0, weekEnd - now);
  const days = Math.floor(diff / 86_400_000);
  const hours = Math.floor((diff % 86_400_000) / 3_600_000);
  const minutes = Math.floor((diff % 3_600_000) / 60_000);
  return `${days}d ${hours}h ${minutes}m`;
}

export function getLastUpdatedLabel(now = new Date()): string {
  const date = new Intl.DateTimeFormat('en-US', {
    month: '2-digit',
    day: '2-digit',
    timeZone: 'UTC',
  }).format(now);
  return `Last updated ${date} 00:00 UTC`;
}
