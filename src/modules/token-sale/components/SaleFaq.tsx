import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { Accordion, AccordionDetails, AccordionSummary } from '@mui/material';

import { Card, CardHead, CardSub, CardTitle, FaqStack } from '../tokenSale.styles';

const faq = [
  {
    title: 'What happens if the sale is oversubscribed?',
    text: 'If total deposits exceed the $100,000 hard cap, every participant receives a pro-rata share of the 10,000,000 K613 allocation:\n\nUser Allocation = User Deposit / Total Deposits × 10,000,000 K613\n\nOnly the funds backing your final allocation are used (at $0.01 per K613). The unused portion of your deposit becomes a refund, claimable to the same wallet after finalization.',
  },
  {
    title: 'When can I claim K613?',
    text: 'Claiming opens after the contribution window closes and allocations are finalized on-chain. Tokens are 100% unlocked at claim — there is no vesting. Until the sale is finalized, no tokens are distributed and all figures shown are estimates.',
  },
  {
    title: 'How are refunds calculated?',
    text: 'Refund = User Deposit − User Used Funds, where User Used Funds = User Allocation × $0.01.\n\nIf total deposits stay at or below the $100,000 hard cap, your entire deposit converts into K613 and the refund is zero. Refunds are sent in USDC to the same wallet that deposited.',
  },
  {
    title: 'Can I deposit multiple times?',
    text: 'Yes. You can deposit any number of times while the contribution window is open. All deposits from the same wallet are accumulated and treated as a single position. There are no individual deposit limits.',
  },
  {
    title: 'Can I withdraw before sale ends?',
    text: 'No. Deposits are locked in the sale contract until the sale ends and allocations are finalized. If the sale is oversubscribed, the unused portion of your deposit is returned via the refund claim.',
  },
  {
    title: 'What is xK613?',
    text: 'xK613 is the staked form of K613. When you stake K613 you receive xK613, which represents your share of the staking pool and accrues protocol revenue while you hold it.',
  },
  {
    title: 'How does revenue sharing work?',
    text: 'Protocol revenue is distributed to K613 stakers. After claiming your K613 from the sale, you can stake it to receive xK613 and start earning a proportional share of protocol revenue.',
  },
];

export function SaleFaq() {
  return (
    <Card elevation={0}>
      <CardHead>
        <div>
          <CardTitle>FAQ</CardTitle>
          <CardSub>How the sale, allocations and refunds work.</CardSub>
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
