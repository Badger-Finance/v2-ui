import React, { useEffect } from 'react';
import { observer } from 'mobx-react-lite';
import views from '../../config/routes';
import { useContext } from 'react';
import { StoreContext } from '../../mobx/store-context';
import { Toolbar, AppBar, IconButton } from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';
import { Menu } from '@material-ui/icons';
import Notify from 'bnc-notify';

const notify = Notify({
	dappId: 'af74a87b-cd08-4f45-83ff-ade6b3859a07', // [String] The API key created by step one above
	networkId: 1, // [Integer] The Ethereum network ID your Dapp uses.
});
notify.config({
	darkMode: true, // (default: false)
});

import { useSnackbar } from 'notistack';

const useStyles = makeStyles((theme) => ({
	appBar: {
		justifyContent: 'space-between',
		[theme.breakpoints.up('md')]: {
			display: 'none',
		},
	},
	toolbar: {
		justifyContent: 'space-between',
		cursor: 'pointer',
	},
	logo: {
		height: '2.4rem',
	},
	menuButton: {
		float: 'right',
		color: '#000',
	},
}));

function addEtherscan(transaction: any) {
	return {
		link: `https://etherscan.io/tx/${transaction.hash}`,
	};
}

export const Header = observer(() => {
	const classes = useStyles();

	const store = useContext(StoreContext);
	const {
		router: { goTo },
		uiState: { openSidebar, notification },
	} = store;
	const { enqueueSnackbar } = useSnackbar();

	const enq = () => {
		if (!notification || !notification.message) return;

		if (notification.hash) {
			// then on each transaction...
			const { emitter } = notify.hash(notification.hash);
			emitter.on('all', addEtherscan);
		} else {
			enqueueSnackbar(notification.message, { variant: notification.variant, persist: false });
		}
	};
	// Disable reason: Hook used for execution of enq() on change of notification.
	// eslint-disable-next-line react-hooks/exhaustive-deps
	useEffect(enq, [notification]);

	return (
		<AppBar className={classes.appBar} color="primary">
			<Toolbar className={classes.toolbar} onClick={() => goTo(views.home, { collection: 'badger' })}>
				<img alt="Badger header icon" src={require('../../assets/badger-full.png')} className={classes.logo} />
				<IconButton className={classes.menuButton} onClick={() => openSidebar()}>
					<Menu />
				</IconButton>
			</Toolbar>
		</AppBar>
	);
});
