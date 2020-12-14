import React from 'react';
import { observer } from 'mobx-react-lite';
import { useContext } from 'react';
import { StoreContext } from '../../context/store-context';
import views from '../../config/routes';

import { makeStyles } from '@material-ui/core/styles';
import { Typography } from '@material-ui/core';

import {
	Grid, Button, Container, Chip
} from '@material-ui/core';
import { AssetImage } from './AssetImage';
import { AssetInfo } from './AssetInfo';
import { AssetSales } from './AssetSales';
import { ArrowBack, ArrowUpward } from '@material-ui/icons';

import { SnackbarProvider, useSnackbar } from 'notistack';
import { Loader } from '../Loader';
import { VaultCard } from '../Collection/VaultCard';
import { collectionFromJSON } from 'opensea-js/lib/utils/utils';
import { VaultFunction } from '../Collection/VaultFunction';
import { AssetCard } from './AssetCard';


const useStyles = makeStyles((theme) => ({

	assetContainer: {
		paddingRight: theme.spacing(2),
		paddingTop: theme.spacing(2)
	},
	filter: {
		margin: theme.spacing(0, 1, 1, 0)
	},
	filters: {
		margin: theme.spacing(0, 0)
	},

}));
//style
export const Asset = observer(() => {
	const classes = useStyles();
	const { enqueueSnackbar } = useSnackbar();

	const store = useContext(StoreContext);
	const { router: { params, goTo }, app: { vault, collection, addAction, removeAction, provider, increaseAllowance, assets } } = store;

	const goBack = () => goTo(views.collection, { collection: collection?.config.id || '0x' })


	const renderActions = () => {
		return collection.config.abi
			.filter((method: any) => method.type == "function" && (!!!collection.config.config || collection.config.config.actions.includes(method.name)))
			.map((method: any) => <VaultFunction method={method} row={asset} />)
	}
	const renderFilters = () => {
		return collection.config.abi
			.filter((method: any) => method.type == "function" && method.inputs.length > 0)
			.map((method: any) => <Chip color={collection.config.config.actions.includes(method.name) ? 'primary' : 'default'} size="small" className={classes.filter} label={method.name} onClick={() => { addAction(method.name) }} onDelete={collection.config.config.actions.includes(method.name) ? () => removeAction(method.name) : undefined} />)
	}

	if (!vault) {
		return <Loader />
	}
	const underlying = vault[collection.config.config.underlying]
	const yielding = vault[collection.config.config.yielding]
	const asset = assets[underlying]
	const yieldAsset = assets[yielding]

	return (
		<Container maxWidth="lg">
			<Grid container spacing={2} className={classes.assetContainer}>

				<Grid item xs={6}>
					<Button onClick={goBack} startIcon={<ArrowBack />} >{collection.config.title}</Button>
				</Grid>

				<Grid item xs={12} className={classes.filters}>

					<Typography variant="body2" color="textSecondary">{collection.config.id}</Typography>
					<VaultCard row={vault} />

				</Grid>

				<Grid item xs={12} md={6} className={classes.filters}>

					<Typography variant="body2" color="textSecondary">{collection.config.config.underlying}</Typography>
					<AssetCard asset={asset} contract={vault} />

				</Grid>

				<Grid item xs={12} md={6} className={classes.filters}>

					<Typography variant="body2" color="textSecondary">{collection.config.config.yielding}</Typography>
					<AssetCard asset={yieldAsset} contract={vault} />

				</Grid>

				<Grid item xs={12} md={12} className={classes.filters}>
					<Typography variant="body2" color="textSecondary">METHODS</Typography>
					{renderFilters()}
				</Grid>

				{renderActions()}

			</Grid>
		</Container>
	);
});
