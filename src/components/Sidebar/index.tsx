import React from 'react';
import { observer } from 'mobx-react-lite';
import views from '../../config/routes';
import { useContext } from 'react';
import { StoreContext } from '../../context/store-context';
import { Button, ButtonGroup, List, ListItem, Typography, Drawer, Chip } from "@material-ui/core"
import { makeStyles } from '@material-ui/core/styles';
import { collections } from '../../config/constants';
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
		fontWeight: 'bold'
	},

	currency: {
		marginTop: theme.spacing(1)
	},

	rewards: {
		margin: theme.spacing(0, 0, 0, 1)
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


	const renderCollections = () => {
		return collections.map((collection) => {

			return <ListItem divider button key={collection.id} className={classes.listItem + ' ' + (store.router.params?.collection === collection.id ? classes.activeListItem : '')}
				onClick={() => { closeSidebar(); goTo(views.collection, { collection: collection.id }) }}>

				{collection.title}

			</ListItem>
		})
	}

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
					<ListItem button divider
						onClick={() => { closeSidebar(); goTo(views.home) }}
						className={classes.listItem + ' ' + (store.router.currentPath === '/' ? classes.activeListItem : '')}>
						Portfolio

							{stats.claims[0] !== 0 && <Chip size="small" label={stats.claims[0]} variant="outlined" color="primary" className={classes.rewards} onClick={() => { closeSidebar(); goTo(views.home) }} />}
					</ListItem>

					{renderCollections()}
					<ListItem button className={classes.listItem + ' ' + (store.router.currentPath == '/airdrops' ? classes.activeListItem : '')} divider onClick={() => goTo(views.airdrops)}>Airdrops</ListItem>
					<ListItem button className={classes.listItem + ' ' + (store.router.currentPath == '/digg' ? classes.activeListItem : '')} divider onClick={() => goTo(views.digg)}>Digg</ListItem>

				</List>
				<List disablePadding>
					<ListItem className={classes.listItem} >
						<Wallet />

					</ListItem>
					<ListItem className={classes.listItem} >
						<ButtonGroup variant="outlined" fullWidth>
							<Button size="small" disabled><LocalGasStation style={{ fontSize: '1rem' }} /></Button>

							{['slow', 'fast', 'instant'].map((speed: string) =>
								<Button variant={gasPrice === speed ? 'contained' : 'outlined'} size="small" onClick={() => setGasPrice(speed)} >{(gasPrices[speed] / 1).toFixed(0)}</Button>
							)}
						</ButtonGroup>

					</ListItem>



				</List>

			</div>
		</Drawer>
	);
});
