import { Button, ButtonProps } from '@mui/material';
import { TokenIcon } from 'src/components/primitives/TokenIcon';
import { K613_TOKEN_META } from 'src/const/k613Tokens';
import { UNISWAP_K613_USDC_POOL_URL } from 'src/const/links';

/**
 * Shown in place of the "add to wallet" affordance when the connected wallet holds
 * no K613: importing a token you do not own yet helps nobody, getting some does.
 */
export function BuyOnUniswapButton(props: Omit<ButtonProps, 'href' | 'children'>) {
  return (
    <Button
      component="a"
      variant="text"
      size="small"
      startIcon={<TokenIcon symbol={K613_TOKEN_META.symbol} sx={{ fontSize: 16 }} />}
      href={UNISWAP_K613_USDC_POOL_URL}
      target="_blank"
      rel="noopener noreferrer"
      {...props}
    >
      {`Buy ${K613_TOKEN_META.symbol} on Uniswap`}
    </Button>
  );
}
