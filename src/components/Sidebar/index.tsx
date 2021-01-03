import React from 'react';
import { observer } from 'mobx-react-lite';
import views from '../../config/routes';
import { useContext } from 'react';
import { StoreContext } from '../../context/store-context';
import { Button, ButtonGroup, List, ListItem, Typography, Drawer, Chip } from "@material-ui/core"
import { makeStyles } from '@material-ui/core/styles';
import { Wallet } from './Wallet';
import { LocalGasStation } from '@material-ui/icons';
// import { useSnackbar } from 'notistack';

const useStyles = makeStyles((theme) => ({
	logo: {
		height: "2.4rem",
		width: "auto",
		// display: 'block',
		// margin: theme.spacing(2, 2, 0, 2)
	},
	listHeader: {
		fontSize: ".8rem",
		textTransform: "uppercase",
		color: theme.palette.primary.main
	},
	link: {
		color: 'inherit',
		textDecoration: 'none'
	},
	root: {
		padding: theme.spacing(0),
		width: theme.spacing(25),
		display: "flex",
		flexDirection: "column",
		justifyContent: "space-between",
		minHeight: "100%"
	},
	drawer: {
	},
	listItem: {
		cursor: "pointer",
		"&:hover": {
			fontWeight: 'bold'

		},
		// paddingLeft: theme.spacing(1),
		padding: theme.spacing(1, 2)
	},
	activeListItem: {
		fontWeight: 'bold',
		color: theme.palette.primary.main
	},

	currency: {
		marginTop: theme.spacing(1)
	},

	rewards: {
		margin: theme.spacing(0, 0, 0, 1),
	},
	flex: {
		display: 'flex',
		alignItens: 'center'
	}

}));

export const Sidebar = observer(() => {
	const classes = useStyles();

	const store = useContext(StoreContext);
	const { router: { goTo }, uiState: { sidebarOpen, closeSidebar, stats, gasPrice, setGasPrice }, wallet: { gasPrices } } = store;

	// const { enqueueSnackbar } = useSnackbar();

	// useEffect(() => {
	// 	if (!!errorMessage)
	// 		enqueueSnackbar(errorMessage, { variant: 'error' })

	// }, [errorMessage])
	return (
		<Drawer
			variant={window.innerWidth > 960 ? 'persistent' : 'temporary'}
			anchor="left"
			open={sidebarOpen}
			className={classes.drawer}
			onClose={() => closeSidebar()}
		>

			<div className={classes.root}>
				<List >
					<ListItem button className={classes.listItem}>
						<img src={require('../../assets/badger-logo.png')} className={classes.logo} />

					</ListItem>


					<ListItem divider button
						onClick={() => { closeSidebar(); goTo(views.home) }}
						className={classes.listItem + ' ' + (store.router.currentPath === '/' ? classes.activeListItem : '')}>
						Your Portfolio

							{stats.claims[0] !== 0 && <Chip size="small" label={stats.claims[0]} variant="outlined" color="primary" className={classes.rewards} onClick={() => { closeSidebar(); goTo(views.home) }} />}
					</ListItem>

					<ListItem divider button className={classes.listItem + ' ' + (store.router.currentPath == '/setts' ? classes.activeListItem : '')} onClick={() => goTo(views.collection)}>
						Sett Vaults</ListItem>
					<ListItem divider button className={classes.listItem + ' ' + (store.router.currentPath == '/airdrops' ? classes.activeListItem : '')} onClick={() => goTo(views.airdrops)}>Airdrops</ListItem>
					<ListItem divider button disabled className={classes.listItem + ' ' + (store.router.currentPath == '/digg' ? classes.activeListItem : '')} onClick={() => goTo(views.digg)}>Digg
					<Chip size="small" label={"Coming soon"} variant="outlined" color="primary" className={classes.rewards} /></ListItem>

				</List>
				<List disablePadding>
					<ListItem className={classes.listItem} >
						<Wallet />

					</ListItem>
					<ListItem className={classes.listItem} >
						<ButtonGroup variant="outlined" fullWidth>
							<Button size="small" disabled><LocalGasStation style={{ fontSize: '1rem' }} /></Button>

							{['slow', 'standard', 'rapid'].map((speed: string) =>
								<Button variant={gasPrice === speed ? 'contained' : 'outlined'} size="small" onClick={() => setGasPrice(speed)} >{(gasPrices[speed] / 1).toFixed(0)}</Button>
							)}
						</ButtonGroup>

					</ListItem>



				</List>

			</div>
		</Drawer>
	);
});
