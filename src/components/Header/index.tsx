import React, { useEffect } from 'react';
import { observer } from 'mobx-react-lite';
import { useContext } from 'react';
import { StoreContext } from '../../mobx/store-context';
import { Toolbar, AppBar, IconButton } from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';
import { Menu } from '@material-ui/icons';

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

export const Header = observer(() => {
	const classes = useStyles();

	const store = useContext(StoreContext);
	const {
		uiState: { openSidebar, notification },
		wallet: { notify },
		network: { network },
	} = store;
	const { enqueueSnackbar } = useSnackbar();

	const enq = () => {
		if (!notification || !notification.message) return;

		// Notify doesn't support BSC currently so it is temporarily disabled for it
		if (notification.hash && network.id == 1) {
			// then on each transaction...
			const { emitter } = notify.hash(notification.hash);
			emitter.on('all', network.notifyLink);
		} else {
			enqueueSnackbar(notification.message, { variant: notification.variant, persist: false });
		}
	};
	// Disable reason: Hook used for execution of enq() on change of notification.
	// eslint-disable-next-line react-hooks/exhaustive-deps
	useEffect(enq, [notification]);

	return (
		<AppBar className={classes.appBar} color="primary">
			<Toolbar className={classes.toolbar}>
				<img alt="Badger Header Logo" src={'/assets/badger-full.png'} className={classes.logo} />

				<IconButton className={classes.menuButton} onClick={() => openSidebar()}>
					<Menu />
				</IconButton>
			</Toolbar>
		</AppBar>
	);
});
