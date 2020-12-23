import React, { useContext, useState } from 'react';
import { observer } from 'mobx-react-lite';
import { StoreContext } from '../../context/store-context';
import {
	Grid,
	Container,
	ButtonGroup,
	Button,
	Paper,
	Dialog,
} from '@material-ui/core';
import { Typography } from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';
import { Loader } from '../Loader';
import { VaultCard } from '../Collection/VaultCard';
import _ from 'lodash';
import { GeyserCard } from '../Collection/GeyserCard';
import { VaultStake } from '../Collection/VaultStake';
import Carousel from 'react-material-ui-carousel'
import { SettList } from '../Collection/SettList';
import { collections } from '../../config/constants';
import views from '../../config/routes';

const useStyles = makeStyles((theme) => ({

	root: {
		marginTop: theme.spacing(11),
		[theme.breakpoints.up('md')]: {
			paddingLeft: theme.spacing(28),
			marginTop: theme.spacing(2),
		},
	},
	filters: {
		textAlign: 'right'
	},
	buttonGroup: {
		marginLeft: theme.spacing(2),
	},

	statPaper: {
		padding: theme.spacing(2),
		textAlign: 'center'
	},
	before: {
		marginTop: theme.spacing(3),
		width: "100%"
	},
	carousel: {
		overflow: 'inherit',
		marginTop: theme.spacing(1)
	},
	featuredHeader: {
		marginBottom: theme.spacing(2)
	},
	indicatorContainer: {
		display: 'none'
	},
	indicator: {
		fontSize: '11px',
		width: '1rem'
	},
	activeIndicator: {
		fontSize: '11px',
		width: '1rem',
		color: '#fff'
	},
	inlineStat: {
		display: 'flex',
		width: "100%",
		justifyContent: 'space-between',
		alignItems: 'center',
		marginTop: theme.spacing(1)
	},
	border: {
		// border: `1px solid ${theme.palette.primary.dark}`,
		background: theme.palette.grey[800],
		margin: theme.spacing(0, 0, 1),
		borderRadius: theme.shape.borderRadius,
		padding: theme.spacing(1, 1),
		alignItems: 'center'
	},

}));
export const Home = observer(() => {
	const store = useContext(StoreContext);
	const classes = useStyles();

	const { router: { params, goTo },
		wallet: { provider },
		contracts: { vaults, geysers, tokens, claimGeysers },
		uiState: { collection, stats, geyserStats, vaultStats, currency, period, setCurrency, setPeriod } } = store;

	const [modalProps, setModalProps] = useState({ open: false, mode: '', contract: "0x" })

	if (!provider.selectedAddress)
		goTo(views.collection, { collection: collections[0].id })


	const renderContracts = (contracts: any, isGeysers: boolean = false, isFeatured: boolean = false) => {

		return _.map(contracts, (contract: any, address: string) => {

			let vault = vaults[contract[collection.configs.geysers.underlying]]
			let geyser = contract
			let stats = !!geyserStats && geyserStats[contract.address]
			let config = collection.configs.geysers

			if (!vault) {
				vault = contract
				geyser = _.find(geysers, (geyser: any) => geyser.getStakingToken === vault.address)
				stats = vaultStats[contract.address]
				config = collection.configs.vaults

			} else
				vault = vaults[contract[collection.configs.geysers.underlying]]

			if (!isGeysers)
				return <Grid item xs={12} key={address}>
					<VaultCard uiStats={stats} onStake={onStake} onUwrap={onUnwrap} isFeatured={isFeatured} />
				</Grid>
			else
				return <Grid item xs={12} key={address}>
					<GeyserCard uiStats={stats} onStake={onStake} onUnstake={onUnstake} />
				</Grid>
		})
	}

	const onUnwrap = (contract: string) => {
		setModalProps({ mode: 'unwrap', contract, open: true })
	}
	const onUnstake = (contract: string) => {
		setModalProps({ mode: 'unstake', contract, open: true })
	}
	const onStake = (contract: string) => {
		setModalProps({ mode: 'stake', contract, open: true })
	}
	const onClose = (contract: string) => {
		setModalProps({ ...modalProps, open: false })
	}

	const walletVaults = () => {

		let vaultCards: any[] = []

		// wallet assets & wrapped assets ordered by value
		return renderContracts(
			_.sortBy(vaults, [(vault: any) => {
				let token = tokens[vault[collection.configs.vaults.underlying]]
				return -token.balanceOf
			}]).filter((geyser: any) => {
				return (!!geyser.balanceOf && geyser.balanceOf.gt(0))
			}))
	}

	const emptyGeysers = () => {

		// wallet assets & wrapped assets ordered by value
		return renderContracts(_.sortBy(vaults, [(vault: any) => {
			let token = tokens[vault[collection.configs.vaults.underlying]]
			return -token.balanceOf
		}]).filter((vault: any) => {
			return (!vault.balanceOf || !vault.balanceOf.gt(0))
		}))
	}

	const featuredGeysers = () => {

		// wallet assets & wrapped assets ordered by value
		return renderContracts(_.sortBy(vaults, [(vault: any) => {
			let token = tokens[vault[collection.configs.vaults.underlying]]
			return -token.balanceOf
		}]).filter((vault: any) => {
			return (!vault.balanceOf || !vault.balanceOf.gt(0))
		}), false, true)
	}
	const renderDeposits = () => {

		// pooled tokens & empty tokens
		return renderContracts(
			_.sortBy(geysers, [(geyser: any) => {
				let token = tokens[geyser[collection.configs.geysers.underlying]]
				return -token.balanceOf
			}]).filter((geyser: any) => {
				return (!!geyser.totalStakedFor && geyser.totalStakedFor.gt(0))
			}), true)
	}

	const renderFilters = () => {
		return []
		// return Object.keys(collection.vaults[0])
		// 	.map((key: string) => <Chip color={collection.config.config.table.includes(key) ? 'primary' : 'default'} size="small" className={classes.filter} label={key} onClick={() => { addFilter(key) }} onDelete={collection.config.config.table.includes(key) ? () => removeFilter(key) : undefined} />)
	}

	if (!tokens) {
		return <Loader />
	}

	const spacer = <div className={classes.before} />;

	const tableHeader = (title: string) => {
		return <>
			<Grid item xs={12} sm={4}>
				<Typography variant="body1" color="textPrimary">
					{title}
				</Typography>

			</Grid>
			<Grid item xs={12} md={3}>
				<Typography variant="body2" color="textSecondary">
					Super Setts
			</Typography>

			</Grid>


		</>
	};


	const depositModal = () => {

		const { mode, open, contract } = modalProps
		let vault: any = {}
		let title: string = ""
		if (mode == "stake") {
			vault = vaultStats[contract]
			title = "Stake"
		} else if (mode == "unstake") {
			vault = geyserStats[contract]
			title = "Unstake"
		} else if (mode == "stake") {
			vault = vaultStats[contract]
			title = "Unwrap"
		}

		return <Dialog fullWidth maxWidth={'sm'} open={open} onClose={onClose}>


			<VaultStake uiStats={vault} onStake={onStake} onUnstake={onUnstake} />
		</Dialog>
	}


	const rewardsBox = <Grid container spacing={2} className={classes.border}>
		<Grid item xs={12} sm={4}>
			<Typography variant="body1">
				{stats.claims[0] || '0.00000'} BADGER
			</Typography>


		</Grid>
		<Grid item xs={12} sm={4}>
			<Typography variant="body1">
				+ {stats.claims[1] || '0.00000'} FARM
			</Typography>
			<Typography variant="body1">
				+ {stats.claims[2] || '0.00000'} renCRV
			</Typography>

		</Grid>
		<Grid item xs={12} sm={4} style={{ textAlign: 'right' }}>
			<ButtonGroup>
				<Button variant="outlined" color="primary" onClick={() => { claimGeysers(false) }}>Claim</Button>
				<Button variant="contained" color="primary" onClick={() => { claimGeysers(true) }}>Claim & Stake</Button>
			</ButtonGroup>

		</Grid>
	</Grid>;

	return <Container className={classes.root} >
		{depositModal()}

		<Grid container spacing={2}>
			{spacer}

			<Grid item xs={4} >
				<Typography variant="h5" color="textPrimary" >Account Overview</Typography>
				<Typography variant="subtitle2" color="textPrimary" >BTC on DeFi</Typography>
			</Grid>

			<Grid item xs={8} className={classes.filters}>

				<ButtonGroup variant="outlined" size="small" className={classes.buttonGroup}>
					{["btc", "eth", "usd"].map((curr: string) =>
						<Button color={currency === curr ? 'primary' : 'default'} onClick={() => setCurrency(curr)}>{curr}</Button>
					)}
				</ButtonGroup>

				<ButtonGroup variant="outlined" size="small" className={classes.buttonGroup}>
					{["day", "month", "year"].map((p: string) =>
						<Button color={period === p ? 'primary' : 'default'} onClick={() => setPeriod(p)}>{p.charAt(0)}</Button>
					)}
				</ButtonGroup >

			</Grid >

			{spacer}

			<Grid item xs={12} md={!!stats.cycle ? 4 : 6} >
				<Paper className={classes.statPaper}>
					<Typography variant="body1" color="textPrimary">TVL</Typography>
					<Typography variant="h5">{stats.tvl}</Typography>
				</Paper>
			</Grid >
			<Grid item xs={12} md={!!stats.cycle ? 4 : 6}>
				<Paper className={classes.statPaper}>
					<Typography variant="body1" color="textPrimary">Your Portfolio</Typography>
					<Typography variant="h5">{stats.portfolio}</Typography>
				</Paper>

			</Grid>
			{!!stats.cycle &&
				<Grid item xs={12} md={4}>
					<Paper className={classes.statPaper}>
						<Typography variant="body1" color="textPrimary">Rewards Cycle</Typography>
						<Typography variant="h5">{stats.cycle}</Typography>
					</Paper>

				</Grid>}

			{stats.claims[0] > 0 && tableHeader("Yield Farming")}

			{stats.claims[0] > 0 && rewardsBox}

			{spacer}

			<SettList hideEmpty={true} />

		</Grid >


	</Container >

});

