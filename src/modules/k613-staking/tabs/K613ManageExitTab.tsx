'use client';

import { CircularProgress } from '@mui/material';

import {
  CtaOutlined,
  ErrorText,
  ExitCellLabel,
  ExitCellValue,
  InstantPanel,
  ManageSummaryRow,
  PanelCaptionLeft,
  PanelHeading,
  PanelSection,
  QueueNotice,
  RequestRowActions,
  RequestRowCard,
  RequestRowLabel,
  RequestRowMetric,
  RequestRowValue,
  RequestsList,
  RewardRow,
  SmallActionButton,
  StatCard,
  StatInner,
  StatLabel,
  StatValue,
} from '../k613Staking.styles';
import { useK613StakingPage } from '../K613StakingContext';

export function K613ManageExitTab() {
  const {
    paused,
    exitQueue,
    totalQueuedFormatted,
    earliestUnlockRemaining,
    manageSelectedIndex,
    setManageSelectedIndex,
    selectedRow,
    selectedReceive,
    penaltyPercent,
    instantExitRequiresDistributor,
    lockDurationSeconds,
    actionPending,
    error,
    handleInstantExit,
    handleCancelExit,
    isLockDurationPassed,
    formatUnlockCountdown,
    formatExitRequestId,
    formatTokenAmount,
  } = useK613StakingPage();

  const instantBusy =
    selectedRow !== undefined && actionPending === `instant:${manageSelectedIndex}`;

  return (
    <>
      <PanelHeading>Manage Exit Requests</PanelHeading>
      <PanelCaptionLeft>
        Cancel queue requests individually or leave them active until each timer ends
      </PanelCaptionLeft>

      <ManageSummaryRow>
        <StatCard>
          <StatInner>
            <StatLabel>Total queued for exit</StatLabel>
            <StatValue>{totalQueuedFormatted} xK613</StatValue>
          </StatInner>
        </StatCard>
        <StatCard>
          <StatInner>
            <StatLabel>Active requests</StatLabel>
            <StatValue>{exitQueue.length}</StatValue>
          </StatInner>
        </StatCard>
        <StatCard>
          <StatInner>
            <StatLabel>Earliest unlock</StatLabel>
            <StatValue>{earliestUnlockRemaining}</StatValue>
          </StatInner>
        </StatCard>
      </ManageSummaryRow>

      {selectedRow && (
        <InstantPanel>
          <PanelHeading>Instant Exit</PanelHeading>
          <PanelCaptionLeft>
            Exit immediately instead of waiting for the queue timer. Fee and final received amount
            are shown before confirmation.
          </PanelCaptionLeft>
          <RewardRow>
            <ExitCellLabel>Selected amount</ExitCellLabel>
            <ExitCellValue>{formatTokenAmount(selectedRow.amount)} xK613</ExitCellValue>
          </RewardRow>
          <RewardRow>
            <ExitCellLabel>Instant exit fee</ExitCellLabel>
            <ExitCellValue>{penaltyPercent}%</ExitCellValue>
          </RewardRow>
          <RewardRow>
            <ExitCellLabel>You will receive</ExitCellLabel>
            <ExitCellValue>{selectedReceive} K613</ExitCellValue>
          </RewardRow>
          <CtaOutlined
            variant="outlined"
            disabled={paused || actionPending !== null || instantExitRequiresDistributor}
            onClick={() => handleInstantExit(BigInt(manageSelectedIndex))}
          >
            {instantBusy ? <CircularProgress color="inherit" size={22} /> : 'instant exit'}
          </CtaOutlined>
          {instantExitRequiresDistributor && (
            <QueueNotice>
              instant exit is unavailable until rewards distributor is configured
            </QueueNotice>
          )}
        </InstantPanel>
      )}

      {exitQueue.length > 0 && (
        <PanelSection>
          <PanelHeading>Requests List</PanelHeading>
          <PanelCaptionLeft>
            Every request can be canceled separately. Use the action button next to each row
          </PanelCaptionLeft>
          <RequestsList>
            {exitQueue.map((item, index) => {
              const canExit = isLockDurationPassed(item.exitInitiatedAt);
              const timer = canExit
                ? 'Ready'
                : formatUnlockCountdown(item.exitInitiatedAt, lockDurationSeconds);
              const rowCancelBusy = actionPending === `cancel:${index}`;

              return (
                <RequestRowCard
                  key={`${item.exitInitiatedAt.toString()}-${index}`}
                  selected={manageSelectedIndex === index}
                  onClick={() => setManageSelectedIndex(index)}
                >
                  <RequestRowMetric>
                    <RequestRowLabel>#</RequestRowLabel>
                    <RequestRowValue>{index + 1}</RequestRowValue>
                  </RequestRowMetric>
                  <RequestRowMetric>
                    <RequestRowLabel>Request ID</RequestRowLabel>
                    <RequestRowValue>{formatExitRequestId(index)}</RequestRowValue>
                  </RequestRowMetric>
                  <RequestRowMetric>
                    <RequestRowLabel>Amount</RequestRowLabel>
                    <RequestRowValue>{formatTokenAmount(item.amount)} xK613</RequestRowValue>
                  </RequestRowMetric>
                  <RequestRowMetric>
                    <RequestRowLabel>Timer</RequestRowLabel>
                    <RequestRowValue>{timer}</RequestRowValue>
                  </RequestRowMetric>
                  <RequestRowMetric>
                    <RequestRowLabel>Action</RequestRowLabel>
                    <RequestRowValue>{canExit ? '—' : 'Cancelable'}</RequestRowValue>
                  </RequestRowMetric>
                  <RequestRowActions>
                    {!canExit && (
                      <SmallActionButton
                        size="small"
                        variant="text"
                        disabled={paused || actionPending !== null}
                        onClick={(e) => {
                          e.stopPropagation();
                          handleCancelExit(BigInt(index));
                        }}
                      >
                        {rowCancelBusy ? (
                          <CircularProgress size={16} color="inherit" />
                        ) : (
                          'cancel exit'
                        )}
                      </SmallActionButton>
                    )}
                  </RequestRowActions>
                </RequestRowCard>
              );
            })}
          </RequestsList>
        </PanelSection>
      )}

      {error && <ErrorText>{error}</ErrorText>}
    </>
  );
}
