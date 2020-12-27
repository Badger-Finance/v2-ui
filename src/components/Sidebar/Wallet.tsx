import React, { useEffect, useState } from 'react';
import { observer } from 'mobx-react-lite';
import { useContext } from 'react';
import { StoreContext } from '../../context/store-context';
import { Button } from "@material-ui/core"
import { makeStyles } from '@material-ui/core/styles';

const useStyles = makeStyles((theme) => ({

	root: {
		padding: theme.spacing(0),
		width: "100%"
	},
	redDot: {
		display: "inline-block",
		width: theme.spacing(.8),
		height: theme.spacing(.8),
		marginLeft: theme.spacing(1),
		borderRadius: theme.spacing(1),
		background: theme.palette.error.main
	},
	greenDot: {
		display: "inline-block",
		width: theme.spacing(.8),
		height: theme.spacing(.8),
		marginLeft: theme.spacing(1),
		borderRadius: theme.spacing(1),
		background: theme.palette.success.main
	}
}));

export const Wallet = observer(() => {
	const classes = useStyles();

	const store = useContext(StoreContext);
	const wsOnboard = store.wallet.onboard;
	const connectedAddress = store.wallet.connectedAddress;

	const shortenAddress = (address: String) => {
		return address.slice(0, 6) + '...' + address.slice(address.length - 4, address.length)
	}

	const connect = async () => {
		if (store.uiState.sidebarOpen) {store.uiState.closeSidebar()}
		await wsOnboard.walletSelect();
		const readyToTransact = await wsOnboard.walletCheck();
		if (readyToTransact) {
			store.wallet.connect(wsOnboard);
		}
	}

	if (!!connectedAddress)
		return <div className={classes.root}>
			<Button
				fullWidth
				size="small"
				variant="outlined"
				onClick={() => { store.wallet.walletReset();}}>
				{!!connectedAddress ? shortenAddress(connectedAddress) : 'DISCONNECTED' }
				<div className={!!connectedAddress ? classes.greenDot : classes.redDot} />
			</Button>
		</div>
	else
		return <div className={classes.root}>

			<Button
				fullWidth
				disableElevation
				onClick={connect}
				variant="outlined">
				{!!connectedAddress ? shortenAddress(connectedAddress) : 'DISCONNECTED'}
				<div className={!!connectedAddress ? classes.greenDot : classes.redDot} />

			</Button>
		</div>

});
