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
import { AssetCard } from './AssetCard';
import _ from 'lodash';
import { VaultStake } from './VaultStake';
import { VaultUnwrap } from './VaultUnwrap';
import { GeyserUnstake } from './GeyserUnstake';
import { VaultSymbol } from '../VaultSymbol';

import { geysers as geyserConfig, vaults as vaultConfig } from '../../config/system/settSystem'
import Carousel from 'react-material-ui-carousel';

const useStyles = makeStyles((theme) => ({

	list: {
		width: "100%",
		borderRadius: theme.shape.borderRadius,
		overflow: 'hidden',
		// border: `1px solid ${theme.palette.grey[100]}`,
		background: `${theme.palette.background.paper}`,
		padding: 0,
		boxShadow: theme.shadows[1]
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
		width: '100%',
		background: theme.palette.background.paper,
		borderRadius: theme.shape.borderRadius,
		minHeight: '517px',
		boxShadow: theme.shadows[3]
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

	const { hideEmpty } = props

	const { router: { params, goTo },
		wallet: { connectedAddress },
		contracts: { vaults, geysers, tokens },
		uiState: { stats, geyserStats, vaultStats, currency, period, setCurrency, txStatus, setTxStatus, notification } } = store;

	const [dialogProps, setDialogProps] = useState({ open: false, mode: '', stats: undefined as any })

	const [hasDeposits, setHasDeposits] = useState(false)

	useEffect(() => {
		if (txStatus === "success") {
			onClose()
			setTxStatus(undefined)
		}
	}, [txStatus])

	const onUnwrap = (stats: any) => {
		setDialogProps({ mode: 'unwrap', stats, open: true })
	}
	const onUnstake = (stats: any) => {
		setDialogProps({ mode: 'unstake', stats, open: true })
	}
	const onStake = (stats: any) => {
		setDialogProps({ mode: 'stake', stats, open: true })
	}
	const onClose = () => {
		if (txStatus === 'pending')
			return
		setDialogProps({ ...dialogProps, open: false })
	}

	const anyWalletAssets = () => {
		return _.filter(vaults, (vault: any) => {
			let token = tokens[vault[vault.underlyingKey]]
			return (!!vault.balanceOf && vault.balanceOf.gt(0)) || (!!token.balanceOf && token.balanceOf.gt(0))
		}).length > 0
	}

	const renderContracts = (contracts: any,
		isGeysers: boolean = false,
		global: boolean = false) => {

		console.log(contracts, isGeysers, global)

		let list = _.map(contracts, (contract: any) => {


			if (isGeysers) {

				return <ListItem key={contract.address} className={classes.listItem}>
					<AssetCard isGlobal={global} uiStats={contract} onStake={onStake} onUnstake={onUnstake} onUnwrap={onUnwrap} isDeposit />
				</ListItem>
			} else {
				return <ListItem key={contract.address} className={classes.listItem}>
					<AssetCard isGlobal={global} uiStats={contract} onStake={onStake} onUnstake={onUnstake} onUnwrap={onUnwrap} />
				</ListItem>
			}
		})

		return <List className={classes.list}>{list}</List>
	}


	const walletVaults = () => {
		let vaultCards: any[] = []

		// wallet assets & wrapped assets ordered by value
		return renderContracts(stats.assets.wallet, false, false)
	}

	const emptyGeysers = () => {
		return renderContracts(stats.assets.setts, true, true)
	}

	const renderDeposits = () => {
		if (stats.assets.deposits.length > 0 && !hasDeposits)
			setHasDeposits(true)
		return renderContracts(stats.assets.deposits, true, false)
	}


	if (!vaultStats || !tokens || !vaults || !geysers) {
		return <Loader />
	}

	const spacer = () => <div className={classes.before} />;

	const tableHeader = (title: string, tokenTitle: string) => {
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
							{tokenTitle}
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


	const renderDialog = () => {

		const { mode, open, stats } = dialogProps
		let vault: any = {}
		let component: any = {}
		let title = ""

		if (!stats)
			return

		if (mode == "stake") {
			vault = stats.stats.vault

			title = "Stake " + stats.token.name
			component = <VaultStake uiStats={stats.stats} onClose={onClose} />
		} else if (mode == "unstake") {
			let geyser = stats.stats.geyser
			vault = stats.stats.vault

			title = "Unstake " + stats.token.name
			component = <GeyserUnstake uiStats={stats.stats} onClose={onClose} />
		} else if (mode == "unwrap") {
			vault = stats.stats.vault
			title = "Unwrap " + stats.token.name

			component = <VaultUnwrap uiStats={stats.stats} onClose={onClose} />
		}

		return <Dialog key={title} fullWidth maxWidth={'sm'} open={open} onClose={onClose}>
			<DialogTitle disableTypography >
				<VaultSymbol token={stats.token} />

				<Typography variant="body1">
					{title}</Typography>

				<Typography variant="body2" color="textSecondary">
					{stats.token.symbol}</Typography>

			</DialogTitle>
			<div>
				{false ? pendingTx("Awaiting transaction confirmation...") : component}
			</div>
		</Dialog>
	}


	return <>
		{!!connectedAddress && tableHeader(`Your Wallet - ${stats.stats.wallet}`, 'Available')}
		{!!connectedAddress && walletVaults()}
		{!!connectedAddress && hasDeposits && tableHeader(`Deposits - ${stats.stats.geysers}`, 'Deposited')}
		{!!connectedAddress && renderDeposits()}
		{/* {isGlobal && <Carousel className={classes.carousel} indicators={false} navButtonsAlwaysVisible >{featuredGeysers()}</Carousel>} */}
		{!hideEmpty && tableHeader(`All Setts`, 'Tokens')}
		{!hideEmpty && emptyGeysers()}

		{renderDialog()}
		{spacer()}


	</>

});

