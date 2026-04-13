import { Button, Typography } from '@mui/material';
import { Link, ROUTES } from 'src/components/primitives/Link';

import { PageWrapper } from './styles';

export function MarketAssetDetailsMessage({
  title,
  ctaLabel,
  ctaHref,
}: {
  title: string;
  ctaLabel: string;
  ctaHref: string;
}) {
  return (
    <PageWrapper>
      <Typography variant="h6">{title}</Typography>
      <Button
        component={Link}
        href={ctaHref}
        noLinkStyle
        variant="outlined"
        color="inherit"
        size="small"
      >
        {ctaLabel}
      </Button>
    </PageWrapper>
  );
}

export function MarketAssetDetailsMissing() {
  return (
    <MarketAssetDetailsMessage
      title="Reserve not found for this market."
      ctaLabel="Go back"
      ctaHref={ROUTES.markets}
    />
  );
}

export function MarketAssetDetailsEmptySelection() {
  return (
    <MarketAssetDetailsMessage
      title="Select an asset from the markets list."
      ctaLabel="Go to markets"
      ctaHref={ROUTES.markets}
    />
  );
}
