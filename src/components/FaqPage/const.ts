import { UNISWAP_K613_USDC_POOL_URL } from 'src/const/links';

export type FaqLink = {
  label: string;
  href: string;
};

export type FaqItem = {
  question: string;
  answer: string;
  links?: FaqLink[];
};

export type FaqCategory = {
  key: string;
  title: string;
  items: FaqItem[];
};

export const faqSectionDomId = (categoryKey: string) => `faq-section-${categoryKey}`;

export const FAQ_CATEGORIES: FaqCategory[] = [
  {
    key: 'general',
    title: 'GENERAL',
    items: [
      {
        question: 'What is K613?',
        answer:
          'K613 is a modern lending protocol designed for simplicity and efficiency. The platform offers an intuitive interface, low fees, and a wide selection of tokens for supplying and borrowing.',
      },
      {
        question: 'Is it safe?',
        answer:
          'Security is built around audited smart contracts, transparent risk parameters, and ongoing monitoring. As with any DeFi product, you should still manage your own risk and position size.',
      },
      {
        question: 'Do I need to pass KYC?',
        answer:
          'KYC requirements depend on your jurisdiction and the services you use. For standard on-chain interaction with the protocol, a connected wallet is typically enough.',
      },
      {
        question: 'How do I get started?',
        answer:
          'Connect your wallet, choose a market, and either supply assets to earn yield or use supplied collateral to borrow. Start small to understand rates and liquidation parameters.',
      },
    ],
  },
  {
    key: 'supplying',
    title: 'SUPPLYING',
    items: [
      {
        question: 'How do I supply assets?',
        answer:
          'Open the market, pick an asset from the supply list, enter the amount, and confirm the transaction in your wallet. Once mined, your supplied balance appears on the dashboard.',
      },
      {
        question: 'Are there limits on supplying assets?',
        answer:
          'Each asset has its own caps and risk configuration. If a cap is reached, additional supplying for that reserve may be temporarily unavailable until governance updates parameters.',
      },
      {
        question: 'Where are my supplied tokens stored?',
        answer:
          'Your funds are held by the protocol smart contracts. In return, you receive position tokens that represent your claim and accrue yield over time.',
      },
      {
        question: 'Can I opt out of using my asset as collateral?',
        answer:
          'Yes. You can disable collateral usage per asset when your health factor remains safe. This controls borrowing power and liquidation exposure.',
      },
    ],
  },
  {
    key: 'withdrawing',
    title: 'WITHDRAWING',
    items: [
      {
        question: 'How do I withdraw my assets?',
        answer:
          'Go to your supplied positions, click withdraw, choose an amount, and confirm in your wallet. If the reserve has enough liquidity and your position remains healthy, withdrawal completes immediately.',
      },
    ],
  },
  {
    key: 'borrowing',
    title: 'BORROWING',
    items: [
      {
        question: 'How do I borrow?',
        answer:
          'Enable collateral on supplied assets, choose a borrowable reserve, set the amount, and confirm the borrow transaction. Your borrowing capacity depends on collateral value and risk settings.',
      },
      {
        question: 'How do I repay my borrow?',
        answer:
          'Open the borrowed position, click repay, select partial or full repayment, and approve/confirm in your wallet. Your debt balance is updated once the transaction is mined.',
      },
      {
        question: 'When do I need to repay?',
        answer:
          'There is no fixed maturity date for most variable-rate loans, but interest accrues continuously. Keep your health factor above liquidation threshold by repaying or adding collateral.',
      },
      {
        question: 'How much interest will I pay?',
        answer:
          'Interest depends on the reserve utilization and selected rate mode. Current rates are shown in the UI and can change over time with market conditions.',
      },
    ],
  },
  {
    key: 'token-liquidity',
    title: 'TOKEN & LIQUIDITY',
    items: [
      {
        question: 'Where can I trade K613?',
        answer:
          'K613 trades against USDC on Uniswap on Monad, in the 0.05% fee pool. Always open the pool from an official K613 link and verify the token address 0xb09582631336068d4B0089d943f40CbF46dE5189 before swapping.',
        links: [
          {
            label: 'K613 / USDC pool on Uniswap',
            href: UNISWAP_K613_USDC_POOL_URL,
          },
        ],
      },
      {
        question: 'Where did the initial liquidity come from?',
        answer:
          '100% of the funds raised during the Token Sale were added to the K613/USDC pool as liquidity. Nothing was withheld from the raise.',
      },
      {
        question: 'Is the liquidity locked?',
        answer:
          'Yes. The LP position is held by a timelock contract and cannot be withdrawn before 29 July 2027 (UTC) — a one-year lock from the day liquidity was added. The unlock timestamp is stored on-chain and anyone can verify it by reading unlockTime() on the lock contract.',
        links: [
          {
            label: 'LP timelock contract on Monad Explorer',
            href: 'https://monadexplorer.com/address/0xbDB83DF26F8e554bd20754df3Dde7cab958956D5',
          },
          {
            label: 'Pool contract on Monad Explorer',
            href: 'https://monadexplorer.com/address/0xDD5557CEcFD7Ba0F5F2A1C38967d83Df2951a4F4',
          },
        ],
      },
    ],
  },
  {
    key: 'risk-liquidation',
    title: 'RISK & LIQUIDATION',
    items: [
      {
        question: 'What is Health Factor?',
        answer:
          'Health factor is a safety score of your account. It is based on collateral value, debt value, and liquidation thresholds. Higher values mean lower liquidation risk.',
      },
      {
        question: 'What happens if my Health Factor drops?',
        answer:
          'If health factor approaches 1, your account becomes risky. You can improve it by repaying debt, adding collateral, or closing part of your position.',
      },
      {
        question: 'What are liquidations?',
        answer:
          'Liquidations are automated actions that repay part of risky debt using your collateral when health factor falls below threshold. This protects protocol solvency.',
      },
      {
        question: 'How can I avoid liquidation?',
        answer:
          'Maintain a healthy collateral buffer, monitor volatility, avoid excessive leverage, and react quickly when your health factor declines.',
      },
    ],
  },
];
