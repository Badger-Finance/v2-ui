import React, { useContext } from 'react';
import { observer } from 'mobx-react-lite';
import { StoreContext } from '../../context/store-context';
import {
	Grid, Card, CardHeader, CardMedia, CardContent, CardActions, CardActionArea, Collapse, Avatar, IconButton,

	Container,
	ButtonGroup,
	Button,
	Paper,
} from '@material-ui/core';
import { Typography } from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';
import { Loader } from '../Loader';
import BigNumber from 'bignumber.js'
import { VaultCard } from './VaultCard';
import _ from 'lodash';
import { AssetCard } from '../Asset/AssetCard';
import { GeyserCard } from './GeyserCard';

const useStyles = makeStyles((theme) => ({

	root: { marginTop: theme.spacing(2), paddingLeft: theme.spacing(28) },
	stat: {
		// textAlign: 'right'
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
	},
	statPaper: {
		padding: theme.spacing(2),
		textAlign: 'center'
	},
	divider: {
		width: "100%",
		borderBottom: `1px solid rgba(255,255,255,.1)`,
		marginBottom: theme.spacing(2)
	},
	before: {
		paddingTop: theme.spacing(2),
		width: "100%"
	}

}));
export const Collection = observer(() => {
	const store = useContext(StoreContext);
	const classes = useStyles();

	const { router: { params, goTo },
		wallet: { provider },
		contracts: { vaults, geysers, tokens },
		uiState: { collection, stats, geyserStats, vaultStats, currency, period, setCurrency, setPeriod } } = store;

	const openAsset = (asset: string) => {
		// goTo(views.asset, { collection: collection.id, id: asset })
	}

	const renderWallet = () => {
		let vaultCards: any[] = []

		if (!tokens)
			return

		// wallet assets & wrapped assets ordered by value
		let balAssets = _.sortBy(vaults, [(vault: any) => {
			let token = tokens[vault[collection.configs.vaults.underlying]]
			return -token.balanceOf
		}])
		vaultCards = _.concat(vaultCards, _.map(balAssets, (contract: any, address: string) => {
			let token = tokens[contract.token]
			let geyser = _.find(geysers, (geyser: any) => geyser.getStakingToken === address)
			const stats = vaultStats

			if (!!token)
				return <>

					<Grid item xs={12} key={address}>
						<VaultCard contract={contract} config={collection.configs.vaults} uiStats={!!stats && stats[contract.address]} />

					</Grid>

				</>
			else {
				return <div>{address}</div>
			}
		}))
		return vaultCards
	}
	const renderGeysers = () => {
		let geyserCards: any[] = []

		if (!tokens)
			return

		// pooled tokens & empty tokens
		let pools = _.sortBy(geysers, [(geyser: any) => {
			let token = tokens[geyser[collection.configs.geysers.underlying]]
			return -token.balanceOf
		}]).filter((geyser: any) => {
			return (!!geyser.totalStakedFor && geyser.totalStakedFor.gt(0))
		})



		geyserCards = _.concat(geyserCards, _.map(pools, (contract: any, address: string) => {
			const vault = vaults[contract[collection.configs.geysers.underlying]]
			const token = tokens[vault.token]
			const stats = geyserStats
			if (!!token)
				return <>

					<Grid item xs={12} key={address}>
						<GeyserCard
							underlying={token}
							contract={contract}
							config={collection.configs.geysers}
							uiStats={!!stats && stats[contract.address]} />
					</Grid>


				</>
			else {
				return <div>{address}</div>
			}
		}))

		return geyserCards
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
			<Grid item xs={6} className={classes.filters}>
				<ButtonGroup variant="outlined" size="small">
					<Button color={currency === "btc" ? 'primary' : 'default'} onClick={() => setCurrency('btc')}>BTC</Button>
					<Button color={currency === "eth" ? 'primary' : 'default'} onClick={() => setCurrency('eth')}>ETH</Button>
					<Button color={currency === "usd" ? 'primary' : 'default'} onClick={() => setCurrency('usd')}>USD</Button>
				</ButtonGroup>
			</Grid>
			<Grid item xs={6} className={classes.filters} style={{ textAlign: 'right' }}>
				<ButtonGroup variant="outlined" size="small">
					<Button color={period === "year" ? 'primary' : 'default'} onClick={() => setPeriod('year')}>Y</Button>
					<Button color={period === "month" ? 'primary' : 'default'} onClick={() => setPeriod('month')}>M</Button>
					<Button color={period === "day" ? 'primary' : 'default'} onClick={() => setPeriod('day')}>D</Button>
				</ButtonGroup>
			</Grid>
			{/* <Grid item xs={3}>
				<Typography variant="h5">{collection.title}</Typography>
				<Typography variant="body1" color="textPrimary">{_.keys(vaults).length + " assets" || "No vaults"}</Typography>
			</Grid>
			<Grid item xs={9} className={classes.stat}>
				<Typography variant="body1" color="textPrimary">Growth</Typography>
				<Typography variant="h5">{stats.growth}</Typography>
			</Grid> */}

			<Grid item xs={6} className={classes.stat}>
				<Paper className={classes.statPaper}>
					<Typography variant="body1" color="textPrimary">TVL</Typography>
					<Typography variant="h5">{stats.tvl}</Typography>
				</Paper>
			</Grid>
			<Grid item xs={6} className={classes.stat}>
				<Paper className={classes.statPaper}>

					<Typography variant="body1" color="textPrimary">Your Portfolio</Typography>
					<Typography variant="h5">{stats.portfolio}</Typography>
				</Paper>

			</Grid>
			<div className={classes.before} />


			<Grid item xs={4} >
				<Typography variant="body2" color="textPrimary">
					Setts
					{!!provider.selectedAddress && ` - ${stats.wallet}`}
				</Typography>

			</Grid>
			<Grid item xs={2}>
				<Typography variant="body2" color="textPrimary">
					Underlying Tokens
				</Typography>

			</Grid>
			<Grid item xs={2} >
				<Typography variant="body2" color="textPrimary">
					{({ year: 'Yearly', day: 'Daily', month: 'Monthly' } as any)[period]} ROI

				</Typography>

			</Grid>

			<Grid item xs={2} >
				<Typography variant="body2" color="textPrimary">
					Balance

				</Typography>

			</Grid>

			{renderWallet()}

			{!!provider.selectedAddress && <>
				<div className={classes.before} />

				<Grid item xs={4} >
					<Typography variant="body2" color="textPrimary">
						Deposits
					{!!provider.selectedAddress && ` - ${stats.geysers}`}

					</Typography>

				</Grid>
				<Grid item xs={2} >
					<Typography variant="body2" color="textPrimary">
						Balance

				</Typography>

				</Grid>
				<Grid item xs={2} >
					<Typography variant="body2" color="textPrimary">
						{({ year: 'Yearly', day: 'Daily', month: 'Monthly' } as any)[period]}
				&nbsp;ROI

				</Typography>

				</Grid>
				<Grid item xs={2} >
					<Typography variant="body2" color="textPrimary">
						Value

				</Typography>

				</Grid>
			</>}
			{renderGeysers()}
		</Grid>


	</Container >

});

