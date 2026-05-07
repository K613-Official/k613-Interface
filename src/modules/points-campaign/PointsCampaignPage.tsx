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
import { useEffect, useMemo, useRef, useState } from 'react';

import { CampaignTab, formatNumber, leaderboard, weekData, WeekNumber } from './constants';
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
  PageRoot,
  Pagination,
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

const PAGE_SIZE = 10;
const CAMPAIGN_START_UTC = Date.UTC(2026, 4, 1, 0, 0, 0);
const WEEK_MS = 7 * 24 * 60 * 60 * 1000;
const WEEKS: WeekNumber[] = [1, 2];

const tabs: { key: CampaignTab; label: string }[] = [
  { key: 'leaderboard', label: 'Leaderboard' },
  { key: 'overview', label: 'Overview' },
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

function getCountdownLabel(week: WeekNumber) {
  const now = new Date();
  const next = new Date(now);
  next.setUTCDate(now.getUTCDate() + (week === 1 ? 3 : 10));
  next.setUTCHours(0, 0, 0, 0);

  const diff = Math.max(0, next.getTime() - now.getTime());
  const days = Math.floor(diff / 86_400_000);
  const hours = Math.floor((diff % 86_400_000) / 3_600_000);
  const minutes = Math.floor((diff % 3_600_000) / 60_000);

  return `${days}d ${hours}h ${minutes}m`;
}

function getUnlockedWeek(now = new Date()): WeekNumber {
  const diff = now.getTime() - CAMPAIGN_START_UTC;

  if (diff < WEEK_MS) {
    return 1;
  }

  return 2;
}

function getLastUpdatedLabel(now = new Date()) {
  const date = new Intl.DateTimeFormat('en-US', {
    month: '2-digit',
    day: '2-digit',
    timeZone: 'UTC',
  }).format(now);

  return `Last updated ${date} 00:00 UTC`;
}

export function PointsCampaignPage() {
  const [connected, setConnected] = useState(false);
  const [status] = useState('Active');
  const [week, setWeek] = useState<WeekNumber>(1);
  const [maxUnlockedWeek, setMaxUnlockedWeek] = useState<WeekNumber>(() => getUnlockedWeek());
  const [activeTab, setActiveTab] = useState<CampaignTab>('leaderboard');
  const [page, setPage] = useState(1);
  const [emptyLeaderboard] = useState(false);
  const [countdownLabel, setCountdownLabel] = useState(() => getCountdownLabel(1));
  const [lastUpdatedLabel, setLastUpdatedLabel] = useState(() => getLastUpdatedLabel());
  const [snapshotModalOpen, setSnapshotModalOpen] = useState(false);
  const [toast, setToast] = useState<{ open: boolean; message: string }>({
    open: false,
    message: '',
  });

  const tabsShellRef = useRef<HTMLElement | null>(null);
  const totalPages = Math.ceil(leaderboard.length / PAGE_SIZE);

  const selectedWeekData = weekData[week];
  const availableWeeks = WEEKS.filter((item) => item <= maxUnlockedWeek);

  const currentRows = useMemo(() => {
    const start = (page - 1) * PAGE_SIZE;
    return leaderboard.slice(start, start + PAGE_SIZE);
  }, [page]);

  const showToast = (message: string) => {
    setToast({ open: true, message });
  };

  const handleSetTab = (tab: CampaignTab) => {
    setActiveTab(tab);
    tabsShellRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const handleToggleWallet = () => {
    setConnected((prev) => {
      const next = !prev;
      showToast(next ? 'Wallet connected' : 'Wallet disconnected');
      return next;
    });
  };

  const handleWeekChange = (event: SelectChangeEvent<unknown>) => {
    const nextWeek = Number(event.target.value) as WeekNumber;
    setWeek(nextWeek);
    setPage(1);
    showToast(`Switched to Week ${nextWeek}`);
  };

  const handleChangePage = (delta: number) => {
    setPage((prev) => Math.min(totalPages, Math.max(1, prev + delta)));
  };

  useEffect(() => {
    setCountdownLabel(getCountdownLabel(week));
    setLastUpdatedLabel(getLastUpdatedLabel());
    const intervalId = window.setInterval(() => {
      setCountdownLabel(getCountdownLabel(week));
      setMaxUnlockedWeek(getUnlockedWeek());
      setLastUpdatedLabel(getLastUpdatedLabel());
    }, 30_000);

    return () => window.clearInterval(intervalId);
  }, [week]);

  useEffect(() => {
    if (week > maxUnlockedWeek) {
      setWeek(maxUnlockedWeek);
      setPage(1);
    }
  }, [maxUnlockedWeek, week]);

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
              <PrimaryCta onClick={() => handleSetTab('leaderboard')}>View Leaderboard</PrimaryCta>
              <SecondaryCta
                onClick={() => window.open('https://galxe.com/', '_blank', 'noopener,noreferrer')}
              >
                Explore Missions
              </SecondaryCta>
              <SecondaryCta onClick={() => handleSetTab('rules')}>View Rules</SecondaryCta>
              <GhostCta onClick={() => setSnapshotModalOpen(true)}>How It Works</GhostCta>
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
              <Value sx={{ fontSize: 22 }}>May 1 - May 31</Value>
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
                <MetricsGrid>
                  <Metric>
                    <Label>Total earned</Label>
                    <MetricValue>{formatNumber(selectedWeekData.tokens)} K613S1</MetricValue>
                    <Small>Total across finalized weeks</Small>
                  </Metric>
                  <Metric>
                    <Label>Selected week earned</Label>
                    <MetricValue>{formatNumber(selectedWeekData.tokens)} K613S1</MetricValue>
                    <Small>{`Week ${week}`}</Small>
                  </Metric>
                  <Metric>
                    <Label>Rank</Label>
                    <MetricValue>#{selectedWeekData.rank}</MetricValue>
                    <Small>Selected week</Small>
                  </Metric>
                  <Metric>
                    <Label>User share</Label>
                    <MetricValue>{`${(selectedWeekData.tokens / 10000).toFixed(2)}%`}</MetricValue>
                    <Small>Share of finalized weekly distribution</Small>
                  </Metric>
                  <Metric>
                    <Label>Supply USD</Label>
                    <MetricValue>{formatNumber(selectedWeekData.supply)}</MetricValue>
                    <Small>Based on lowest eligible weekly supply balance</Small>
                  </Metric>
                  <Metric>
                    <Label>Borrow USD</Label>
                    <MetricValue>{formatNumber(selectedWeekData.borrow)}</MetricValue>
                    <Small>Based on lowest eligible weekly borrow balancee </Small>
                  </Metric>
                </MetricsGrid>
              ) : (
                <EmptyState>
                  <div>
                    <EmptyTitle>Connect wallet</EmptyTitle>
                    <EmptyDescription>
                      Leaderboard is public. Connect wallet to see your K613S1 overview for the
                      selected week.
                    </EmptyDescription>
                    <PrimaryCta onClick={handleToggleWallet}>Connect wallet</PrimaryCta>
                  </div>
                </EmptyState>
              )}
            </Card>
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

              {!emptyLeaderboard ? (
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
                          {currentRows.map((row) => (
                            <TableRow key={row.rank}>
                              <LeaderboardTableCell>
                                <Rank>{row.rank}</Rank>
                              </LeaderboardTableCell>
                              <LeaderboardTableCell>
                                <Address>
                                  <Avatar />
                                  <span>{row.address}</span>
                                </Address>
                              </LeaderboardTableCell>
                              <LeaderboardTableCell>
                                {formatNumber(row.supply)}
                              </LeaderboardTableCell>
                              <LeaderboardTableCell>
                                {formatNumber(row.borrow)}
                              </LeaderboardTableCell>
                              <LeaderboardTableCell>{`${(row.total / 10000000).toFixed(
                                2
                              )}%`}</LeaderboardTableCell>
                              <LeaderboardTableCell>
                                {formatNumber(Math.round(row.total * 0.08))}
                              </LeaderboardTableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </TableContainer>
                  </TableWrap>

                  <Pagination>
                    <GhostCta onClick={() => handleChangePage(-1)}>Previous</GhostCta>
                    <Small>{`Page ${page} of ${totalPages}`}</Small>
                    <GhostCta onClick={() => handleChangePage(1)}>Next</GhostCta>
                  </Pagination>
                </>
              ) : (
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
