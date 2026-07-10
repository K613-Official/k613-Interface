import { Card, CardHead, CardSub, CardTitle, DisclaimerText } from '../tokenSale.styles';

const disclaimer = `Participation in the K613 Public Token Sale involves risk. As with any digital asset, the value of K613 may fluctuate over time. Please ensure you understand the sale mechanics and only participate using funds you are comfortable committing.

Deposits are held in an immutable smart contract until the sale is finalized. While the contract parameters cannot be changed after the sale begins, smart contracts may contain bugs or vulnerabilities, and interacting with them carries inherent technical risks.

K613 does not represent equity, debt, or any claim to the assets, revenue, or profits of any entity. Nothing on this page constitutes financial, legal, or tax advice. Participation in this token sale may be restricted in certain jurisdictions. It is your responsibility to ensure that participating is lawful where you reside. No KYC is required for this sale.

By depositing USDC, you acknowledge that you have read and understood the sale mechanics, including the pro-rata allocation and refund process, and that you participate entirely at your own risk.`;

export function RiskDisclaimer() {
  return (
    <Card elevation={0}>
      <CardHead>
        <div>
          <CardTitle>Risk Disclaimer</CardTitle>
          <CardSub>Please read carefully before participating.</CardSub>
        </div>
      </CardHead>
      <DisclaimerText>{disclaimer}</DisclaimerText>
    </Card>
  );
}
