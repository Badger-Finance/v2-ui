import React from 'react';
import { observer } from 'mobx-react-lite';
import views from '../../config/routes';
import { useContext } from 'react';
import { StoreContext } from '../../context/store-context';
import { Button, ButtonGroup, List, ListItem, Typography, Drawer } from "@material-ui/core"
import { makeStyles } from '@material-ui/core/styles';
import { collections } from '../../config/constants';
import { Wallet } from './Wallet';
import { UseWalletProvider } from 'use-wallet'
// import { useSnackbar } from 'notistack';

const useStyles = makeStyles((theme) => ({
	logo: {
		height: "2.4rem",
		width: "auto",
		// display: 'block',
		margin: theme.spacing(2, 2, 0, 2)
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
		padding: theme.spacing(2),
		width: theme.spacing(25)

	},
	drawer: {
	},
	listItem: {
		cursor: "pointer",
		"&:hover": {
			fontWeight: 'bold'

		},
		// paddingLeft: theme.spacing(1),
		padding: theme.spacing(1)
	},
	activeListItem: {
		fontWeight: 'bold'
	},

	currency: {
		marginTop: theme.spacing(1)
	},

	rewards: {
		margin: theme.spacing(2, 2, 0, 0)
	},
	flex: {
		display: 'flex',
		alignItens: 'center'
	}

}));

export const Sidebar = observer(() => {
	const classes = useStyles();

	const store = useContext(StoreContext);
	const { router: { goTo }, uiState: { sidebarOpen, closeSidebar, stats } } = store;

	// const { enqueueSnackbar } = useSnackbar();

	// useEffect(() => {
	// 	if (!!errorMessage)
	// 		enqueueSnackbar(errorMessage, { variant: 'error' })

	// }, [errorMessage])


	const renderCollections = () => {
		return collections.map((collection) => {

			return <ListItem key={collection.id} className={classes.listItem + ' ' + (store.router.params?.collection === collection.id ? classes.activeListItem : '')}
				onClick={() => goTo(views.collection, { collection: collection.id })}>

				{collection.title}

			</ListItem>
		})
	}

	return (
		<UseWalletProvider
			chainId={1}
			connectors={{
				// This is how connectors get configured
				portis: { dAppId: 'badger.finance' },
			}}
		>
			<Drawer
				variant={window.innerWidth > 960 ? 'persistent' : 'temporary'}
				anchor="left"
				open={sidebarOpen}
				className={classes.drawer}
				onClose={() => closeSidebar()}
			>
				<div className={classes.flex}>
					<img src={require('../../assets/badger-logo.png')} className={classes.logo} />
					{stats.claims[0] !== 0 &&
						<Button fullWidth variant="outlined" color="primary" size="small" className={classes.rewards} onClick={() => goTo(views.home)}>
							{stats.claims[0]}
							{/* <Typography variant="body2">{stats.claims[1]}</Typography> */}
						</Button>}
				</div>

				<div className={classes.root}>

					<Wallet />




					<List >
						<ListItem
							onClick={() => goTo(views.home)}
							className={classes.listItem + ' ' + (store.router.currentPath === '/' ? classes.activeListItem : '')}>
							Portfolio</ListItem>

						{renderCollections()}
						<ListItem className={classes.listItem}>DIGG</ListItem>
						<ListItem className={classes.listItem}>Hunt</ListItem>
					</List>

				</div >
			</Drawer>
		</UseWalletProvider>
	);
});
