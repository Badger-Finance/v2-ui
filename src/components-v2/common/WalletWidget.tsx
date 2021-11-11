import React, { useContext } from 'react';
import { Button, makeStyles } from '@material-ui/core';
import { observer } from 'mobx-react-lite';
import { StoreContext } from '../../mobx/store-context';
import clsx from 'clsx';
import { connectWallet } from '../../mobx/utils/helpers';

const useStyles = makeStyles((theme) => ({
	walletDot: {
		display: 'block',
		width: theme.spacing(0.9),
		height: theme.spacing(0.8),
		marginLeft: theme.spacing(0.4),
		borderRadius: theme.spacing(0.4),
	},
	redDot: {
		background: theme.palette.error.main,
	},
	greenDot: {
		background: theme.palette.success.main,
	},
	walletButton: {},
}));

const shortenAddress = (address: string) => {
	return address.slice(0, 4) + '..' + address.slice(address.length - 4, address.length);
};

interface Props {
	className?: HTMLButtonElement['className'];
}

const WalletWidget = observer(({ className }: Props) => {
	const classes = useStyles();
	const store = useContext(StoreContext);
	const { connectedAddress, onboard } = store.wallet;
	const isConnected = !(!connectedAddress || connectedAddress.length === 0);
	const walletIcon = <div className={clsx(classes.walletDot, isConnected ? classes.greenDot : classes.redDot)} />;

	const connect = async () => {
		if (store.uiState.sidebarOpen) {
			store.uiState.closeSidebar();
		}

		connectWallet(onboard, store.wallet.connect);
	};

	return (
		<Button
			disableElevation
			variant="outlined"
			onClick={() => {
				if (!connectedAddress) connect();
				else store.wallet.walletReset();
			}}
			endIcon={walletIcon}
			className={clsx(classes.walletButton, className)}
		>
			{isConnected ? shortenAddress(connectedAddress) : 'Click to connect'}
		</Button>
	);
});

export default WalletWidget;
