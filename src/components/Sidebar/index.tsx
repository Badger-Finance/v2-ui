import React from 'react';
import { observer } from 'mobx-react-lite';
import views from '../../config/routes';
import { useContext } from 'react';
import { StoreContext } from '../../context/store-context';
import { Button, ButtonGroup, List, ListItem, Typography } from "@material-ui/core"
import { makeStyles } from '@material-ui/core/styles';
import { collections } from '../../config/constants';
import { Wallet } from './Wallet';
import { UseWalletProvider } from 'use-wallet'
// import { useSnackbar } from 'notistack';

const useStyles = makeStyles((theme) => ({
	logo: {
		width: "20%",
		minWidth: "4rem",
		margin: theme.spacing(2, 2, 2, 0)
		// display: "block"
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
		height: "100vh",
		// paddingTop: theme.spacing(2),
		marginRight: theme.spacing(-2),
		marginLeft: theme.spacing(-2),
		flexDirection: 'column',
		justifyContent: 'start',
		display: "flex",
		// alignItems: "center",
		flexWrap: 'wrap',
		padding: theme.spacing(2, 2, 1, 1),

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
	}

}));

export const Sidebar = observer(() => {
	const classes = useStyles();

	const store = useContext(StoreContext);
	const { router: { goTo } } = store;

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

			<div className={classes.root}>



				<Wallet />



				<List >
					{renderCollections()}
					<ListItem className={classes.listItem}>Account Overview</ListItem>
				</List>

			</div >
		</UseWalletProvider>
	);
});
