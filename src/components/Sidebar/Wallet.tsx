import React, { useEffect, useState } from 'react';
import { observer } from 'mobx-react-lite';
import { useContext } from 'react';
import { StoreContext } from '../../context/store-context';
import { Button } from "@material-ui/core"
import { makeStyles } from '@material-ui/core/styles';
import { useWallet } from 'use-wallet'
import WalletStore from '../../mobx/stores/wallet-store'

const useStyles = makeStyles((theme) => ({

	root: {
		padding: theme.spacing(0)
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
	let [connected, setConnected] = useState(false);

	const store = useContext(StoreContext);
	const wsOnboard = store.wallet.onboard;

	const shortenAddress = (address: String) => {
		return address.slice(0, 6) + '...' + address.slice(address.length - 4, address.length)
	}

	const connect = async () => {
		await wsOnboard.walletSelect();
		const readyToTransact = await wsOnboard.walletCheck();
		if (readyToTransact) {
			store.wallet.walletState = wsOnboard.getState();
			setConnected(true);
		}
	}

	// useEffect(() => { !!wallet.ethereum && setProvider(wallet.ethereum) }, [wallet.ethereum, setProvider])

	if (connected)
		return <div className={classes.root}>
			<Button
				fullWidth
				size="small"
				variant="outlined"
				onClick={() => { store.wallet.walletReset(); setConnected(false);}}>
				{connected ? shortenAddress(store.wallet.walletState.address) : 'DISCONNECTED' }
				<div className={connected ? classes.greenDot : classes.redDot} />
			</Button>
		</div>
	else
		return <div className={classes.root}>

			<Button
				fullWidth
				size="small"
				onClick={connect}
				variant="outlined">
				{connected ? shortenAddress(store.wallet.walletState.address) : 'DISCONNECTED'}
				<div className={connected ? classes.greenDot : classes.redDot} />

			</Button>
		</div>

});
