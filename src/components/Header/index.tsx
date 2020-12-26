import React, { useEffect } from 'react';
import { observer } from 'mobx-react-lite';
import views from '../../config/routes';
import { useContext } from 'react';
import { StoreContext } from '../../context/store-context';
import { Button, ButtonGroup, List, ListItem, Typography, Drawer, Toolbar, AppBar, IconButton } from "@material-ui/core"
import { makeStyles } from '@material-ui/core/styles';
import { collections } from '../../config/constants';
import { UseWalletProvider } from 'use-wallet'
import { Menu } from '@material-ui/icons';
import { observe } from 'mobx';
import { useSnackbar } from 'notistack';
// import { useSnackbar } from 'notistack';

const useStyles = makeStyles((theme) => ({
	appBar: {
		justifyContent: 'space-between',
		[theme.breakpoints.up('md')]: {
			display: 'none'
		},
	},
	toolbar: {
		justifyContent: 'space-between',

	},
	logo: {
		height: '2.4rem'
	},
	menuButton: {
		float: "right",
		color: "#000"
	}
}));

export const Header = observer(() => {
	const classes = useStyles();

	const store = useContext(StoreContext);
	const { router: { goTo }, uiState: { sidebarOpen, openSidebar, notification } } = store;
	const { enqueueSnackbar, closeSnackbar } = useSnackbar();

	const enq = () => {
		if (!notification || !notification.message)
			return

		enqueueSnackbar(notification.message, { variant: notification.variant, persist: notification.variant === 'success' })

	}
	useEffect(enq, [notification])

	return (
		<AppBar className={classes.appBar} color="primary">
			<Toolbar className={classes.toolbar}>
				<img src={require('../../assets/badger-full.png')} className={classes.logo} />
				<IconButton className={classes.menuButton} onClick={() => openSidebar()}><Menu /></IconButton>
			</Toolbar>
		</AppBar>
	);
});
