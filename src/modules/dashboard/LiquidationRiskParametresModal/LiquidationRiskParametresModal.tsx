import { XIcon } from '@heroicons/react/outline';
import { Trans } from '@lingui/macro';
import { AlertColor, DialogContent, IconButton, SvgIcon, Typography } from '@mui/material';
import { HealthFactorNumber } from 'src/components/HealthFactorNumber';
import { FormattedNumber } from 'src/components/primitives/FormattedNumber';
import { Link } from 'src/components/primitives/Link';
import { useRootStore } from 'src/store/root';
import { GENERAL } from 'src/utils/mixPanelEvents';

import { DialogTitleStyled, StyledDialog } from '../../k613-staking/k613Staking.styles';
import { HFContent } from './components/HFContent';
import { InfoWrapper } from './components/InfoWrapper';
import { LTVContent } from './components/LTVContent';

interface LiquidationRiskParametresInfoModalProps {
  open: boolean;
  setOpen: (value: boolean) => void;
  healthFactor: string;
  loanToValue: string;
  currentLoanToValue: string;
  currentLiquidationThreshold: string;
}

export const LiquidationRiskParametresInfoModal = ({
  open,
  setOpen,
  healthFactor,
  loanToValue,
  currentLoanToValue,
  currentLiquidationThreshold,
}: LiquidationRiskParametresInfoModalProps) => {
  let healthFactorColor: AlertColor = 'success';
  const hf = Number(healthFactor);
  if (hf > 1.1 && hf <= 3) {
    healthFactorColor = 'warning';
  } else if (hf <= 1.1) {
    healthFactorColor = 'error';
  }
  const trackEvent = useRootStore((store) => store.trackEvent);

  let ltvColor: AlertColor = 'success';
  const ltvPercent = Number(loanToValue) * 100;
  const currentLtvPercent = Number(currentLoanToValue) * 100;
  const liquidationThresholdPercent = Number(currentLiquidationThreshold) * 100;
  if (ltvPercent >= Math.min(currentLtvPercent, liquidationThresholdPercent)) {
    ltvColor = 'error';
  } else if (ltvPercent > currentLtvPercent / 2 && ltvPercent < currentLtvPercent) {
    ltvColor = 'warning';
  }

  const handleClose = () => setOpen(false);

  return (
    <StyledDialog open={open} onClose={handleClose} fullWidth>
      <DialogTitleStyled
        sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
      >
        <Trans>Liquidation risk parameters</Trans>
        <IconButton
          size="small"
          onClick={handleClose}
          sx={{ color: 'rgba(255,255,255,0.7)', padding: 0.5, ml: 1 }}
        >
          <SvgIcon sx={{ fontSize: '20px' }}>
            <XIcon />
          </SvgIcon>
        </IconButton>
      </DialogTitleStyled>

      <DialogContent sx={{ pt: 2, pb: 3 }}>
        <Typography variant="body2" color="text.secondary" mb={3}>
          <Trans>
            Your health factor and loan to value determine the assurance of your collateral. To
            avoid liquidations you can supply more collateral or repay borrow positions.
          </Trans>{' '}
          <Link
            onClick={() => {
              trackEvent(GENERAL.EXTERNAL_LINK, {
                Link: 'HF Risk Link',
              });
            }}
            href="https://docs.aave.com/faq/"
            sx={{ textDecoration: 'underline' }}
            color="text.primary"
            variant="body2"
          >
            <Trans>Learn more</Trans>
          </Link>
        </Typography>

        <InfoWrapper
          topTitle={<Trans>Health factor</Trans>}
          topDescription={
            <Trans>
              Safety of your deposited collateral against the borrowed assets and its underlying
              value.
            </Trans>
          }
          topValue={
            <HealthFactorNumber
              value={healthFactor}
              variant="caption"
              sx={{ color: 'common.white' }}
            />
          }
          bottomText={
            <Trans>
              If the health factor goes below 1, the liquidation of your collateral might be
              triggered.
            </Trans>
          }
          color={healthFactorColor}
        >
          <HFContent healthFactor={healthFactor} />
        </InfoWrapper>

        <InfoWrapper
          topTitle={<Trans>Current LTV</Trans>}
          topDescription={
            <Trans>Your current loan to value based on your collateral supplied.</Trans>
          }
          topValue={
            <FormattedNumber
              value={loanToValue}
              percent
              variant="caption"
              color="common.white"
              symbolsColor="common.white"
            />
          }
          bottomText={
            <Trans>
              If your loan to value goes above the liquidation threshold your collateral supplied
              may be liquidated.
            </Trans>
          }
          color={ltvColor}
        >
          <LTVContent
            loanToValue={loanToValue}
            currentLoanToValue={currentLoanToValue}
            currentLiquidationThreshold={currentLiquidationThreshold}
            color={ltvColor}
          />
        </InfoWrapper>
      </DialogContent>
    </StyledDialog>
  );
};
