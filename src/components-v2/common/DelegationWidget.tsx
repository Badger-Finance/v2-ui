import React, { useContext, useState } from 'react';
import clsx from 'clsx';
import { Button, Dialog } from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';
import CvxDelegationBanner from '../locked-cvx-bribes/Banner';
import { StoreContext } from '../../mobx/store-context';

const useStyles = makeStyles(() => ({
	button: {
		height: 36,
	},
	delegateButton: {
		minWidth: 37,
		width: 37,
	},
}));

const DelegationWidget = (): JSX.Element | null => {
	const {
		lockedCvxDelegation: { shouldBannerBeDisplayed },
	} = useContext(StoreContext);
	const [showModal, setShowModal] = useState(false);
	const classes = useStyles();

	const toggleModal = () => setShowModal(!showModal);

	if (!shouldBannerBeDisplayed) {
		return null;
	}

	return (
		<>
			<Button onClick={toggleModal} className={clsx(classes.button, classes.delegateButton)} variant="outlined">
				<img src="/assets/icons/delegation.svg" alt="rewards icon" />
			</Button>
			<Dialog open={showModal} onClose={toggleModal} maxWidth="md" fullWidth>
				<CvxDelegationBanner />
			</Dialog>
		</>
	);
};

export default DelegationWidget;
