import { Skeleton } from '@mui/material';

import {
  LoadingSkeletonRow,
  PageWrapper,
  SkeletonStatValue,
  StatCell,
  StatsStrip,
  TopRows,
} from './styles';

export function MarketAssetDetailsSkeleton() {
  return (
    <PageWrapper>
      <TopRows>
        <LoadingSkeletonRow>
          <Skeleton variant="rounded" width={280} height={40} />
          <Skeleton variant="rounded" width={220} height={48} />
        </LoadingSkeletonRow>
      </TopRows>
      <StatsStrip>
        {[1, 2, 3, 4].map((i) => (
          <StatCell key={i}>
            <Skeleton width={100} height={20} />
            <SkeletonStatValue width={80} height={28} />
          </StatCell>
        ))}
      </StatsStrip>
    </PageWrapper>
  );
}
