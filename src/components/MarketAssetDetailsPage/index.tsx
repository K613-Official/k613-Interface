import { useRouter } from 'next/router';
import { useMemo } from 'react';
import Layout from 'src/components/Layout';
import MaxWidthContainer from 'src/components/MaxWidthContainer';
import { useAppDataContext } from 'src/hooks/app-data-provider/useAppDataProvider';
import { AssetCapsProvider } from 'src/hooks/useAssetCaps';

import { MarketAssetDetailsBody } from './MarketAssetDetailsBody';
import {
  MarketAssetDetailsEmptySelection,
  MarketAssetDetailsMissing,
} from './MarketAssetDetailsMessage';
import { MarketAssetDetailsSkeleton } from './MarketAssetDetailsSkeleton';

export default function MarketAssetDetailsPage() {
  const router = useRouter();
  const underlying = router.query.underlyingAsset as string | undefined;
  const { reserves, loading } = useAppDataContext();

  const reserve = useMemo(() => {
    if (!underlying) {
      return undefined;
    }
    const key = underlying.toLowerCase();
    return reserves.find((r) => r.underlyingAsset.toLowerCase() === key);
  }, [reserves, underlying]);

  const showLoading = !router.isReady || (loading && !reserve);
  const showMissing = router.isReady && !loading && !!underlying && !reserve;

  return (
    <Layout>
      <MaxWidthContainer>
        {showLoading ? (
          <MarketAssetDetailsSkeleton />
        ) : showMissing ? (
          <MarketAssetDetailsMissing />
        ) : reserve ? (
          <AssetCapsProvider asset={reserve}>
            <MarketAssetDetailsBody reserve={reserve} />
          </AssetCapsProvider>
        ) : (
          <MarketAssetDetailsEmptySelection />
        )}
      </MaxWidthContainer>
    </Layout>
  );
}
