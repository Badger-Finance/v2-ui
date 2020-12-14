import React, { useContext } from 'react';
import { map } from 'lodash';
import { observer } from 'mobx-react-lite';
import views from '../../config/routes';
import { StoreContext } from '../../context/store-context';
import { OpenSeaAsset } from 'opensea-js/lib/types';
import {
	Grid, CircularProgress, Card, CardHeader, CardMedia, CardContent, CardActions, CardActionArea, Collapse, Avatar, IconButton,
	TableContainer,
	TableBody,
	Table,
	TableHead,
	TableRow,
	TableCell,
	Container,
	Chip
} from '@material-ui/core';
import { Typography } from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';
import { Loader } from '../Loader';
import BigNumber from 'bignumber.js'
import { VaultCard } from './VaultCard';

const useStyles = makeStyles((theme) => ({

	root: { marginTop: theme.spacing(2) },
	stat: {
		textAlign: 'right'
	},
	card: {
		overflow: 'hidden',
		padding: theme.spacing(0, 2, 2, 2)
	},
	filters: {
		margin: theme.spacing(2, 0, 0)
	},
	filter: {
		margin: theme.spacing(0, 1, 1, 0)
	}

}));
export const Collection = observer(() => {
	const store = useContext(StoreContext);
	const classes = useStyles();

	const { router: { params, goTo }, app: { collection, removeFilter, addFilter } } = store;

	const openAsset = (asset: string) => {
		goTo(views.asset, { collection: collection.config.id, id: asset })
	}

	const renderRows = () => {
		return collection!.vaults.map((row: any) => {
			return <Grid item xs={12}><VaultCard row={row} /></Grid>

		})

	}

	const renderFilters = () => {
		return Object.keys(collection.vaults[0])
			.map((key: string) => <Chip color={collection.config.config.table.includes(key) ? 'primary' : 'default'} size="small" className={classes.filter} label={key} onClick={() => { addFilter(key) }} onDelete={collection.config.config.table.includes(key) ? () => removeFilter(key) : undefined} />)
	}

	if (!collection) {
		return <Loader />
	}

	return <Container className={classes.root} >
		<Grid container xs={12} spacing={2}>
			<Grid item xs={4}>
				<Typography variant="h5">{collection.config.title}</Typography>
				<Typography variant="body1" color="textSecondary">{collection.vaults.length > 0 ? collection.vaults.length + ' Vaults' : 'No vaults'}</Typography>
			</Grid>
			<Grid item xs={2} className={classes.stat}>
				<Typography variant="body1" color="textSecondary">TVL</Typography>
				<Typography variant="h5">...</Typography>

			</Grid>
			<Grid item xs={2} className={classes.stat}>
				<Typography variant="body1" color="textSecondary">Week</Typography>
				<Typography variant="h5">...%</Typography>

			</Grid>
			<Grid item xs={2} className={classes.stat}>
				<Typography variant="body1" color="textSecondary">Month</Typography>
				<Typography variant="h5">...%</Typography>

			</Grid>
			<Grid item xs={2} className={classes.stat}>
				<Typography variant="body1" color="textSecondary">All-Time</Typography>
				<Typography variant="h5">...%</Typography>

			</Grid>
			<Grid item xs={12} className={classes.filters}>
				<Typography variant="body2" color="textSecondary">PROPERTIES</Typography>

				{renderFilters()}
			</Grid>
			{renderRows()}
		</Grid>

	</Container >

});

