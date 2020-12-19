import React, { useContext } from 'react';
import { observer } from 'mobx-react-lite';
import { StoreContext } from '../../context/store-context';
import {
	Grid, Card, CardHeader, CardMedia, CardContent, CardActions, CardActionArea, Collapse, Avatar, IconButton,

	Container,
	ButtonGroup,
	Button,
} from '@material-ui/core';
import { Typography } from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';
import { Loader } from '../Loader';
import BigNumber from 'bignumber.js'
import { VaultCard } from './VaultCard';
import _ from 'lodash';
import { AssetCard } from '../Asset/AssetCard';

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

	const { router: { params, goTo }, contracts: { vaults, geysers, tokens }, uiState: { collection, stats } } = store;

	const openAsset = (asset: string) => {
		// goTo(views.asset, { collection: collection.id, id: asset })
	}

	const renderContracts = () => {
		let vaultCards: any[] = []
		if (!!tokens)
			return _.map(vaults, (contract: any, address: string) => {
				let token = tokens[contract.token]
				let geyser = _.find(geysers, (geyser: any) => geyser.getStakingToken === address)

				if (!!token)
					return <>
						<Grid item xs={4} key={address + 'geyser'}>
							asset
							<AssetCard asset={token} contract={{}} />
						</Grid>
						<Grid item xs={4} key={address}>
							vault
							<VaultCard contract={contract} config={collection.configs.vaults} />

						</Grid>
						<Grid item xs={4} key={address}>
							geyser
							<VaultCard contract={geyser} config={collection.configs.geysers} />

						</Grid>


					</>
				else {
					return <div>{address}</div>
				}
			})
		// if (!!geysers)
		// 	_.mapKeys(geysers, (contract: any, address: string) => {
		// 		vaultCards.push(<Grid item xs={12} key={address}>
		// 			<VaultCard config={collection.configs.geysers} contract={contract} />
		// 		</Grid>)
		// 	})


	}

	const renderFilters = () => {
		return []
		// return Object.keys(collection.vaults[0])
		// 	.map((key: string) => <Chip color={collection.config.config.table.includes(key) ? 'primary' : 'default'} size="small" className={classes.filter} label={key} onClick={() => { addFilter(key) }} onDelete={collection.config.config.table.includes(key) ? () => removeFilter(key) : undefined} />)
	}

	if (!tokens) {
		return <Loader />
	}

	return <Container className={classes.root} >
		<Grid container spacing={2}>
			<Grid item xs={2}>
				<Typography variant="h5">{collection.title}</Typography>
				<Typography variant="body1" color="textSecondary">{_.keys(vaults).length + " assets" || "No vaults"}</Typography>
			</Grid>
			<Grid item xs={2} className={classes.stat}>
				<Typography variant="body1" color="textSecondary">TVL</Typography>
				<Typography variant="h5">{stats.tvl.eth}</Typography>

			</Grid>
			<Grid item xs={2} className={classes.stat}>
				<Typography variant="body1" color="textSecondary">Day</Typography>
				<Typography variant="h5">{stats.growth.day}</Typography>

			</Grid>
			<Grid item xs={2} className={classes.stat}>
				<Typography variant="body1" color="textSecondary">Week</Typography>
				<Typography variant="h5">{stats.growth.week}</Typography>

			</Grid>
			<Grid item xs={2} className={classes.stat}>
				<Typography variant="body1" color="textSecondary">Month</Typography>
				<Typography variant="h5">{stats.growth.month}</Typography>
			</Grid>
			<Grid item xs={2} className={classes.stat}>
				<Typography variant="body1" color="textSecondary">Year</Typography>
				<Typography variant="h5">{stats.growth.year}</Typography>
			</Grid>
			<Grid item xs={6} className={classes.filters}>
				<ButtonGroup variant="outlined" size="small">
					<Button>BTC</Button>
					<Button color="primary">ETH</Button>
					<Button>USD</Button>
				</ButtonGroup>
			</Grid>
			<Grid item xs={6} className={classes.filters} style={{ textAlign: 'right' }}>
				<ButtonGroup variant="outlined" size="small">
					<Button color="primary">Y</Button>
					<Button>M</Button>
					<Button>D</Button>
				</ButtonGroup>
			</Grid>
			{renderContracts()}
		</Grid>

	</Container >

});

