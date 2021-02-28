import React from 'react';
import { observer } from 'mobx-react-lite';
import views from '../../config/routes';
import { useContext } from 'react';
import { StoreContext } from '../../mobx/store-context';
import { Toolbar, AppBar, IconButton } from '@material-ui/core';
import { Menu } from '@material-ui/icons';
import { useStyles } from './HeaderStyle';
import { NotifyHook } from './hooks/NotifyHook';

export const Header = observer(() => {
	const classes = useStyles();

	const store = useContext(StoreContext);
	const {
		router: { goTo },
		uiState: { openSidebar },
	} = store;

	//call Notify Hook
	NotifyHook()

	return (
		<AppBar className={classes.appBar} color="primary">
			<Toolbar className={classes.toolbar} onClick={() => goTo(views.home, { collection: 'badger' })}>
				<IconButton className={classes.menuButton} onClick={() => openSidebar()}>
					<Menu />
				</IconButton>
				<img alt="" src={require('../../assets/badger-full.png')} className={classes.logo} />
			</Toolbar>
		</AppBar>
	);
});
