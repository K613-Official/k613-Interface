import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Alert,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Snackbar,
  Table,
  TableBody,
  TableContainer,
  TableHead,
  TableRow,
} from '@mui/material';
import { SelectChangeEvent } from '@mui/material/Select';
import { ConnectKitButton } from 'connectkit';
import { useEffect, useMemo, useRef, useState } from 'react';
import { useAccount } from 'wagmi';

import { ClaimSection } from './ClaimSection';
import { CampaignTab, formatPoints, formatShare, formatUsd, shortenAddress } from './constants';
import { useLeaderboard } from './hooks/useLeaderboard';
import {
  getAvailableWeeks,
  getCampaignDatesLabel,
  getCampaignStatus,
  getCountdownLabel,
  getLastUpdatedLabel,
  getUnlockedWeek,
  usePointsCampaignConfig,
} from './hooks/usePointsCampaignWeeks';
import { useUserWeekStats } from './hooks/useUserWeekStats';
import {
  Address,
  Avatar,
  Card,
  CardHead,
  CardSub,
  CardTitle,
  Dot,
  EmptyDescription,
  EmptyState,
  EmptyTitle,
  Eyebrow,
  GhostCta,
  Hero,
  HeroActions,
  HeroSide,
  HeroSubtitle,
  HeroTitle,
  Label,
  LeaderboardTableCell,
  Metric,
  MetricsGrid,
  MetricValue,
  PageGroup,
  PageInput,
  PageRoot,
  Pagination,
  PointsBreakdown,
  PointsBreakdownLabel,
  PointsBreakdownRow,
  PrimaryCta,
  Rank,
  RulesStack,
  SecondaryCta,
  SectionTabButton,
  SectionTabs,
  SelectLabel,
  SelectOption,
  Small,
  StatCard,
  StatusBadge,
  TableWrap,
  Value,
  WeekRow,
  WeekSelect,
  WeekSelectControl,
} from './pointsCampaign.styles';
import { SeasonConvertSection } from './SeasonConvertSection';

const PAGE_SIZE = 10;

const tabs: { key: CampaignTab; label: string }[] = [
  { key: 'leaderboard', label: 'Leaderboard' },
  { key: 'overview', label: 'Overview' },
  { key: 'convert', label: 'Convert' },
  { key: 'rules', label: 'Rules' },
];

const rules = [
  {
    title: 'What is K613S1?',
    text: 'Season 1 rewards are tracked in K613S1. K613S1 is an accounting token used for future K613 reward conversion.',
  },
  {
    title: 'How to Earn K613S1?',
    text: 'K613S1 rewards are earned through eligible liquidity participation and ecosystem activity during Season 1.\nEligible activity may include:\n\n• Supplying assets\n• Borrowing assets\n• Sustained liquidity participation\n• Ecosystem missions\n• Community engagement\n• Galxe campaigns and contributor activity\n\nOnchain activity rewards and ecosystem/community rewards may be calculated and distributed separately during the campaign period.\nWeekly balances are finalized after each campaign period.',
  },
  {
    title: 'What activities are eligible?',
    text: 'Eligible activity includes supported supply and borrow positions, ecosystem participation, community campaigns, and approved contributor',
  },
  {
    title: 'How is K613S1 calculated?',
    text: 'K613S1 is calculated using the lowest eligible supply and borrow balances recorded during the selected campaign period, normalized to USD during weekly finalization.',
  },
  {
    title: 'Why minimum balance?',
    text: 'Using the lowest recorded eligible balance helps reward sustained liquidity participation and reduces the impact of temporary balance spikes or short-term deposits.',
  },
  {
    title: 'How does the weekly leaderboard work?',
    text: 'Each weekly update is based on eligible liquidity activity throughout the selected campaign period.\nDaily finalized balances are aggregated into weekly rankings and K613S1 distribution results.\nThe campaign is designed to reward sustained participation and reduce the impact of short-term balance changes.',
  },
  {
    title: 'When can users claim rewards?',
    text: 'K613S1 claim availability and future K613 conversion details will be announced after Season 1 finalization.',
  },
];

export function PointsCampaignPage() {
  const { address } = useAccount();
  const connected = Boolean(address);
  const campaign = usePointsCampaignConfig();

  const [status, setStatus] = useState(() => (campaign ? getCampaignStatus(campaign) : 'Active'));
  const [week, setWeek] = useState<number>(() => (campaign ? getUnlockedWeek(campaign) : 1));
  const [availableWeeks, setAvailableWeeks] = useState<number[]>(() =>
    campaign ? getAvailableWeeks(campaign) : [1]
  );
  const [activeTab, setActiveTab] = useState<CampaignTab>('leaderboard');
  const [page, setPage] = useState(1);
  const [pageInput, setPageInput] = useState('1');
  const [countdownLabel, setCountdownLabel] = useState(() =>
    campaign ? getCountdownLabel(campaign, getUnlockedWeek(campaign)) : ''
  );
  const [snapshotModalOpen, setSnapshotModalOpen] = useState(false);
  const [toast, setToast] = useState<{ open: boolean; message: string }>({
    open: false,
    message: '',
  });

  const tabsShellRef = useRef<HTMLElement | null>(null);

  const leaderboardQuery = useLeaderboard(week);
  const rows = leaderboardQuery.data?.rows ?? [];
  const leaderboardEmpty = !leaderboardQuery.isLoading && rows.length === 0;
  const totalPages = Math.max(1, Math.ceil(rows.length / PAGE_SIZE));
  const lastUpdatedLabel = getLastUpdatedLabel(leaderboardQuery.data?.finalizedAt);

  const userStats = useUserWeekStats(week, address);

  const currentRows = useMemo(() => {
    const start = (page - 1) * PAGE_SIZE;
    return rows.slice(start, start + PAGE_SIZE);
  }, [rows, page]);

  const showToast = (message: string) => {
    setToast({ open: true, message });
  };

  const handleSetTab = (tab: CampaignTab) => {
    setActiveTab(tab);
    tabsShellRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const handleWeekChange = (event: SelectChangeEvent<unknown>) => {
    const nextWeek = Number(event.target.value);
    setWeek(nextWeek);
    setPage(1);
    showToast(`Switched to Week ${nextWeek}`);
  };

  const handleChangePage = (delta: number) => {
    setPage((prev) => Math.min(totalPages, Math.max(1, prev + delta)));
  };

  const handleGoToLast = () => {
    setPage(totalPages);
  };

  const handlePageInputSubmit = () => {
    const parsed = Number(pageInput);
    if (Number.isFinite(parsed) && parsed >= 1 && parsed <= totalPages) {
      setPage(Math.floor(parsed));
    } else {
      setPageInput(String(page));
    }
  };

  useEffect(() => {
    setPageInput(String(page));
  }, [page]);

  useEffect(() => {
    if (!campaign) return;
    setCountdownLabel(getCountdownLabel(campaign, week));
    setStatus(getCampaignStatus(campaign));
    const intervalId = window.setInterval(() => {
      setCountdownLabel(getCountdownLabel(campaign, week));
      setAvailableWeeks(getAvailableWeeks(campaign));
      setStatus(getCampaignStatus(campaign));
    }, 30_000);

    return () => window.clearInterval(intervalId);
  }, [campaign, week]);

  useEffect(() => {
    if (!campaign) return;
    const maxUnlocked = getUnlockedWeek(campaign);
    if (week > maxUnlocked) {
      setWeek(maxUnlocked);
      setPage(1);
    }
  }, [campaign, availableWeeks, week]);

  return (
    <>
      <PageRoot>
        <Hero>
          <div>
            <Eyebrow>
              <Dot />
              <span>{status}</span>
            </Eyebrow>
            <HeroTitle>K613 Genesis Season 1</HeroTitle>
            <HeroSubtitle>
              Earn K613S1 through sustained liquidity participation and ecosystem contribution.
              Weekly rankings are based on eligible campaign balances.
            </HeroSubtitle>
            <HeroActions>
              <SecondaryCta onClick={() => handleSetTab('leaderboard')}>
                View Leaderboard
              </SecondaryCta>
              <SecondaryCta
                onClick={() =>
                  window.open('https://app.galxe.com/quest/K613', '_blank', 'noopener,noreferrer')
                }
              >
                Explore Missions
              </SecondaryCta>
              <SecondaryCta onClick={() => handleSetTab('convert')}>Convert to K613</SecondaryCta>
              <SecondaryCta onClick={() => handleSetTab('rules')}>View Rules</SecondaryCta>
              <SecondaryCta onClick={() => setSnapshotModalOpen(true)}>How It Works</SecondaryCta>
            </HeroActions>
          </div>

          <HeroSide>
            <StatCard elevation={0}>
              <Label>Reward token</Label>
              <Value>K613S1</Value>
              <Small>Season 1 rewards are tracked in K613S1</Small>
            </StatCard>
            <StatCard elevation={0}>
              <Label>Season 1 dates</Label>
              <Value sx={{ fontSize: 22 }}>{campaign ? getCampaignDatesLabel(campaign) : ''}</Value>
              <Small>Weekly results are finalized after each period</Small>
            </StatCard>
            <StatCard elevation={0}>
              <Label>Next update</Label>
              <Value sx={{ fontSize: 22 }}>{countdownLabel}</Value>
              <Small>Balances are updated after the next weekly snapshot</Small>
            </StatCard>
          </HeroSide>
        </Hero>

        <WeekRow elevation={0}>
          <div>
            <Label>Week</Label>
            <Small>Choose the campaign week you want to view.</Small>
          </div>

          <WeekSelectControl size="small">
            <SelectLabel id="points-week-select-label">Week</SelectLabel>
            <WeekSelect
              labelId="points-week-select-label"
              value={String(week)}
              onChange={handleWeekChange}
            >
              {availableWeeks.map((availableWeek) => (
                <SelectOption key={availableWeek} value={availableWeek}>
                  {`Week ${availableWeek}`}
                </SelectOption>
              ))}
            </WeekSelect>
          </WeekSelectControl>
        </WeekRow>

        <SectionTabs aria-label="K613S1 season tabs">
          {tabs.map((tab) => (
            <SectionTabButton
              key={tab.key}
              type="button"
              active={activeTab === tab.key}
              onClick={() => handleSetTab(tab.key)}
            >
              {tab.label}
            </SectionTabButton>
          ))}
        </SectionTabs>

        <section ref={tabsShellRef}>
          {activeTab === 'overview' && (
            <>
              <Card elevation={0}>
                <CardHead>
                  <div>
                    <CardTitle>{`Your Week ${week} overview`}</CardTitle>
                    <CardSub>
                      {connected
                        ? `Your Week ${week} K613S1 summary.`
                        : 'Connect wallet to view your K613S1 balance for the selected week.'}
                    </CardSub>
                  </div>
                  {!connected && <StatusBadge color="warning" label="Wallet not connected" />}
                </CardHead>

                {connected ? (
                  userStats.isLoading ? (
                    <EmptyState>
                      <div>
                        <EmptyTitle>Loading…</EmptyTitle>
                        <EmptyDescription>Fetching weekly snapshot.</EmptyDescription>
                      </div>
                    </EmptyState>
                  ) : userStats.data ? (
                    <MetricsGrid>
                      <Metric>
                        <Label>Total earned</Label>
                        <MetricValue>
                          {formatPoints(userStats.data.cumulativePoints)} K613S1
                        </MetricValue>
                        <Small>Total across finalized weeks</Small>
                      </Metric>
                      <Metric>
                        <Label>Selected week earned</Label>
                        <MetricValue>
                          {formatPoints(userStats.data.weeklyPoints)} K613S1
                        </MetricValue>
                        <Small>{`Week ${week}`}</Small>
                      </Metric>
                      <Metric>
                        <Label>Rank</Label>
                        <MetricValue>#{userStats.data.rank}</MetricValue>
                        <Small>Selected week</Small>
                      </Metric>
                      <Metric>
                        <Label>User share</Label>
                        <MetricValue>{formatShare(userStats.data.share)}</MetricValue>
                        <Small>Share of finalized weekly distribution</Small>
                      </Metric>
                      <Metric>
                        <Label>Supply USD</Label>
                        <MetricValue>{formatUsd(userStats.data.minSupplyUsd)}</MetricValue>
                        <Small>Based on lowest eligible weekly supply balance</Small>
                      </Metric>
                      <Metric>
                        <Label>Borrow USD</Label>
                        <MetricValue>{formatUsd(userStats.data.minBorrowUsd)}</MetricValue>
                        <Small>Based on lowest eligible weekly borrow balance</Small>
                      </Metric>
                    </MetricsGrid>
                  ) : (
                    <EmptyState>
                      <div>
                        <EmptyTitle>No activity this week</EmptyTitle>
                        <EmptyDescription>
                          Your address is not in the Week {week} snapshot. Participate to appear on
                          the leaderboard.
                        </EmptyDescription>
                        <PrimaryCta onClick={() => handleSetTab('rules')}>How it works</PrimaryCta>
                      </div>
                    </EmptyState>
                  )
                ) : (
                  <EmptyState>
                    <div>
                      <EmptyTitle>Connect wallet</EmptyTitle>
                      <EmptyDescription>
                        Leaderboard is public. Connect wallet to see your K613S1 overview for the
                        selected week.
                      </EmptyDescription>
                      <ConnectKitButton.Custom>
                        {({ show }) => (
                          <PrimaryCta onClick={() => show && show()}>Connect wallet</PrimaryCta>
                        )}
                      </ConnectKitButton.Custom>
                    </div>
                  </EmptyState>
                )}
              </Card>
              <ClaimSection />
            </>
          )}

          {activeTab === 'leaderboard' && (
            <Card elevation={0}>
              <CardHead>
                <div>
                  <CardTitle>Leaderboard</CardTitle>
                  <CardSub>Season 1 weekly K613S1 balances.</CardSub>
                </div>
                <StatusBadge label={lastUpdatedLabel} />
              </CardHead>

              {leaderboardQuery.isError && (
                <Alert severity="error" sx={{ mb: 2 }}>
                  Failed to load leaderboard.{' '}
                  <button
                    type="button"
                    onClick={() => leaderboardQuery.refetch()}
                    style={{ textDecoration: 'underline', cursor: 'pointer' }}
                  >
                    Retry
                  </button>
                </Alert>
              )}

              {!leaderboardEmpty && !leaderboardQuery.isError ? (
                <>
                  <TableWrap>
                    <TableContainer>
                      <Table sx={{ minWidth: { xs: 720, md: 'auto' } }}>
                        <TableHead>
                          <TableRow>
                            <LeaderboardTableCell>Rank</LeaderboardTableCell>
                            <LeaderboardTableCell>Address</LeaderboardTableCell>
                            <LeaderboardTableCell>Min Supply USD</LeaderboardTableCell>
                            <LeaderboardTableCell>Min Borrow USD</LeaderboardTableCell>
                            <LeaderboardTableCell>Share</LeaderboardTableCell>
                            <LeaderboardTableCell>K613S1</LeaderboardTableCell>
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {currentRows.map((row) => {
                            const total = leaderboardQuery.data?.totalPoints ?? 0n;
                            const share =
                              total > 0n
                                ? Number((row.weeklyPoints * 10_000n) / total) / 10_000
                                : 0;
                            const isGalxeOnly = row.minSupplyUsd === 0n && row.minBorrowUsd === 0n;
                            const galxePoints = isGalxeOnly ? row.weeklyPoints : 0n;
                            const onchainPoints = isGalxeOnly ? 0n : row.weeklyPoints;
                            return (
                              <TableRow key={`${row.rank}-${row.address}`}>
                                <LeaderboardTableCell>
                                  <Rank>{row.rank}</Rank>
                                </LeaderboardTableCell>
                                <LeaderboardTableCell>
                                  <Address>
                                    <Avatar />
                                    <span>{shortenAddress(row.address)}</span>
                                  </Address>
                                </LeaderboardTableCell>
                                <LeaderboardTableCell>
                                  {formatUsd(row.minSupplyUsd)}
                                </LeaderboardTableCell>
                                <LeaderboardTableCell>
                                  {formatUsd(row.minBorrowUsd)}
                                </LeaderboardTableCell>
                                <LeaderboardTableCell>{formatShare(share)}</LeaderboardTableCell>
                                <LeaderboardTableCell>
                                  <PointsBreakdown>
                                    <div>{formatPoints(row.weeklyPoints)}</div>
                                    <PointsBreakdownRow>
                                      <PointsBreakdownLabel>onchain</PointsBreakdownLabel>
                                      <span>{formatPoints(onchainPoints)}</span>
                                    </PointsBreakdownRow>
                                    <PointsBreakdownRow>
                                      <PointsBreakdownLabel>galxe</PointsBreakdownLabel>
                                      <span>{formatPoints(galxePoints)}</span>
                                    </PointsBreakdownRow>
                                  </PointsBreakdown>
                                </LeaderboardTableCell>
                              </TableRow>
                            );
                          })}
                        </TableBody>
                      </Table>
                    </TableContainer>
                  </TableWrap>

                  <Pagination>
                    <GhostCta onClick={() => handleChangePage(-1)} disabled={page === 1}>
                      Previous
                    </GhostCta>
                    <PageGroup>
                      <Small>Page</Small>
                      <PageInput
                        type="number"
                        min={1}
                        max={totalPages}
                        value={pageInput}
                        onChange={(event) => setPageInput(event.target.value)}
                        onFocus={(event) => event.target.select()}
                        onKeyDown={(event) => {
                          if (event.key === 'Enter') {
                            (event.target as HTMLInputElement).blur();
                          }
                        }}
                        onBlur={handlePageInputSubmit}
                      />
                      <Small>{`of ${totalPages}`}</Small>
                    </PageGroup>
                    <PageGroup>
                      <GhostCta onClick={() => handleChangePage(1)} disabled={page === totalPages}>
                        Next
                      </GhostCta>
                      <GhostCta onClick={handleGoToLast} disabled={page === totalPages}>
                        Last
                      </GhostCta>
                    </PageGroup>
                  </Pagination>
                </>
              ) : leaderboardQuery.isError ? null : (
                <EmptyState>
                  <div>
                    <EmptyTitle>No data yet</EmptyTitle>
                    <EmptyDescription>
                      Leaderboard will appear when weekly results are finalized.
                    </EmptyDescription>
                    <PrimaryCta onClick={() => handleSetTab('rules')}>How it works</PrimaryCta>
                  </div>
                </EmptyState>
              )}
            </Card>
          )}

          {activeTab === 'convert' && <SeasonConvertSection />}

          {activeTab === 'rules' && (
            <Card elevation={0}>
              <CardHead>
                <div>
                  <CardTitle>Rules & FAQ</CardTitle>
                  <CardSub>How Season 1 K613S1 balances are calculated.</CardSub>
                </div>
              </CardHead>

              <RulesStack>
                {rules.map((rule, index) => (
                  <Accordion
                    key={rule.title}
                    disableGutters
                    defaultExpanded={index === 0}
                    sx={{
                      border: '1px solid rgba(255, 255, 255, 0.1)',
                      borderRadius: '4px !important',
                      background: 'rgba(255, 255, 255, 0.04)',
                      '&:before': { display: 'none' },
                    }}
                  >
                    <AccordionSummary
                      expandIcon={<ExpandMoreIcon />}
                      sx={{
                        fontWeight: 500,
                        '& .MuiAccordionSummary-content': {
                          margin: '8px 0',
                        },
                      }}
                    >
                      {rule.title}
                    </AccordionSummary>
                    <AccordionDetails
                      sx={{ color: '#bdbdbd', lineHeight: 1.55, whiteSpace: 'pre-line' }}
                    >
                      {rule.text}
                    </AccordionDetails>
                  </Accordion>
                ))}
              </RulesStack>
            </Card>
          )}
        </section>
      </PageRoot>

      <Dialog
        open={snapshotModalOpen}
        onClose={() => setSnapshotModalOpen(false)}
        fullWidth
        maxWidth="sm"
      >
        <DialogTitle>How it works</DialogTitle>
        <DialogContent>
          Each weekly update is based on the lowest eligible supply and borrow balances recorded
          during the selected campaign period. This approach rewards sustained liquidity
          participation and reduces the impact of temporary balance spikes or short-term deposits.
          Final weekly rankings and K613S1 allocations are calculated from these finalized balances.
        </DialogContent>
        <DialogActions>
          <PrimaryCta onClick={() => setSnapshotModalOpen(false)}>Close</PrimaryCta>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={toast.open}
        onClose={() => setToast((prev) => ({ ...prev, open: false }))}
        autoHideDuration={2200}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert
          onClose={() => setToast((prev) => ({ ...prev, open: false }))}
          severity="success"
          variant="filled"
          sx={{ width: '100%' }}
        >
          {toast.message}
        </Alert>
      </Snackbar>
    </>
  );
}
