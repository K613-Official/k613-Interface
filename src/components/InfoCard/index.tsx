import { Typography } from '@mui/material';

import { InfoCardDesktopTable } from './components/InfoCardDesktopTable';
import { InfoCardMobileCards } from './components/InfoCardMobileCards';
import { InfoCardType } from './data';
import {
  Content,
  DesktopOnly,
  ExtraText,
  HeaderRow,
  MetricChip,
  MetricLabel,
  MetricsRow,
  MetricValue,
  Paper,
  StateText,
  TabletMobileOnly,
  TitleStack,
} from './styles';
import { useInfoCardData } from './useInfoCardData';

export default function InfoCard({ type }: { type: InfoCardType }) {
  const { data, isLoading } = useInfoCardData(type);

  return (
    <Paper>
      <HeaderRow>
        <TitleStack direction="row">
          <Typography variant="h6">{data.title}</Typography>
          {data.extra ? (
            <ExtraText variant="body2" color="text.secondary">
              {data.extra}
            </ExtraText>
          ) : null}
        </TitleStack>
      </HeaderRow>

      <Content>
        {!isLoading && data.positions.length > 0 && (
          <MetricsRow>
            {data.metrics.map((metric) => (
              <MetricChip key={`${metric.label}-${metric.value}`}>
                <MetricLabel>{metric.label}</MetricLabel>
                <MetricValue>{metric.value}</MetricValue>
              </MetricChip>
            ))}
          </MetricsRow>
        )}

        {isLoading ? (
          <StateText>Loading data...</StateText>
        ) : data.positions.length === 0 ? (
          <StateText>{data.emptyText}</StateText>
        ) : (
          <>
            <DesktopOnly>
              <InfoCardDesktopTable
                type={type}
                positions={data.positions}
                actionLabel={data.actionLabel}
              />
            </DesktopOnly>

            <TabletMobileOnly>
              <InfoCardMobileCards
                type={type}
                positions={data.positions}
                actionLabel={data.actionLabel}
              />
            </TabletMobileOnly>
          </>
        )}
      </Content>
    </Paper>
  );
}
