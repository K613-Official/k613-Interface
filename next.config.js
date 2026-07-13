// eslint-disable-next-line
const withBundleAnalyzer = require('@next/bundle-analyzer')({
  enabled: process.env.ANALYZE === 'true',
});

const pageExtensions = ['page.tsx'];
if (process.env.NEXT_PUBLIC_ENABLE_GOVERNANCE === 'true') pageExtensions.push('governance.tsx');
if (process.env.NEXT_PUBLIC_ENABLE_STAKING === 'true') pageExtensions.push('staking.tsx');

/** @type {import('next').NextConfig} */
module.exports = withBundleAnalyzer({
  reactStrictMode: true,
  // assetPrefix: "./",
  trailingSlash: true,
  pageExtensions,
  staticPageGenerationTimeout: 1000,
  webpack(config) {
    const fileLoaderRule = config.module.rules.find((rule) => rule.test?.test?.('.svg'));
    if (fileLoaderRule) {
      config.module.rules.push(
        {
          ...fileLoaderRule,
          test: /\.svg$/i,
          resourceQuery: /url/,
        },
        {
          test: /\.svg$/i,
          issuer: fileLoaderRule.issuer,
          resourceQuery: { not: [...(fileLoaderRule.resourceQuery?.not || []), /url/] },
          use: ['@svgr/webpack'],
        }
      );
      fileLoaderRule.exclude = /\.svg$/i;
    }

    // `@wagmi/connectors` is a barrel: importing it (ConnectKit does) pulls in every
    // connector, each of which requires its wallet SDK as an *optional* peer dep.
    // We connect through EIP-6963 discovery and plain `injected()`, so none of these
    // SDKs are installed — tell webpack that's intentional instead of warning about
    // nine unresolved modules on every build. Adding one of these connectors back
    // means installing its SDK and dropping it from this list.
    config.resolve.alias = {
      ...config.resolve.alias,
      '@base-org/account': false,
      '@coinbase/wallet-sdk': false,
      '@gemini-wallet/core': false,
      '@metamask/sdk': false,
      '@safe-global/safe-apps-provider': false,
      '@safe-global/safe-apps-sdk': false,
      '@walletconnect/ethereum-provider': false,
      porto: false,
      'porto/internal': false,
    };

    return config;
  },
  // NOTE: Needed for SAFE testing locally
  // async headers() {
  //   return [
  //     {
  //       source: '/manifest.json',
  //       headers: [
  //         {
  //           key: 'Access-Control-Allow-Origin',
  //           value: '*',
  //         },
  //         {
  //           key: 'Access-Control-Allow-Methods',
  //           value: 'GET',
  //         },
  //         {
  //           key: 'Access-Control-Allow-Headers',
  //           value: 'X-Requested-With, content-type, Authorization',
  //         },
  //       ],
  //     },
  //   ];
  // },
});
