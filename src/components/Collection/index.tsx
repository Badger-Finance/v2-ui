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
	DialogTitle,
} from '@material-ui/core';
import { Typography } from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';
import { Loader } from '../Loader';
import { VaultCard } from './VaultCard';
import _ from 'lodash';
import { GeyserCard } from './GeyserCard';
import { VaultStake } from './VaultStake';
import Carousel from 'react-material-ui-carousel'
import { SettList } from './SettList';

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
	}

}));
export const Collection = observer(() => {
	const store = useContext(StoreContext);
	const classes = useStyles();

	const { router: { params, goTo },
		wallet: { provider },
		contracts: { vaults, geysers, tokens },
		uiState: { collection, stats, geyserStats, vaultStats, currency, period, setCurrency, setPeriod } } = store;

	const [modalProps, setModalProps] = useState({ open: false, mode: '', contract: "0x" })


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
			<Grid item xs={12} sm={4} md={2}>
				<Typography variant="body2" color="textSecondary">
					Tokens Locked
			</Typography>

			</Grid>
			<Grid item xs={12} sm={4} md={2}>
				<Typography variant="body2" color="textSecondary">
					{({ year: 'Yearly', day: 'Daily', month: 'Monthly' } as any)[period]} ROI

			</Typography>

			</Grid>

			<Grid item xs={12} sm={6} md={2}>
				<Typography variant="body2" color="textSecondary">
					Tokens Locked
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
			title = "Stake " + vault.name
		} else if (mode == "unstake") {
			vault = geyserStats[contract]
			title = "Unstake " + vault.name
		} else if (mode == "stake") {
			vault = vaultStats[contract]
			title = "Unwrap " + vault.name
		}

		return <Dialog fullWidth maxWidth={'sm'} open={open} onClose={onClose}>
			<DialogTitle>
				{title}
			</DialogTitle>

			<VaultStake uiStats={vault} onStake={onStake} onUnstake={onUnstake} />
		</Dialog>
	}


	return <Container className={classes.root} >
		{depositModal()}
		<Grid container spacing={2}>
			{spacer}

			<Grid item xs={4} >
				<Typography variant="h5" color="textPrimary" >Badger Setts</Typography>
				<Typography variant="subtitle2" color="textPrimary" >Wrap, stake & earn Badger</Typography>
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

			<Grid item xs={12} md={!!stats.badger ? 4 : 6} >
				<Paper className={classes.statPaper}>
					<Typography variant="body1" color="textPrimary">TVL</Typography>
					<Typography variant="h5">{stats.tvl}</Typography>
				</Paper>
			</Grid >
			<Grid item xs={12} md={!!stats.badger ? 4 : 6}>
				<Paper className={classes.statPaper}>
					<Typography variant="body1" color="textPrimary">Your Portfolio</Typography>
					<Typography variant="h5">{stats.portfolio}</Typography>
				</Paper>

			</Grid>
			{!!stats.badger &&
				<Grid item xs={12} md={4}>
					<Paper className={classes.statPaper}>
						<Typography variant="body1" color="textPrimary">Badger Price</Typography>
						<Typography variant="h5">{stats.badger}</Typography>
					</Paper>

				</Grid>}

			<Grid item xs={12} >
				<Typography variant="body1" color="textPrimary" className={classes.featuredHeader}>Featured</Typography>

				<Carousel
					interval={10000}
					className={classes.carousel}
					navButtonsAlwaysVisible
					indicatorContainerProps={{
						className: classes.indicatorContainer,
						style: {}
					}}
					indicatorProps={{
						className: classes.indicator,
						style: {}
					}}
					activeIndicatorProps={{
						className: classes.activeIndicator,
						style: {}
					}}

				>
					{featuredGeysers()}
				</Carousel>
			</Grid >


			{spacer}

			<SettList />

		</Grid >


	</Container >

});

