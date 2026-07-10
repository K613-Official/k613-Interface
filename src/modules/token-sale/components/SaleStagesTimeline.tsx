import CheckIcon from '@mui/icons-material/Check';

import {
  formatDateTimeUtc,
  getCountdownLabel,
  getCurrentStage,
  getStageStatus,
  STAGE_LABELS,
  STAGE_ORDER,
} from '../constants';
import {
  Card,
  CardHead,
  CardSub,
  CardTitle,
  StageConnector,
  StageCountdown,
  StageIcon,
  StageInnerDot,
  StageMeta,
  StageName,
  StageStep,
  StagesTrack,
  StatusBadge,
} from '../tokenSale.styles';
import { SaleSchedule, SaleStageKey } from '../types';

function getStageMeta(stage: SaleStageKey, schedule: SaleSchedule): string {
  switch (stage) {
    case 'upcoming':
      return `Starts:\n${formatDateTimeUtc(schedule.saleStartMs)}`;
    case 'contribution':
      return `Ends:\n${formatDateTimeUtc(schedule.saleEndMs)}`;
    case 'closed':
      return `Starts:\n${formatDateTimeUtc(schedule.saleEndMs)}`;
    case 'finalized':
      return schedule.finalized ? 'Completed' : 'After:\nSale Close';
    case 'claim':
      return schedule.claimDeadlineMs > 0
        ? `Claims close:\n${formatDateTimeUtc(schedule.claimDeadlineMs)}`
        : 'Open after finalization';
  }
}

function getStageCountdownTarget(stage: SaleStageKey, schedule: SaleSchedule): number | null {
  switch (stage) {
    case 'upcoming':
      return schedule.saleStartMs;
    case 'contribution':
      return schedule.saleEndMs;
    case 'finalized':
      return schedule.claimStartMs || null;
    case 'claim':
      // Count down to the claim window closing.
      return schedule.claimDeadlineMs || null;
    default:
      return null;
  }
}

type SaleStagesTimelineProps = {
  schedule: SaleSchedule;
  nowMs: number | null;
};

export function SaleStagesTimeline({ schedule, nowMs }: SaleStagesTimelineProps) {
  const current = nowMs == null ? null : getCurrentStage(schedule, nowMs);

  return (
    <Card elevation={0}>
      <CardHead>
        <div>
          <CardTitle>Sale Status</CardTitle>
          <CardSub>All times are shown in UTC. Stages advance automatically.</CardSub>
        </div>
        {current && <StatusBadge label={STAGE_LABELS[current]} />}
      </CardHead>

      <StagesTrack>
        {STAGE_ORDER.map((stage, index) => {
          const status = current ? getStageStatus(stage, current) : 'pending';
          const countdownTarget = getStageCountdownTarget(stage, schedule);
          const showCountdown =
            status === 'active' && nowMs != null && countdownTarget != null && countdownTarget > 0;

          return (
            <StageStep key={stage}>
              {index < STAGE_ORDER.length - 1 && (
                <StageConnector completed={status === 'completed'} />
              )}
              <StageIcon status={status}>
                {status === 'completed' ? (
                  <CheckIcon />
                ) : (
                  <StageInnerDot active={status === 'active'} />
                )}
              </StageIcon>
              <StageName dimmed={status === 'pending'}>{STAGE_LABELS[stage]}</StageName>
              <StageMeta>{getStageMeta(stage, schedule)}</StageMeta>
              {showCountdown && (
                <StageCountdown>{getCountdownLabel(countdownTarget, nowMs)}</StageCountdown>
              )}
            </StageStep>
          );
        })}
      </StagesTrack>
    </Card>
  );
}
