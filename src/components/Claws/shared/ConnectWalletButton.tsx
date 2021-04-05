import React from 'react';
import { Button, makeStyles } from '@material-ui/core';
import { useConnectWallet } from 'mobx/utils/hooks';

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
	const connectWallet = useConnectWallet();

	return (
		<Button
			color="primary"
			onClick={() => connectWallet()}
			variant="contained"
			size="large"
			className={classes.button}
		>
			Connect Wallet
		</Button>
	);
}
