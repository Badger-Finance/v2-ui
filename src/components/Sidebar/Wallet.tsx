import React from 'react';
import { observer } from 'mobx-react-lite';
import { useContext } from 'react';
import { StoreContext } from '../../context/store-context';
import { ListItem, ListItemIcon, ListItemText } from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';

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

	if (!!connectedAddress)
		return (
			<ListItem
				divider
				button
				style={{ marginTop: '-2px' }}
				color="primary"
				onClick={() => {
					store.wallet.walletReset();
				}}
			>
				<ListItemIcon>
					<img
						alt=""
						src={require('assets/sidebar/wallet.png')}
						style={{ width: '1.1rem', height: '1.1rem', display: 'inline-block' }}
					/>
				</ListItemIcon>

				<ListItemText primary={!!connectedAddress ? shortenAddress(connectedAddress) : 'DISCONNECTED'} />

				<div className={!!connectedAddress ? classes.greenDot : classes.redDot} />
			</ListItem>
		);
	else
		return (
			<ListItem divider button style={{ marginTop: '-2px' }} onClick={connect} color="primary">
				<ListItemIcon>
					<img
						alt=""
						src={require('assets/sidebar/wallet.png')}
						style={{ width: '1.1rem', height: '1.1rem', display: 'inline-block' }}
					/>
				</ListItemIcon>
				<ListItemText primary={!!connectedAddress ? shortenAddress(connectedAddress) : 'DISCONNECTED'} />

				<div className={!!connectedAddress ? classes.greenDot : classes.redDot} />
			</ListItem>
		);
});
