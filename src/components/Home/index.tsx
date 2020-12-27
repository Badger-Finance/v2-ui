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
		textAlign: 'right',
		[theme.breakpoints.up('sm')]: {
			textAlign: 'right'
		},
	},
	buttonGroup: {
		marginRight: theme.spacing(2),
		[theme.breakpoints.up('md')]: {
			marginLeft: theme.spacing(2),
			marginRight: theme.spacing(0),

		},
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
	rewards: {
		// marginTop: theme.spacing(1)
	}

}));
export const Home = observer(() => {
	const store = useContext(StoreContext);
	const classes = useStyles();

	const { router: { params, goTo },
		wallet: { provider },
		contracts: { vaults, geysers, tokens, claimGeysers },
		uiState: { collection, stats, geyserStats, vaultStats, treeStats, currency, setCurrency, period, setPeriod, queueNotification } } = store;

	const [modalProps, setModalProps] = useState({ open: false, mode: '', contract: "0x" })

	if (!provider.selectedAddress) {
		goTo(views.collection, { collection: collections[0].id })
		queueNotification('Please connect your wallet', 'warning')
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

	if (!tokens) {
		return <Loader />
	}

	const spacer = <div className={classes.before} />;


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


	return <Container className={classes.root} >
		{depositModal()}

		<Grid container spacing={2}>
			{spacer}

			<Grid item xs={4} >
				<Typography variant="h5" color="textPrimary" >Account Overview</Typography>
				<Typography variant="subtitle2" color="textPrimary" >Deposit & Earn on your Bitcoin</Typography>
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


			<Grid item xs={12} md={!!stats.badger ? 4 : 6} >
				<Paper className={classes.statPaper}>
					<Typography variant="subtitle1" color="textPrimary">TVL</Typography>
					<Typography variant="h5">{stats.tvl}</Typography>
				</Paper>
			</Grid >
			<Grid item xs={12} md={!!stats.badger ? 4 : 6}>
				<Paper className={classes.statPaper}>
					<Typography variant="subtitle1" color="textPrimary">Your Portfolio</Typography>
					<Typography variant="h5">{stats.portfolio}</Typography>
				</Paper>

			</Grid>
			{!!stats.badger &&
				<Grid item xs={12} md={4}>
					<Paper className={classes.statPaper}>
						<Typography variant="subtitle1" color="textPrimary">Badger Price</Typography>
						<Typography variant="h5">{stats.badger || "..."}</Typography>
					</Paper>

				</Grid>}
			{spacer}

			<Grid item xs={12} md={!!treeStats.claims[1] || !!treeStats.claims[2] ? 6 : 12}>
				<Paper className={classes.statPaper} variant="outlined" style={{ textAlign: 'left' }}>
					<div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
						<div>
							<Typography variant="subtitle1" color="textPrimary">Badger Rewards</Typography>
							<Typography variant="h5">{treeStats.claims[0] || "..."}</Typography>
						</div>
						<div>

							{!!treeStats.claims[0] && <ButtonGroup size="small" className={classes.rewards}>
								<Button variant="outlined" color="primary" onClick={() => { claimGeysers(false) }}>Claim</Button>
								<Button variant="outlined" color="primary" onClick={() => { claimGeysers(true) }}>Claim & Stake</Button>
							</ButtonGroup>}
						</div>
					</div>
				</Paper>

			</Grid>
			{!!treeStats.claims[1] || !!treeStats.claims[2] && <Grid item xs={6} md={6}>
				<Paper className={classes.statPaper} variant="outlined" style={{ textAlign: 'left' }}>
					<Typography variant="body1" color="textPrimary">Other Rewards</Typography>
					{!!treeStats.claims[1] && <Typography variant="body2">{treeStats.claims[1] || "..."}</Typography>}
					{!!treeStats.claims[2] && <Typography variant="body2">{treeStats.claims[2] || "..."}</Typography>}
				</Paper>

			</Grid>}


			<SettList hideEmpty={true} />

		</Grid >


	</Container >

});

