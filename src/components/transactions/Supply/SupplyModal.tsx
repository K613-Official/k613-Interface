import { XIcon } from '@heroicons/react/outline';
import { Trans } from '@lingui/macro';
import { Box, DialogContent, IconButton, SvgIcon } from '@mui/material';
import { UserAuthenticated } from 'src/components/UserAuthenticated';
import { ModalContextType, ModalType, useModalContext } from 'src/hooks/useModal';
import { StyledDialog } from 'src/modules/k613-staking/k613Staking.styles';

import { ModalWrapper } from '../FlowCommons/ModalWrapper';
import { SupplyModalContentWrapper } from './SupplyModalContent';

export const SupplyModal = () => {
  const { type, close, args } = useModalContext() as ModalContextType<{
    underlyingAsset: string;
  }>;

  return (
    <StyledDialog open={type === ModalType.Supply} onClose={() => close()} fullWidth>
      <Box sx={{ position: 'relative' }}>
        <IconButton
          onClick={() => close()}
          sx={{
            position: 'absolute',
            top: 12,
            right: 12,
            color: 'rgba(255,255,255,0.7)',
            zIndex: 5,
            padding: 0.5,
          }}
        >
          <SvgIcon sx={{ fontSize: '22px' }}>
            <XIcon />
          </SvgIcon>
        </IconButton>
        <DialogContent>
          {args.underlyingAsset && (
            <ModalWrapper
              action="supply"
              title={<Trans>Supply</Trans>}
              underlyingAsset={args.underlyingAsset}
            >
              {(params) => (
                <UserAuthenticated>
                  {(user) => <SupplyModalContentWrapper {...params} user={user} />}
                </UserAuthenticated>
              )}
            </ModalWrapper>
          )}
        </DialogContent>
      </Box>
    </StyledDialog>
  );
};
