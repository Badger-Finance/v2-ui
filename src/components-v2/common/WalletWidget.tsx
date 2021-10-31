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
	walletButton: {
		marginLeft: theme.spacing(1),
		width: '188px',
	},
}));

const shortenAddress = (address: string) => {
	return address.slice(0, 7) + '...' + address.slice(address.length - 7, address.length);
};

const WalletWidget = observer(() => {
	const classes = useStyles();
	const store = useContext(StoreContext);
	const { address, connect, reset } = store.wallet;
	const isConnected = address !== undefined;
	const walletIcon = <div className={clsx(classes.walletDot, isConnected ? classes.greenDot : classes.redDot)} />;

	return (
		<Button
			disableElevation
			variant="contained"
			color="secondary"
			onClick={() => {
				if (!isConnected) connect();
				else reset();
			}}
			endIcon={walletIcon}
			className={classes.walletButton}
		>
			{address !== undefined ? shortenAddress(address) : 'Click to connect'}
		</Button>
	);
});

export default WalletWidget;
