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

const tabs: { key: CampaignTab; label: string }[] = [
  { key: 'leaderboard', label: 'Leaderboard' },
  { key: 'overview', label: 'Overview' },
  { key: 'rules', label: 'Rules' },
];

const rules = [
  {
    title: 'How is K613S1 calculated?',
    text: 'K613S1 is calculated once per week. The main input is your minimum eligible balance during the week, normalized to USD at the weekly update.',
  },
  {
    title: 'Why minimum balance?',
    text: 'Minimum balance rewards liquidity that stayed in the protocol during the week. A short deposit right before the update does not meaningfully increase K613S1.',
  },
  {
    title: 'What token is distributed?',
    text: 'Season 1 uses K613S1. K613S1 is not K613 and does not represent a claimable K613 balance on this page.',
  },
  {
    title: 'When can users claim?',
    text: 'Claiming is not available yet. If a claim flow is added later, it will use finalized Season 1 balances.',
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

export function PointsCampaignPage() {
  const [connected, setConnected] = useState(false);
  const [status] = useState('Active');
  const [week, setWeek] = useState<WeekNumber>(1);
  const [activeTab, setActiveTab] = useState<CampaignTab>('leaderboard');
  const [page, setPage] = useState(1);
  const [emptyLeaderboard] = useState(false);
  const [countdownLabel, setCountdownLabel] = useState(() => getCountdownLabel(1));
  const [snapshotModalOpen, setSnapshotModalOpen] = useState(false);
  const [toast, setToast] = useState<{ open: boolean; message: string }>({
    open: false,
    message: '',
  });

  const tabsShellRef = useRef<HTMLElement | null>(null);
  const totalPages = Math.ceil(leaderboard.length / PAGE_SIZE);

  const selectedWeekData = weekData[week];

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
    const intervalId = window.setInterval(() => {
      setCountdownLabel(getCountdownLabel(week));
    }, 30_000);

    return () => window.clearInterval(intervalId);
  }, [week]);

  return (
    <>
      <PageRoot>
        <Hero>
          <div>
            <Eyebrow>
              <Dot />
              <span>{status}</span>
            </Eyebrow>
            <HeroTitle>K613S1 Campaign Season 1</HeroTitle>
            <HeroSubtitle>
              Earn K613S1 through weekly liquidity snapshots and ecosystem contribution. Weekly
              results are shown after each snapshot is finalized.
            </HeroSubtitle>
            <HeroActions>
              <PrimaryCta onClick={() => handleSetTab('leaderboard')}>View leaderboard</PrimaryCta>
              <SecondaryCta onClick={() => handleSetTab('rules')}>View rules</SecondaryCta>
              <GhostCta onClick={() => setSnapshotModalOpen(true)}>How it works</GhostCta>
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
            <Small>Choose the weekly results you want to view.</Small>
          </div>

          <WeekSelectControl size="small">
            <SelectLabel id="points-week-select-label">Week</SelectLabel>
            <WeekSelect
              labelId="points-week-select-label"
              value={String(week)}
              onChange={handleWeekChange}
            >
              <SelectOption value={1}>Week 1</SelectOption>
              <SelectOption value={2}>Week 2</SelectOption>
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
                    <Label>Supply USD</Label>
                    <MetricValue>{formatNumber(selectedWeekData.supply)}</MetricValue>
                    <Small>Based on minimum weekly balance</Small>
                  </Metric>
                  <Metric>
                    <Label>Borrow USD</Label>
                    <MetricValue>{formatNumber(selectedWeekData.borrow)}</MetricValue>
                    <Small>Based on minimum weekly borrow</Small>
                  </Metric>
                  <Metric>
                    <Label>User share</Label>
                    <MetricValue>{`${(selectedWeekData.tokens / 10000).toFixed(2)}%`}</MetricValue>
                    <Small>Share of selected weekly allocation</Small>
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
                <StatusBadge label="Last updated 00:00 UTC" />
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
                    <AccordionDetails sx={{ color: '#bdbdbd', lineHeight: 1.55 }}>
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
        <DialogTitle>Weekly snapshot</DialogTitle>
        <DialogContent>
          Each weekly update uses the minimum eligible supply and borrow balances for the selected
          period. This helps reward stable liquidity instead of last-minute deposits.
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
