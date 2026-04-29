import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import { Box, Button, Tooltip, Typography } from '@mui/material';
import { formatUnits } from 'ethers/lib/utils';
import { useMemo, useState } from 'react';
import AssetsTable from 'src/components/AssetsTable';
import { ConnectWalletPaper } from 'src/components/ConnectWalletPaper';
import { HealthFactorNumber } from 'src/components/HealthFactorNumber';
import InfoCard from 'src/components/InfoCard';
import Layout from 'src/components/Layout';
import MaxWidthContainer from 'src/components/MaxWidthContainer';
import { ModalType } from 'src/components/Modals/types';
import { BigStat } from 'src/components/primitives/BigStat';
import { useDevice } from 'src/hooks';
import { useAppDataContext } from 'src/hooks/app-data-provider/useAppDataProvider';
import { useOnChainClaimable } from 'src/hooks/pool/useOnChainClaimable';
import { useWeb3Context } from 'src/libs/hooks/useWeb3Context';
import { LiquidationRiskParametresInfoModal } from 'src/modules/dashboard/LiquidationRiskParametresModal/LiquidationRiskParametresModal';
import { useRootStore } from 'src/store/root';
import { useModalStore } from 'src/store/useModalStore';

import { DASHBOARD_TABLES } from './const';
import {
  CardsContainer,
  FirstBlock,
  HorizontalDivider,
  LeftContainer,
  RewardsRow,
  RightContainer,
  StatBlock,
  TablesContainer,
  TableSwitchContainer,
  TitleContainer,
  TitleRow,
} from './styles';

export default function DashboardPage() {
  const openModal = useModalStore((s) => s.openModal);
  const { user, loading } = useAppDataContext();
  const { isTablet } = useDevice();
  const [table, setTable] = useState<DASHBOARD_TABLES>(DASHBOARD_TABLES.SUPPLY);
  const [riskDetailsOpen, setRiskDetailsOpen] = useState(false);

  const { currentAccount } = useWeb3Context();
  const loanToValue =
    user?.totalCollateralMarketReferenceCurrency === '0'
      ? '0'
      : Number(user?.totalCollateralMarketReferenceCurrency || '0') === 0
      ? '0'
      : (
          Number(user?.totalBorrowsMarketReferenceCurrency || '0') /
          Number(user?.totalCollateralMarketReferenceCurrency || '1')
        ).toString();

  const showUserStats = Boolean(currentAccount && user);

  const currentMarketData = useRootStore((s) => s.currentMarketData);
  const { data: onChainClaimable } = useOnChainClaimable(currentMarketData);
  const { claimableAmount, claimableSymbol } = useMemo(() => {
    let amount = 0;
    let symbol = '';
    (onChainClaimable?.rewards ?? []).forEach((r) => {
      const v = Number(formatUnits(r.amount, r.decimals));
      if (v <= 0) return;
      amount += v;
      if (!symbol) symbol = r.symbol;
    });
    return { claimableAmount: amount, claimableSymbol: symbol };
  }, [onChainClaimable]);
  const netApyValue = user?.netAPY;
  const netApyFinite = typeof netApyValue === 'number' && Number.isFinite(netApyValue);

  return (
    <Layout>
      <MaxWidthContainer>
        <FirstBlock>
          <LeftContainer>
            <TitleContainer>
              <TitleRow>
                <Typography variant="h4">K613 Dashboard</Typography>
              </TitleRow>
              <Typography variant="body2" color="#BDBDBD">
                Track your portfolio, rewards, and lending activity in one place
              </Typography>
            </TitleContainer>
          </LeftContainer>
          <RightContainer>
            <StatBlock>
              <Typography variant="body2" color="text.secondary">
                Net worth
              </Typography>
              {showUserStats && user ? (
                <BigStat value={user.netWorthUSD} />
              ) : (
                <Typography
                  color="text.secondary"
                  sx={{ fontSize: { xs: 26, md: 32 }, fontWeight: 500, lineHeight: 1.1 }}
                >
                  —
                </Typography>
              )}
            </StatBlock>
            <HorizontalDivider />
            <StatBlock>
              <Box sx={{ display: 'inline-flex', alignItems: 'center', gap: 1 }}>
                <Typography variant="body2" color="text.secondary">
                  Net APY
                </Typography>
                <Tooltip title="Net APY is the combined effect of all supply and borrow positions on your portfolio.">
                  <Box sx={{ display: 'inline-flex', alignItems: 'center' }}>
                    <InfoOutlinedIcon sx={{ fontSize: 18, color: 'text.secondary' }} />
                  </Box>
                </Tooltip>
              </Box>
              {showUserStats && user && netApyFinite && typeof netApyValue === 'number' ? (
                <BigStat value={netApyValue} percent visibleDecimals={2} showDollar={false} />
              ) : (
                <Typography
                  color="text.secondary"
                  sx={{ fontSize: { xs: 26, md: 32 }, fontWeight: 500, lineHeight: 1.1 }}
                >
                  —
                </Typography>
              )}
            </StatBlock>
            <HorizontalDivider />
            <StatBlock>
              <Box sx={{ display: 'inline-flex', alignItems: 'center', gap: 1 }}>
                <Typography variant="body2" color="text.secondary">
                  Health factor
                </Typography>
                <Tooltip title="If your health factor goes below 1, your collateral may be liquidated.">
                  <Box sx={{ display: 'inline-flex', alignItems: 'center' }}>
                    <InfoOutlinedIcon sx={{ fontSize: 18, color: 'text.secondary' }} />
                  </Box>
                </Tooltip>
              </Box>

              {currentAccount && user?.healthFactor ? (
                <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                  <Box sx={{ display: 'block' }}>
                    <HealthFactorNumber
                      value={user.healthFactor}
                      sx={{
                        ml: 0,
                        fontSize: { xs: 14, md: 20 },
                        fontWeight: 500,
                        lineHeight: 1.1,
                      }}
                    />
                  </Box>
                  <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                    <Button
                      variant="contained"
                      size="small"
                      disabled={loading}
                      onClick={() => setRiskDetailsOpen(true)}
                      sx={{
                        minWidth: 'unset',
                        fontSize: 11,
                        fontWeight: 700,
                        px: 1,
                      }}
                    >
                      RISK DETAILS
                    </Button>
                  </Box>
                </Box>
              ) : (
                <Typography
                  color="text.secondary"
                  sx={{ fontSize: { xs: 26, md: 32 }, fontWeight: 500, lineHeight: 1.1 }}
                >
                  —
                </Typography>
              )}
            </StatBlock>
            <HorizontalDivider />
            <StatBlock>
              <Typography variant="body2" color="text.secondary">
                Available rewards
              </Typography>
              <RewardsRow>
                {showUserStats ? (
                  <BigStat
                    value={claimableAmount}
                    symbol={claimableSymbol || undefined}
                    visibleDecimals={4}
                    showDollar={false}
                  />
                ) : (
                  <Typography
                    color="text.secondary"
                    sx={{ fontSize: { xs: 26, md: 32 }, fontWeight: 500, lineHeight: 1.1 }}
                  >
                    —
                  </Typography>
                )}
                <Button
                  variant="contained"
                  size="small"
                  disabled={!showUserStats || claimableAmount <= 0}
                  onClick={() => openModal(ModalType.ClaimRewards, {})}
                >
                  CLAIM
                </Button>
              </RewardsRow>
            </StatBlock>
          </RightContainer>
        </FirstBlock>

        <LiquidationRiskParametresInfoModal
          open={riskDetailsOpen}
          setOpen={setRiskDetailsOpen}
          healthFactor={user?.healthFactor || '-1'}
          loanToValue={loanToValue}
          currentLoanToValue={user?.currentLoanToValue || '0'}
          currentLiquidationThreshold={user?.currentLiquidationThreshold || '0'}
        />

        {currentAccount ? (
          <>
            <TableSwitchContainer>
              <Button
                variant={table === DASHBOARD_TABLES.SUPPLY ? 'contained' : 'text'}
                color="inherit"
                fullWidth
                onClick={() => setTable(DASHBOARD_TABLES.SUPPLY)}
              >
                SUPPLY
              </Button>
              <Button
                variant={table === DASHBOARD_TABLES.BORROW ? 'contained' : 'text'}
                color="inherit"
                fullWidth
                onClick={() => setTable(DASHBOARD_TABLES.BORROW)}
              >
                BORROW
              </Button>
            </TableSwitchContainer>
            <CardsContainer>
              {(!isTablet || table === DASHBOARD_TABLES.SUPPLY) && <InfoCard type="supply" />}
              {(!isTablet || table === DASHBOARD_TABLES.BORROW) && <InfoCard type="borrow" />}
            </CardsContainer>

            <TablesContainer>
              {(!isTablet || table === DASHBOARD_TABLES.SUPPLY) && <AssetsTable type="supply" />}
              {(!isTablet || table === DASHBOARD_TABLES.BORROW) && <AssetsTable type="borrow" />}
            </TablesContainer>
          </>
        ) : (
          <ConnectWalletPaper />
        )}
      </MaxWidthContainer>
    </Layout>
  );
}
