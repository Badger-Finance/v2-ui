import React, { useState } from 'react';
import { Dialog, IconButton } from '@material-ui/core';
import { DepositFeesInformation } from '../../common/DepositFeesInformation';
import CloseIcon from '@material-ui/icons/Close';
import { VaultFees } from '../../common/VaultFees';
import { Vault } from '@badger-dao/sdk';

interface Props {
	vault: Vault;
}

export const Fees = ({ vault }: Props): JSX.Element => {
	const [openFeesDialog, setOpenFeesDialog] = useState(false);
	const toggleDialog = () => setOpenFeesDialog(!openFeesDialog);

	return (
		<>
			<Dialog open={openFeesDialog} onClose={toggleDialog} fullWidth maxWidth="sm">
				<DepositFeesInformation
					closeIcon={
						<IconButton onClick={toggleDialog}>
							<CloseIcon />
						</IconButton>
					}
				/>
			</Dialog>
			<VaultFees vault={vault} showNoFees onHelpClick={toggleDialog} />
		</>
	);
};
