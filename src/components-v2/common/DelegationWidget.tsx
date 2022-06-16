import { Button, Dialog, IconButton } from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';
import CloseIcon from '@material-ui/icons/Close';
import clsx from 'clsx';
import React, { useContext, useState } from 'react';

import { StoreContext } from '../../mobx/store-context';
import CvxDelegationBanner from '../locked-cvx-bribes/Banner';

const useStyles = makeStyles(() => ({
	delegateButton: {
		minWidth: 37,
		width: 37,
	},
	closeIcon: {
		position: 'absolute',
		top: 8,
		right: 8,
		zIndex: 1,
	},
	active: {
		borderColor: '#F2BC1B',
	},
}));

const DelegationWidget = (): JSX.Element | null => {
	const {
		lockedCvxDelegation: { shouldBannerBeDisplayed, canUserDelegate, unclaimedBalance },
	} = useContext(StoreContext);
	const [showModal, setShowModal] = useState(false);
	const classes = useStyles();

	const toggleModal = () => setShowModal(!showModal);

	if (!shouldBannerBeDisplayed) {
		return null;
	}

	const shouldInteract = canUserDelegate && unclaimedBalance && unclaimedBalance.gt(0);
	return (
		<>
			<Button
				onClick={toggleModal}
				className={clsx(classes.delegateButton, shouldInteract && classes.active)}
				variant="outlined"
			>
				<img src="/assets/icons/delegation.svg" alt="rewards icon" />
			</Button>
			<Dialog open={showModal} onClose={toggleModal} maxWidth="md" fullWidth scroll="body">
				<IconButton className={classes.closeIcon} onClick={toggleModal}>
					<CloseIcon />
				</IconButton>
				<CvxDelegationBanner />
			</Dialog>
		</>
	);
};

export default DelegationWidget;
