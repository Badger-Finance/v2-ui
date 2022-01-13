import React, { useContext } from 'react';
import { Button, makeStyles, useMediaQuery, useTheme } from '@material-ui/core';
import { observer } from 'mobx-react-lite';
import { StoreContext } from '../../mobx/store-context';
import useENS from 'hooks/useEns';

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
	walletButtonLabel: {
		fontWeight: 500,
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
	const isMobile = useMediaQuery(useTheme().breakpoints.down('sm'));

	async function connect(): Promise<void> {
		if (onboard.isActive()) {
			onboard.disconnect();
		} else {
			try {
				await onboard.connect();
			} catch (error) {
				uiState.queueError('Issue connecting, please try again');
				console.error(error);
			}
		}
	}

	const { ensName } = useENS(onboard.address);

	return (
		<Button
			disableElevation
			color={isMobile ? 'primary' : 'default'}
			variant={isMobile ? 'text' : 'outlined'}
			onClick={connect}
			className={classes.walletButton}
			classes={{ label: classes.walletButtonLabel }}
		>
			{ensName ? ensName : shortenAddress(onboard.address)}
		</Button>
	);
});

export default WalletWidget;
