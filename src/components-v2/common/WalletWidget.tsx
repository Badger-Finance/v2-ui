import React, { useContext } from 'react';
import { Button, makeStyles } from '@material-ui/core';
import { observer } from 'mobx-react-lite';
import { StoreContext } from '../../mobx/store-context';

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
	walletButton: {
		textTransform: 'none',
	},
}));

const shortenAddress = (address?: string) => {
	if (!address) {
		return 'Connect';
	}
	return address.slice(0, 4) + '..' + address.slice(address.length - 4, address.length);
};

const WalletWidget = observer(() => {
	const classes = useStyles();
	const store = useContext(StoreContext);
	const { onboard, uiState } = store;

	async function connect(): Promise<void> {
		if (onboard.isActive()) {
			onboard.disconnect();
		} else {
			const connected = await onboard.connect();
			if (!connected) {
				uiState.queueError('Issue connecting, please try again');
			}
		}
	}

	return (
		<Button disableElevation color="primary" onClick={connect} className={classes.walletButton}>
			{shortenAddress(onboard.address)}
		</Button>
	);
});

export default WalletWidget;
