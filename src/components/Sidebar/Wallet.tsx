import React from 'react';
import { observer } from 'mobx-react-lite';
import { useContext } from 'react';
import { StoreContext } from '../../mobx/store-context';
import { Button, ListItem, ListItemIcon, ListItemText } from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';
import { AccountBalanceWallet } from '@material-ui/icons';

const useStyles = makeStyles((theme) => ({
	root: {
		padding: theme.spacing(0),
		width: '100%',
	},
	redDot: {
		display: 'block',
		width: theme.spacing(0.9),
		height: theme.spacing(0.8),
		marginLeft: theme.spacing(0.4),
		borderRadius: theme.spacing(0.4),
		background: theme.palette.error.main,
	},
	greenDot: {
		display: 'block',
		width: theme.spacing(0.9),
		height: theme.spacing(0.8),
		marginLeft: theme.spacing(0.4),
		borderRadius: theme.spacing(0.4),
		background: theme.palette.success.main,
	},
}));

export const Wallet = observer(() => {
	const classes = useStyles();

	const store = useContext(StoreContext);
	const wsOnboard = store.wallet.onboard;
	const connectedAddress = store.wallet.connectedAddress;

	const shortenAddress = (address: string) => {
		return address.slice(0, 6) + '...' + address.slice(address.length - 4, address.length);
	};

	const connect = async () => {
		if (store.uiState.sidebarOpen) {
			store.uiState.closeSidebar();
		}
		if (!(await wsOnboard.walletSelect())) return;
		const readyToTransact = await wsOnboard.walletCheck();
		if (readyToTransact) {
			store.wallet.connect(wsOnboard);
		}
	};

	return (
		<Button
			variant="outlined"
			color="default"
			// size="small"
			onClick={
				!!connectedAddress
					? () => {
							store.wallet.walletReset();
					  }
					: connect
			}
			startIcon={<AccountBalanceWallet />}
			endIcon={<div className={!!connectedAddress ? classes.greenDot : classes.redDot} />}
		>
			{!!connectedAddress ? shortenAddress(connectedAddress) : 'CLICK TO CONNECT'}
		</Button>
	);
});
