import { normalize, UserIncentiveData } from '@aave/math-utils';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Tooltip,
  Typography,
} from '@mui/material';
import { useMemo, useState } from 'react';
import AssetsTable from 'src/components/AssetsTable';
import { ConnectWalletPaper } from 'src/components/ConnectWalletPaper';
import { HealthFactorNumber } from 'src/components/HealthFactorNumber';
import InfoCard from 'src/components/InfoCard';
import Layout from 'src/components/Layout';
import MaxWidthContainer from 'src/components/MaxWidthContainer';
import { ModalType } from 'src/components/Modals/types';
import { FormattedNumber } from 'src/components/primitives/FormattedNumber';
import { useDevice } from 'src/hooks';
import { useAppDataContext } from 'src/hooks/app-data-provider/useAppDataProvider';
import { useWeb3Context } from 'src/libs/hooks/useWeb3Context';
import { LiquidationRiskParametresInfoModal } from 'src/modules/dashboard/LiquidationRiskParametresModal/LiquidationRiskParametresModal';
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
  const [notifyOpen, setNotifyOpen] = useState(false);

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

  const { claimableAmount, claimableSymbol } = useMemo(() => {
    if (!user) return { claimableAmount: 0, claimableSymbol: '' };
    let amount = 0;
    let symbol = '';
    Object.keys(user.calculatedUserIncentives).forEach((rewardTokenAddress) => {
      const incentive: UserIncentiveData = user.calculatedUserIncentives[rewardTokenAddress];
      const rewardBalance = Number(
        normalize(incentive.claimableRewards, incentive.rewardTokenDecimals)
      );
      if (rewardBalance <= 0) return;
      amount += rewardBalance;
      if (!symbol) symbol = incentive.rewardTokenSymbol;
    });
    return { claimableAmount: amount, claimableSymbol: symbol };
  }, [user]);
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
                <FormattedNumber value={user.netWorthUSD} variant="h6" symbol="USD" compact />
              ) : (
                <Typography variant="h6" color="text.secondary">
                  –
                </Typography>
              )}
            </StatBlock>
            <HorizontalDivider />
            <StatBlock>
              <Typography variant="body2" color="text.secondary">
                Net APY
              </Typography>
              {showUserStats && user && netApyFinite && typeof netApyValue === 'number' ? (
                <FormattedNumber
                  value={netApyValue}
                  variant="h6"
                  percent
                  visibleDecimals={2}
                  color={netApyValue < 0 ? 'error' : 'text.primary'}
                />
              ) : (
                <Typography variant="h6" color="text.secondary">
                  –
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
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
                  <HealthFactorNumber value={user.healthFactor} variant="h6" sx={{ ml: 0 }} />
                  <Button
                    variant="contained"
                    size="small"
                    disabled={loading}
                    onClick={() => setRiskDetailsOpen(true)}
                    sx={{ minWidth: 'unset' }}
                  >
                    RISK DETAILS
                  </Button>
                  <Button
                    variant="contained"
                    size="small"
                    disabled={loading}
                    onClick={() => setNotifyOpen(true)}
                    sx={{
                      minWidth: 'unset',
                      backgroundColor: (theme) => theme.palette.grey[300],
                      color: 'black',
                      '&:hover': {
                        backgroundColor: (theme) => theme.palette.grey[400],
                      },
                    }}
                  >
                    NOTIFY
                  </Button>
                </Box>
              ) : (
                <Typography variant="h6" color="text.secondary">
                  –
                </Typography>
              )}
            </StatBlock>
            <HorizontalDivider />
            <StatBlock>
              <Typography variant="body2" color="text.secondary">
                Rewards
              </Typography>
              <RewardsRow>
                {showUserStats ? (
                  <FormattedNumber
                    value={claimableAmount}
                    variant="h6"
                    symbol={claimableSymbol || undefined}
                    visibleDecimals={4}
                    compact
                  />
                ) : (
                  <Typography variant="h6" color="text.secondary">
                    –
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
        <Dialog open={notifyOpen} onClose={() => setNotifyOpen(false)} maxWidth="xs" fullWidth>
          <DialogTitle>Notify</DialogTitle>
          <DialogContent>
            <Typography variant="body2" color="text.secondary">
              Notifications for health factor changes are not configured yet.
            </Typography>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setNotifyOpen(false)} variant="contained" size="small">
              OK
            </Button>
          </DialogActions>
        </Dialog>

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
              {(!isTablet || table === DASHBOARD_TABLES.SUPPLY) && (
                <InfoCard title="Your supplies" />
              )}
              {(!isTablet || table === DASHBOARD_TABLES.BORROW) && (
                <InfoCard title="Your borrows" extra="E-Mode" />
              )}
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
