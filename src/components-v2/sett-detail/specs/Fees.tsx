import React, { useState } from 'react';
import { Dialog, IconButton } from '@material-ui/core';
import { DepositFeesInformation } from '../../common/DepositFeesInformation';
import CloseIcon from '@material-ui/icons/Close';
import { SettFees } from '../../common/SettFees';
import { Sett } from '../../../mobx/model/setts/sett';

interface Props {
	sett: Sett;
}

export const Fees = ({ sett }: Props): JSX.Element => {
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
			<SettFees sett={sett} showNowFees onHelpClick={toggleDialog} />
		</>
	);
};
