import React, { useContext } from 'react';
import { Grid, IconButton, makeStyles } from '@material-ui/core';
import NetworkGasWidget from '../common/NetworkGasWidget';
import WalletWidget from '../common/WalletWidget';
import { observer } from 'mobx-react-lite';
import { StoreContext } from '../../mobx/store-context';

const useStyles = makeStyles({
	menuIcon: {
		margin: -12,
		marginRight: 17,
	},
	badgerIcon: {
		width: '28px',
		height: '28px',
	},
	buttons: {
		display: 'flex',
		justifyContent: 'flex-end',
		'& button': {
			height: 37,
		},
	},
});

export const NavbarMobileRow = observer((): JSX.Element => {
	const { uiState } = useContext(StoreContext);
	const classes = useStyles();
	return (
		<Grid container justifyContent="space-between">
			<Grid item xs container alignItems="center">
				<IconButton className={classes.menuIcon} onClick={() => uiState.openSidebar()}>
					<img src="/assets/icons/mobile-drawer-icon.svg" alt="open menu" />
				</IconButton>
				<img className={classes.badgerIcon} alt="Badger Logo" src="/assets/icons/badger_head.svg" />
			</Grid>
			<Grid item container xs={8} className={classes.buttons} spacing={2}>
				<Grid item>
					<NetworkGasWidget />
				</Grid>
				<Grid item>
					<WalletWidget />
				</Grid>
			</Grid>
		</Grid>
	);
});
