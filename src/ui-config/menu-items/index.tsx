import type { MessageDescriptor } from '@lingui/core';
import { msg } from '@lingui/macro';
import { ROUTES } from 'src/components/primitives/Link';

import { MarketDataType } from '../marketsConfig';

interface Navigation {
  link: string;
  title: MessageDescriptor;
  isVisible?: (data: MarketDataType) => boolean | undefined;
  dataCy?: string;
}

export const navigation: Navigation[] = [
  {
    link: ROUTES.dashboard,
    title: msg`Dashboard`,
    dataCy: 'menuDashboard',
  },
  {
    link: ROUTES.markets,
    title: msg`Markets`,
    dataCy: 'menuMarkets',
  },
  {
    link: ROUTES.stakingK613,
    title: msg`K613 Staking`,
    dataCy: 'menuStakingK613',
  },
  {
    link: ROUTES.pointsCampaign,
    title: msg`Campaign`,
    dataCy: 'menuPointsCampaign',
  },
];
