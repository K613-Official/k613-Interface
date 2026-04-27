import { Close } from '@mui/icons-material';
import { Box, Dialog, IconButton, Typography } from '@mui/material';

interface LiquidationRiskParametresInfoModalProps {
  open: boolean;
  setOpen: (value: boolean) => void;
  healthFactor: string;
  loanToValue: string;
  currentLoanToValue: string;
  currentLiquidationThreshold: string;
}

function getHfStatus(hf: number): { label: string; color: string } {
  if (hf <= 0) return { label: 'No borrows', color: 'text.secondary' };
  if (hf < 1) return { label: 'Liquidation risk', color: 'error.main' };
  if (hf < 1.5) return { label: 'High risk', color: 'warning.main' };
  if (hf < 3) return { label: 'Moderate', color: 'warning.main' };
  return { label: 'Very safe', color: 'success.main' };
}

function SectionCard({ children }: { children: React.ReactNode }) {
  return (
    <Box
      sx={{
        border: '1px solid rgba(255,255,255,0.08)',
        borderRadius: 2,
        p: 2.5,
        display: 'flex',
        flexDirection: 'column',
        gap: 2,
      }}
    >
      {children}
    </Box>
  );
}

function InfoCell({ label, value }: { label: string; value: string }) {
  return (
    <Box
      sx={{
        flex: 1,
        border: '1px solid rgba(255,255,255,0.08)',
        borderRadius: 1.5,
        p: 1.5,
        display: 'flex',
        flexDirection: 'column',
        gap: 0.5,
      }}
    >
      <Typography variant="caption" sx={{ opacity: 0.5 }}>
        {label}
      </Typography>
      <Typography variant="body1" fontWeight={600}>
        {value}
      </Typography>
    </Box>
  );
}

export const LiquidationRiskParametresInfoModal = ({
  open,
  setOpen,
  healthFactor,
  loanToValue,
  currentLoanToValue,
  currentLiquidationThreshold,
}: LiquidationRiskParametresInfoModalProps) => {
  const hf = Number(healthFactor);
  const hfStatus = getHfStatus(hf);

  const ltvPercent = (Number(loanToValue) * 100).toFixed(2);
  const maxLtvPercent = (Number(currentLoanToValue) * 100).toFixed(2);
  const liquidationThresholdPercent = (Number(currentLiquidationThreshold) * 100).toFixed(2);

  return (
    <Dialog
      open={open}
      onClose={() => setOpen(false)}
      PaperProps={{
        sx: {
          backgroundColor: 'rgba(255, 255, 255, 0.08)',
          backdropFilter: 'blur(200px)',
          backgroundImage: 'none',
          borderRadius: 1,
          p: 3,
          width: 440,
          maxWidth: '100%',
          display: 'flex',
          flexDirection: 'column',
          gap: 2.5,
        },
      }}
    >
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h6" fontWeight={600}>
          Details
        </Typography>
        <IconButton size="small" onClick={() => setOpen(false)}>
          <Close fontSize="small" />
        </IconButton>
      </Box>

      {/* Health Factor */}
      <SectionCard>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <Box>
            <Typography variant="body1" fontWeight={600}>
              Health Factor
            </Typography>
            <Typography variant="caption" sx={{ opacity: 0.5 }}>
              Indicates how safe your position is
            </Typography>
          </Box>
          <Typography variant="h6" fontWeight={700}>
            {hf > 0 ? hf.toFixed(2) : '—'}
          </Typography>
        </Box>

        <Box sx={{ display: 'flex', gap: 1 }}>
          <InfoCell label="Safe" value="> 1.0" />
          <InfoCell label="High risk" value="≈ 1.0" />
          <InfoCell label="Liquidation possible" value="< 1.0" />
        </Box>

        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="body2" sx={{ opacity: 0.5 }}>
            Your position is currently
          </Typography>
          <Typography variant="body2" fontWeight={600} color={hfStatus.color}>
            {hfStatus.label}
          </Typography>
        </Box>
      </SectionCard>

      {/* LTV */}
      <SectionCard>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <Box>
            <Typography variant="body1" fontWeight={600}>
              Loan-to-Value (LTV)
            </Typography>
            <Typography variant="caption" sx={{ opacity: 0.5 }}>
              Shows how much you&apos;ve borrowed relative to your collateral
            </Typography>
          </Box>
          <Typography variant="body2" fontWeight={600}>
            {Number(ltvPercent) < 0.01 ? '< 0.01%' : `${ltvPercent}%`}
          </Typography>
        </Box>

        <Box sx={{ display: 'flex', gap: 1 }}>
          <InfoCell label="Max LTV" value={`${maxLtvPercent}%`} />
          <InfoCell label="Liquidation threshold" value={`${liquidationThresholdPercent}%`} />
        </Box>

        <Typography variant="caption" sx={{ opacity: 0.5 }}>
          If your LTV exceeds the liquidation threshold, your collateral may be liquidated.
        </Typography>
      </SectionCard>
    </Dialog>
  );
};
