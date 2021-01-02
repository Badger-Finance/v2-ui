import React, { useContext, useEffect, useState } from 'react';
import { observer } from 'mobx-react-lite';
import { StoreContext } from '../../context/store-context';
import {
	Grid,
	List,
	ListItem,
	Dialog,
	DialogTitle,
	CircularProgress,
	DialogContent
} from '@material-ui/core';
import { Typography } from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';
import { Loader } from '../Loader';
import { VaultCard } from './VaultCard';
import _ from 'lodash';
import { VaultStake } from './VaultStake';
import { VaultUnwrap } from './VaultUnwrap';
import { VaultUnstake } from './VaultUnstake';
import { VaultSymbol } from '../VaultSymbol';

import { geysers as geyserConfig, vaults as vaultConfig } from '../../config/system/settSystem'
import Carousel from 'react-material-ui-carousel';

const useStyles = makeStyles((theme) => ({

	list: {
		width: "100%",
		borderRadius: theme.shape.borderRadius,
		overflow: 'hidden',
		border: `1px solid ${theme.palette.grey[900]}`,
		background: `${theme.palette.background.paper}`,
		padding: 0
	},
	listItem: {
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
		// overflow: 'inherit',
		// marginTop: theme.spacing(1)
		width: '100%'
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

	header: {
		padding: theme.spacing(0, -2, 0, 0)
	},
	hiddenMobile: {
		[theme.breakpoints.down('sm')]: {
			display: 'none',
		},
	},
	pendingTx: {
		textAlign: "center",
		padding: theme.spacing(4, 2, 8)
	},
	progress: {
		padding: theme.spacing(0, 0, 2)
	}

}));
export const SettList = observer((props: any) => {
	const store = useContext(StoreContext);
	const classes = useStyles();

	const { hideEmpty, isGlobal } = props

	const { router: { params, goTo },
		wallet: { connectedAddress },
		contracts: { vaults, geysers, tokens },
		uiState: { stats, geyserStats, vaultStats, currency, period, setCurrency, txStatus, setTxStatus, notification } } = store;

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
			let token = tokens[vault[vault.underlyingKey]]
			return (!!vault.balanceOf && vault.balanceOf.gt(0)) || (!!token.balanceOf && token.balanceOf.gt(0))
		}).length > 0
	}

	const renderContracts = (contracts: any, isGeysers: boolean = false, isFeatured: boolean = false, raw: boolean = false) => {

		let list = _.map(contracts, (contract: any, address: string) => {

			let vault = vaults[contract[contract.underlyingKey]]
			let geyser = contract
			let stats = !!geyserStats && geyserStats[contract.address]
			let config = geysers

			if (!vault) {
				vault = contract
				geyser = _.find(geysers, (geyser: any) => geyser.StakingToken === vault.address)
				stats = vaultStats[contract.address]
				config = vaults

			} else
				vault = vaults[contract[contract.underlyingKey]]

			if (!isGeysers)
				return <ListItem key={address} className={classes.listItem}>
					<VaultCard isGlobal={isGlobal} uiStats={stats} onStake={onStake} onUnwrap={onUnwrap} isFeatured={isFeatured} />
				</ListItem>
			else
				return <ListItem key={address} className={classes.listItem}>
					<VaultCard isGlobal={isGlobal} isDeposit uiStats={stats} onStake={onStake} onUnstake={onUnstake} />
				</ListItem>
		})

		if (raw)
			return list
		else
			return <List className={classes.list}>{list}</List>
	}


	const walletVaults = () => {

		let vaultCards: any[] = []

		// wallet assets & wrapped assets ordered by value
		return renderContracts(_.sortBy(vaults, [(vault: any) => {
			let token = tokens[vault[vault.underlyingKey]]
			return !!token && -token.balanceOf
		}]).filter((vaultContract: any) => {
			let rawToken = tokens[vaultContract[vaultContract.underlyingKey]]
			let vault = tokens[vaultContract.address]

			return !!vault && (!!vault.balanceOf && vault.balanceOf.gt(0) || !!rawToken.balanceOf && rawToken.balanceOf.gt(0))
		}))
	}

	const emptyGeysers = () => {

		// wallet assets & wrapped assets ordered by value
		return renderContracts(_.filter(vaults, (vault: any) => {
			return !!vault && (!vault.balanceOf || !vault.balanceOf.gt(0))
		}))
	}

	const renderDeposits = () => {

		// pooled tokens & empty tokens
		console.log(geysers)
		return renderContracts(
			_.sortBy(geysers, [(geyser: any) => {
				let token = tokens[geyser[geyser.underlyingKey]]
				return !!token && -token.balanceOf
			}]).filter((geyser: any) => {
				return !!geyser && (!!geyser.totalStakedFor && geyser.totalStakedFor.gt(0))
			}), true)
	}


	const featuredGeysers = () => {
		// wallet assets & wrapped assets ordered by value
		return renderContracts(_.filter(vaults, (vault: any) => vault.isFeatured), false, true, true)

	}


	if (!vaultStats || !tokens || !vaults || !geysers) {
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
							{isGlobal ? "Tokens Locked" : "Available"}
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

	const pendingTx = (message: string) => {
		return <div className={classes.pendingTx}>
			<div className={classes.progress} >
				<CircularProgress />
			</div>
			<Typography variant="body2" color="textSecondary">{message}</Typography>
		</div>
	}


	const renderModal = () => {

		const { mode, open, contract } = modalProps
		let vault: any = {}
		let component: any = {}
		let title = ""
		if (mode == "stake") {
			vault = vaults[contract]
			title = "Stake " + vault.name

			component = <VaultStake uiStats={vaultStats[contract]} onClose={onClose} />
		} else if (mode == "unstake") {
			let geyser = geysers[contract]
			vault = vaults[geyser[geyser.underlyingKey]]
			title = "Unstake " + vault.name

			component = <VaultUnstake uiStats={geyserStats[contract]} onClose={onClose} />
		} else if (mode == "unwrap") {
			vault = vaults[contract]
			title = "Unwrap " + vault.name

			component = <VaultUnwrap uiStats={vaultStats[contract]} onClose={onClose} />
		}

		return <Dialog key={contract} fullWidth maxWidth={'sm'} open={open} onClose={onClose}>
			<DialogTitle disableTypography >
				<VaultSymbol vault={vault} />

				<Typography variant="body1">
					{title}</Typography>

				<Typography variant="body2" color="textSecondary">
					{vault.symbol}</Typography>

			</DialogTitle>
			<div>
				{txStatus === "pending" ? pendingTx("Awaiting transaction confirmation...") : component}
			</div>
		</Dialog>
	}


	return <>
		{!!connectedAddress && !isGlobal && tableHeader(`Your Wallet - ${stats.wallet}`)}
		{!!connectedAddress && !isGlobal && walletVaults()}
		{!!connectedAddress && !isGlobal && tableHeader(`Deposits - ${stats.geysers}`)}
		{!!connectedAddress && !isGlobal && renderDeposits()}

		{isGlobal && <Carousel className={classes.carousel} indicators={false} navButtonsAlwaysVisible >{featuredGeysers()}</Carousel>}
		{!hideEmpty && tableHeader(`Setts`)}
		{!hideEmpty && emptyGeysers()}

		{renderModal()}
		{spacer()}


	</>

});

