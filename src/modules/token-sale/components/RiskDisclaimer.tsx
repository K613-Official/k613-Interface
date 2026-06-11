import { Card, CardHead, CardSub, CardTitle, DisclaimerText } from '../tokenSale.styles';

const disclaimer = `Participation in the K613 Public Token Sale involves significant risk. Digital assets are volatile, and the value of K613 may decrease or fall to zero. Do not deposit funds you cannot afford to lose.

Deposits are held by an immutable smart contract until the sale is finalized. While the contract parameters cannot be changed after the sale starts, smart contracts may contain bugs or vulnerabilities, and interacting with them carries inherent technical risk.

K613 does not represent equity, debt, or any claim on future revenue or profits of any entity. Nothing on this page constitutes financial, legal, or tax advice. Token sale participation may be restricted in certain jurisdictions — it is your responsibility to ensure that participating is lawful where you live. No KYC is performed as part of this sale.

By depositing USDC you acknowledge that you have read and understood the sale mechanics, including pro-rata allocation and refunds, and that you participate at your own risk.`;

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
