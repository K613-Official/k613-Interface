import { UNISWAP_K613_USDC_POOL_URL } from 'src/const/links';

type SocialLink = {
  id: number;
  alt: string;
  href: string;
  icon: string;
  /** Optical size tweak: a solid round glyph reads heavier than an outline in the same box. */
  scale?: number;
};

export const SOCIAL_LINKS: SocialLink[] = [
  {
    id: 0,
    alt: 'uniswap',
    scale: 0.9,
    href: UNISWAP_K613_USDC_POOL_URL,
    icon: '/icons/uniswap.svg',
  },
  {
    id: 1,
    alt: 'telegram',
    scale: 0.92,
    href: 'https://t.me/K613_Official',
    icon: '/icons/telegram.svg',
  },
  {
    id: 2,
    alt: 'github',
    href: 'https://github.com/K613-Official',
    icon: '/icons/github.svg',
  },
  {
    id: 3,
    alt: 'discord',
    href: 'https://discord.gg/4mVwFWkarC',
    icon: '/icons/discord.svg',
  },
  {
    id: 4,
    alt: 'twitter-x',
    scale: 0.92,
    href: 'https://x.com/k613_official',
    icon: '/icons/twitter-x.svg',
  },
  {
    id: 5,
    alt: 'gitbook',
    scale: 0.96,
    href: 'https://docs.k613.net/',
    icon: '/icons/gitbook.svg',
  },
];
