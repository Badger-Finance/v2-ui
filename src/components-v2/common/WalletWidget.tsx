import React, { useContext } from 'react';
import { Button, makeStyles } from '@material-ui/core';
import { observer } from 'mobx-react-lite';
import { StoreContext } from '../../mobx/store-context';
import clsx from 'clsx';

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

const shortenAddress = (address?: string) => {
	if (!address) {
		return 'Connect';
	}
	return address.slice(0, 4) + '..' + address.slice(address.length - 4, address.length);
};

interface Props {
	className?: HTMLButtonElement['className'];
}

const WalletWidget = observer(({ className }: Props) => {
	const classes = useStyles();
	const store = useContext(StoreContext);
	const { onboard, uiState } = store;
	const { address } = onboard;
	const isConnected = address !== undefined;
	const walletIcon = <div className={clsx(classes.walletDot, isConnected ? classes.greenDot : classes.redDot)} />;

	async function connect(): Promise<void> {
		if (onboard.address) {
			onboard.disconnect();
		} else {
			const connected = await onboard.connect();
			if (!connected) {
				uiState.queueError('Issue connecting, please try again');
			}
		}
	}

	return (
		<Button
			disableElevation
			variant="outlined"
			onClick={connect}
			endIcon={walletIcon}
			className={clsx(classes.walletButton, className)}
		>
			{shortenAddress(address)}
		</Button>
	);
});

export default WalletWidget;
