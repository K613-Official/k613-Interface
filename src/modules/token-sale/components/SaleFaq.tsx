import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { Accordion, AccordionDetails, AccordionSummary } from '@mui/material';

import { Card, CardHead, CardSub, CardTitle, FaqStack } from '../tokenSale.styles';

const faq = [
  {
    title: 'What happens if the sale is oversubscribed?',
    text: 'If total deposits exceed the $100,000 hard cap, every participant receives a pro-rata share of the 10,000,000 K613 allocation.\n\nUser Allocation = User Deposit / Total Deposits × 10,000,000 K613\n\nOnly the funds backing your final allocation are used (at $0.01 per K613). The unused portion of your deposit becomes a refund, which can be claimed to the same wallet after finalization.',
  },
  {
    title: 'When can I claim K613?',
    text: 'Claiming opens after the contribution window closes and allocations are finalized on-chain. Tokens are 100% unlocked at claim, with no vesting.\n\nUntil the sale is finalized, no tokens are distributed and all allocation figures shown are estimates.',
  },
  {
    title: 'How are refunds calculated?',
    text: 'Refund = User Deposit − User Used Funds\nwhere\nUser Used Funds = User Allocation × $0.01\n\nIf total deposits remain at or below the $100,000 hard cap, your entire deposit is converted into K613 and no refund is generated.\n\nRefunds are paid in USDC to the same wallet used for the deposit.',
  },
  {
    title: 'Can I deposit multiple times?',
    text: 'Yes. You can deposit as many times as you like while the contribution window is open.\n\nAll deposits from the same wallet are combined into a single position. There are no individual deposit limits.',
  },
  {
    title: 'Can I withdraw before the sale ends?',
    text: 'No. Deposits remain locked in the sale contract until the sale ends and allocations are finalized.\n\nIf the sale is oversubscribed, the unused portion of your deposit can be claimed back as a refund.',
  },
  {
    title: 'What is xK613?',
    text: 'xK613 is the staked version of K613.\n\nWhen you stake K613, you receive xK613, which represents your share of the staking pool and accrues protocol revenue over time.',
  },
  {
    title: 'How does revenue sharing work?',
    text: 'Protocol revenue is distributed to K613 stakers.\n\nAfter claiming your K613 tokens, you can stake them to receive xK613 and earn a proportional share of protocol revenue.',
  },
];

export function SaleFaq() {
  return (
    <Card elevation={0}>
      <CardHead>
        <div>
          <CardTitle>FAQ</CardTitle>
          <CardSub>How the sale, allocations, and refunds work.</CardSub>
        </div>
      </CardHead>

      <FaqStack>
        {faq.map((item, index) => (
          <Accordion
            key={item.title}
            disableGutters
            defaultExpanded={index === 0}
            sx={{
              border: '1px solid rgba(255, 255, 255, 0.1)',
              borderRadius: '4px !important',
              background: 'rgba(255, 255, 255, 0.04)',
              '&:before': { display: 'none' },
            }}
          >
            <AccordionSummary
              expandIcon={<ExpandMoreIcon />}
              sx={{
                fontWeight: 500,
                '& .MuiAccordionSummary-content': {
                  margin: '8px 0',
                },
              }}
            >
              {item.title}
            </AccordionSummary>
            <AccordionDetails sx={{ color: '#bdbdbd', lineHeight: 1.55, whiteSpace: 'pre-line' }}>
              {item.text}
            </AccordionDetails>
          </Accordion>
        ))}
      </FaqStack>
    </Card>
  );
}
