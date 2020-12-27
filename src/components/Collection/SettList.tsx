import React, { useContext, useEffect, useState } from 'react';
import { observer } from 'mobx-react-lite';
import { StoreContext } from '../../context/store-context';
import {
	Grid,
	List,
	ListItem,
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
import { VaultUnwrap } from './VaultUnwrap';
import { VaultUnstake } from './VaultUnstake';
import { VaultSymbol } from '../VaultSymbol';

const useStyles = makeStyles((theme) => ({

	list: {
		width: "100%",
		borderRadius: theme.shape.borderRadius,
		overflow: 'hidden',
		border: `1px solid ${theme.palette.grey[800]}`,
		padding: 0
	},
	listItem: {
		border: `1px solid ${theme.palette.grey[800]}`,
		marginBottom: '-1px',
		padding: 0,
		'&:last-child div': {
			borderBottom: 0
		}
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
	assetTable: {
		marginTop: '-1px'
	},
	header: {
		padding: theme.spacing(0, -2, 0, 0)
	},
	hiddenMobile: {
		[theme.breakpoints.down('sm')]: {
			display: 'none',
		},
	}

}));
export const SettList = observer((props: any) => {
	const store = useContext(StoreContext);
	const classes = useStyles();

	const { hideEmpty, isGlobal } = props

	const { router: { params, goTo },
		wallet: { connectedAddress },
		contracts: { vaults, geysers, tokens },
		uiState: { collection, stats, geyserStats, vaultStats, currency, period, setCurrency, txStatus, setTxStatus } } = store;

	const [modalProps, setModalProps] = useState({ open: false, mode: '', contract: "0x" })

	useEffect(() => {
		if (txStatus === "success") {
			onClose()
			setTxStatus(undefined)
		}
	}, [txStatus])

	const onUnwrap = (contract: string) => {
		setModalProps({ mode: 'unwrap', contract, open: true })
		console.log(modalProps)
	}
	const onUnstake = (contract: string) => {
		setModalProps({ mode: 'unstake', contract, open: true })
	}
	const onStake = (contract: string) => {
		setModalProps({ mode: 'stake', contract, open: true })
	}
	const onClose = () => {
		if (txStatus === 'pending')
			return
		setModalProps({ ...modalProps, open: false })
	}
	const anyWalletAssets = () => {
		return _.filter(vaults, (vault: any) => {
			let token = tokens[vault[collection.configs.vaults.underlying]]
			return (!!vault.balanceOf && vault.balanceOf.gt(0)) || (!!token.balanceOf && token.balanceOf.gt(0))
		}).length > 0
	}

	const renderContracts = (contracts: any, isGeysers: boolean = false, isFeatured: boolean = false) => {

		let list = _.map(contracts, (contract: any, address: string) => {

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
				return <Grid item xs={12} key={address} className={classes.assetTable}>
					<VaultCard uiStats={stats} onStake={onStake} onUnwrap={onUnwrap} isFeatured={isFeatured} />
				</Grid>
			else
				return <Grid item xs={12} key={address} className={classes.assetTable}>
					<GeyserCard uiStats={stats} onStake={onStake} onUnstake={onUnstake} />
				</Grid>
		})

		return <List className={classes.list}>{list}</List>
	}


	const walletVaults = () => {

		let vaultCards: any[] = []

		// wallet assets & wrapped assets ordered by value
		return renderContracts(
			_.sortBy(vaults, [(vault: any) => {
				let token = tokens[vault[collection.configs.vaults.underlying]]
				return -token.balanceOf
			}]).filter((vault: any) => {
				let token = tokens[vault[collection.configs.vaults.underlying]]
				return (!!vault.balanceOf && vault.balanceOf.gt(0)) || (!!token.balanceOf && token.balanceOf.gt(0))
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

	const spacer = () => <div className={classes.before} />;


	const tableHeader = (title: string) => {
		return <>
			{spacer()}
			<Grid item xs={12}>
				<Grid container className={classes.header}>
					<Grid item xs={12} sm={4}>
						<Typography variant="body1" color="textPrimary">
							{title}
						</Typography>

					</Grid>
					<Grid item xs={12} sm={4} md={2} className={classes.hiddenMobile}>
						<Typography variant="body2" color="textSecondary">
							Tokens Locked
						</Typography>

					</Grid>
					<Grid item xs={12} sm={4} md={2} className={classes.hiddenMobile}>
						<Typography variant="body2" color="textSecondary">
							{({ year: 'Yearly', day: 'Daily', month: 'Monthly' } as any)[period]} ROI

						</Typography>

					</Grid>

					<Grid item xs={12} sm={6} md={2} className={classes.hiddenMobile}>
						<Typography variant="body2" color="textSecondary">
							Value
						</Typography>

					</Grid>
				</Grid>
			</Grid>

		</>
	};


	const renderModal = () => {

		const { mode, open, contract } = modalProps
		let vault: any = {}
		let component: any = {}
		let title = ""
		if (mode == "stake") {
			vault = vaultStats[contract]
			title = "Stake " + vault.name

			component = <VaultStake uiStats={vault} onClose={onClose} />
		} else if (mode == "unstake") {
			vault = geyserStats[contract]
			title = "Unstake " + vault.name

			component = <VaultUnstake uiStats={vault} onClose={onClose} />
		} else if (mode == "unwrap") {
			vault = vaultStats[contract]
			title = "Unwrap " + vault.name

			component = <VaultUnwrap uiStats={vault} onClose={onClose} />
		}

		return <Dialog key={contract} fullWidth maxWidth={'sm'} open={open} onClose={onClose}>
			<DialogTitle disableTypography >
				<VaultSymbol symbol={vault.symbol} />

				<Typography variant="body1">
					{title}
				</Typography>
				<Typography variant="body2" color="textSecondary">
					{vault.symbol}
				</Typography>

			</DialogTitle>

			{component}
		</Dialog>
	}


	return <>
		{!!connectedAddress && tableHeader(`Your Wallet - ${stats.wallet}`)}
		{!!connectedAddress && walletVaults()}
		{!!connectedAddress && tableHeader(`Deposits - ${stats.geysers}`)}
		{!!connectedAddress && renderDeposits()}

		{!hideEmpty && tableHeader(`Setts`)}
		{!hideEmpty && emptyGeysers()}

		{renderModal()}
		{spacer()}


	</>

});

