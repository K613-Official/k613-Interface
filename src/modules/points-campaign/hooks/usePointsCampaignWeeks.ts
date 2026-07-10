import { useMemo } from 'react';
import { type PointsCampaignConfig, pointsCampaignByChainId } from 'src/const/pointsCampaign';
import { useRootStore } from 'src/store/root';

const WEEK_MS = 7 * 86_400_000;

function startMs(config: PointsCampaignConfig): number {
  return config.CAMPAIGN_START_TS * 1000;
}

export function getCampaignStartMs(config: PointsCampaignConfig): number {
  return startMs(config);
}

export function getTotalWeeks(config: PointsCampaignConfig): number {
  return Math.max(1, config.CAMPAIGN_WEEKS);
}

export function getUnlockedWeek(config: PointsCampaignConfig, now = Date.now()): number {
  const start = startMs(config);
  if (!Number.isFinite(start) || start === 0 || now < start) return 1;
  const idx = Math.floor((now - start) / WEEK_MS) + 1;
  return Math.min(Math.max(idx, 1), getTotalWeeks(config));
}

export function getAvailableWeeks(config: PointsCampaignConfig, now = Date.now()): number[] {
  const unlocked = getUnlockedWeek(config, now);
  const weeks: number[] = [];
  for (let i = 1; i <= unlocked; i += 1) weeks.push(i);
  return weeks;
}

export function getCountdownLabel(
  config: PointsCampaignConfig,
  week: number,
  now = Date.now()
): string {
  const weekEnd = startMs(config) + week * WEEK_MS;
  const diff = Math.max(0, weekEnd - now);
  const days = Math.floor(diff / 86_400_000);
  const hours = Math.floor((diff % 86_400_000) / 3_600_000);
  const minutes = Math.floor((diff % 3_600_000) / 60_000);
  return `${days}d ${hours}h ${minutes}m`;
}

export type CampaignStatus = 'Upcoming' | 'Active' | 'Ended';

export function getCampaignStatus(config: PointsCampaignConfig, now = Date.now()): CampaignStatus {
  const start = startMs(config);
  if (!Number.isFinite(start) || start === 0) return 'Active';
  const endMs = start + getTotalWeeks(config) * WEEK_MS;
  if (now < start) return 'Upcoming';
  if (now >= endMs) return 'Ended';
  return 'Active';
}

export function getCampaignDatesLabel(config: PointsCampaignConfig): string {
  const start = startMs(config);
  if (!Number.isFinite(start) || start === 0) return '';
  const endMs = start + getTotalWeeks(config) * WEEK_MS;
  const fmt = new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    timeZone: 'UTC',
  });
  return `${fmt.format(start)} - ${fmt.format(endMs)}`;
}

export function getLastUpdatedLabel(finalizedAt?: string): string {
  if (!finalizedAt) return 'Not finalized yet';
  // Safari's Date.parse rejects space-separated datetimes ("2024-01-02 15:04");
  // normalise to the ISO "T" separator so parsing is consistent across browsers.
  const ms = Date.parse(finalizedAt.trim().replace(' ', 'T'));
  if (Number.isNaN(ms)) return 'Not finalized yet';
  const formatted = new Intl.DateTimeFormat('en-US', {
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
    timeZone: 'UTC',
  }).format(ms);
  return `Last updated ${formatted} UTC`;
}

/**
 * Resolves the active per-network campaign config from the current market.
 * Returns `null` if the current market's chain has no campaign configured.
 */
export function usePointsCampaignConfig(): PointsCampaignConfig | null {
  const chainId = useRootStore((s) => s.currentMarketData.chainId) as number | undefined;
  return useMemo(() => pointsCampaignByChainId(chainId), [chainId]);
}
