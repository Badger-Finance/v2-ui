import { Button, makeStyles } from '@material-ui/core';
import useENS from 'hooks/useEns';
import { StoreContext } from 'mobx/stores/store-context';
import { observer } from 'mobx-react-lite';
import React, { useContext } from 'react';

import { shortenAddress } from '../../utils/componentHelpers';

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
	walletButtonLabel: {
		textTransform: 'none',
	},
}));

const WalletWidget = observer(() => {
	const classes = useStyles();
	const store = useContext(StoreContext);
	const { uiState, wallet } = store;

	console.log(wallet.address);

	async function connect(): Promise<void> {
		if (wallet.isConnected) {
			uiState.toggleWalletDrawer();
		} else {
			try {
				await wallet.connect();
			} catch (error) {
				const isModalClosed = String(error).includes('User closed modal');
				const isEmptyAccounts = String(error).includes('Error: accounts received is empty');
				if (!isModalClosed && !isEmptyAccounts) {
					console.error(error);
					uiState.queueError('Issue connecting, please try again');
				}
			}
		}
	}

	const { ensName } = useENS(wallet.address);
	const walletAddress = wallet.address ? shortenAddress(wallet.address) : 'Connect';

	return (
		<Button
			disableElevation
			color="primary"
			variant={wallet.isConnected ? 'outlined' : 'contained'}
			onClick={connect}
			classes={{ label: classes.walletButtonLabel }}
		>
			{ensName || walletAddress}
		</Button>
	);
});

export default WalletWidget;
