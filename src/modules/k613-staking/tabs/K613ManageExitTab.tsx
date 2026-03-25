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
  RewardRow,
  SmallActionButton,
  StatCard,
  StatInner,
  StatLabel,
  StatValue,
  TableRoot,
  TableWrap,
  TdCell,
  ThCell,
  TrSelectable,
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
            disabled={paused || actionPending !== null}
            onClick={() => handleInstantExit(BigInt(manageSelectedIndex))}
          >
            {instantBusy ? <CircularProgress color="inherit" size={22} /> : 'instant exit'}
          </CtaOutlined>
        </InstantPanel>
      )}

      {exitQueue.length > 0 && (
        <PanelSection>
          <PanelHeading>Requests List</PanelHeading>
          <PanelCaptionLeft>
            Every request can be canceled separately. Use the action button next to each row
          </PanelCaptionLeft>
          <TableWrap>
            <TableRoot>
              <thead>
                <tr>
                  <ThCell>#</ThCell>
                  <ThCell>Request ID</ThCell>
                  <ThCell>Amount</ThCell>
                  <ThCell>Timer</ThCell>
                  <ThCell>Action</ThCell>
                  <ThCell>Cancelable</ThCell>
                </tr>
              </thead>
              <tbody>
                {exitQueue.map((item, index) => {
                  const canExit = isLockDurationPassed(item.exitInitiatedAt);
                  const timer = canExit ? 'Ready' : formatUnlockCountdown(item.exitInitiatedAt, lockDurationSeconds);
                  const rowCancelBusy = actionPending === `cancel:${index}`;

                  return (
                    <TrSelectable
                      key={`${item.exitInitiatedAt.toString()}-${index}`}
                      selected={manageSelectedIndex === index}
                      onClick={() => setManageSelectedIndex(index)}
                    >
                      <TdCell>{index + 1}</TdCell>
                      <TdCell>{formatExitRequestId(index)}</TdCell>
                      <TdCell>{formatTokenAmount(item.amount)} xK613</TdCell>
                      <TdCell>{timer}</TdCell>
                      <TdCell>
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
                      </TdCell>
                      <TdCell>{canExit ? '—' : 'Cancelable'}</TdCell>
                    </TrSelectable>
                  );
                })}
              </tbody>
            </TableRoot>
          </TableWrap>
        </PanelSection>
      )}

      {error && <ErrorText>{error}</ErrorText>}
    </>
  );
}
