import { Button } from '@material-ui/core';
import { connectToWallet } from 'components/Sidebar/Wallet';
import { StoreContext } from 'mobx/store-context';
import React, { useContext } from 'react';
import { useMainStyles } from './index';

export function ConnectWalletButton() {
	const classes = useMainStyles();
    const store = useContext(StoreContext);

	return (
		<Button
			color="primary"
			onClick={() => connectToWallet(store)}
			variant="contained"
			size="large"
			className={classes.button}
		>
			Connect Wallet
		</Button>
	);
}
