import React, { useEffect } from 'react';
import { observer } from 'mobx-react-lite';
import { useContext } from 'react';
import { StoreContext } from '../../context/store-context';
import { Button } from "@material-ui/core"
import { makeStyles } from '@material-ui/core/styles';
import { useWallet } from 'use-wallet'

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
	const wallet = useWallet()

	const store = useContext(StoreContext);
	const { wallet: { setProvider } } = store;

	const shortenAddress = (address: String) => {
		return address.slice(0, 6) + '...' + address.slice(address.length - 4, address.length)
	}

	const connect = () => {
		wallet.connect('provided')
	}

	useEffect(() => { !!wallet.ethereum && setProvider(wallet.ethereum) }, [wallet.ethereum, setProvider])

	if (wallet.status === 'connected')
		return <div className={classes.root}>
			<Button
				fullWidth
				size="small"
				variant="outlined"
				onClick={() => wallet.reset()}>
				{wallet.status}
				<div className={wallet.status !== 'connected' ? classes.redDot : classes.greenDot} />
			</Button>
		</div>
	else
		return <div className={classes.root}>

			<Button
				fullWidth
				size="small"
				onClick={connect}
				variant="outlined">
				{wallet.status}
				<div className={wallet.status !== 'connected' ? classes.redDot : classes.greenDot} />

			</Button>
		</div>

});
