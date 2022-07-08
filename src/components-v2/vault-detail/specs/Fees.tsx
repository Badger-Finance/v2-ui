import { VaultDTO } from '@badger-dao/sdk';
import { Dialog, IconButton } from '@material-ui/core';
import CloseIcon from '@material-ui/icons/Close';
import React, { useState } from 'react';

import { DepositFeesInformation } from '../../common/DepositFeesInformation';
import { VaultFees } from '../../common/VaultFees';

interface Props {
  vault: VaultDTO;
}

export const Fees = ({ vault }: Props): JSX.Element => {
  const [openFeesDialog, setOpenFeesDialog] = useState(false);
  const toggleDialog = () => setOpenFeesDialog(!openFeesDialog);

  return (
    <>
      <Dialog open={openFeesDialog} onClose={toggleDialog} fullWidth maxWidth="xl">
        <DepositFeesInformation
          closeIcon={
            <IconButton onClick={toggleDialog}>
              <CloseIcon />
            </IconButton>
          }
        />
      </Dialog>
      <VaultFees vault={vault} onHelpClick={toggleDialog} />
    </>
  );
};
