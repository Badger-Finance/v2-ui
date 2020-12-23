import React, { useContext, useState } from 'react';
import { observer } from 'mobx-react-lite';
import { StoreContext } from '../../context/store-context';
import {
	Grid,

	Dialog,
} from '@material-ui/core';
import { Typography } from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';
import { Loader } from '../Loader';
import { VaultCard } from './VaultCard';
import _ from 'lodash';
import { GeyserCard } from './GeyserCard';
import { VaultStake } from './VaultStake';
import Carousel from 'react-material-ui-carousel'
import { VaultUnwrap } from './VaultUnwrap';
import { VaultUnstake } from './VaultUnstake';

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
export const SettList = observer((props: any) => {
	const store = useContext(StoreContext);
	const classes = useStyles();

	const { hideEmpty } = props

	const { router: { params, goTo },
		wallet: { provider },
		contracts: { vaults, geysers, tokens },
		uiState: { collection, stats, geyserStats, vaultStats, currency, period, setCurrency, setPeriod } } = store;

	const [modalProps, setModalProps] = useState({ open: false, mode: '', contract: "0x" })


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
					<VaultCard uiStats={stats} onStake={onStake} onUnwrap={onUnwrap} isFeatured={isFeatured} />
				</Grid>
			else
				return <Grid item xs={12} key={address}>
					<GeyserCard uiStats={stats} onStake={onStake} onUnstake={onUnstake} />
				</Grid>
		})
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
					Value
			</Typography>

			</Grid>
		</>
	};


	const renderModal = () => {

		const { mode, open, contract } = modalProps
		let vault: any = {}
		let component: any = {}
		if (mode == "stake") {
			vault = vaultStats[contract]
			component = <VaultStake uiStats={vault} onStake={onStake} onUnstake={onUnstake} />
		} else if (mode == "unstake") {
			vault = geyserStats[contract]
			component = <VaultUnstake uiStats={vault} onStake={onStake} onUnstake={onUnstake} />
		} else if (mode == "unwrap") {
			vault = vaultStats[contract]
			component = <VaultUnwrap uiStats={vault} onStake={onStake} onUnstake={onUnstake} />
		}

		return <Dialog fullWidth maxWidth={'sm'} open={open} onClose={onClose}>

			{component}
		</Dialog>
	}


	return <>
		{!!provider.selectedAddress && tableHeader(`Your Wallet - ${stats.wallet}`)}
		{!!provider.selectedAddress && walletVaults()}
		{!!provider.selectedAddress && tableHeader(`Deposits - ${stats.geysers}`)}
		{!!provider.selectedAddress && renderDeposits()}

		{!hideEmpty && tableHeader(`Setts`)}
		{!hideEmpty && emptyGeysers()}

		{renderModal()}

	</>

});

