import { Button, makeStyles } from '@material-ui/core';
import { connectToWallet } from 'components/Sidebar/Wallet';
import { StoreContext } from 'mobx/store-context';
import React, { useContext } from 'react';

const useStyles = makeStyles((theme) => ({
	button: {
		width: '80%',
		marginTop: theme.spacing(4),
		marginBottom: theme.spacing(2),
		margin: 'auto',
		[theme.breakpoints.only('xs')]: {
			width: '100%',
		},
	},
}));

export function ConnectWalletButton() {
	const classes = useStyles();
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
