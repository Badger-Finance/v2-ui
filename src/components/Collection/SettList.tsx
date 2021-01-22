import React, { useContext, useEffect, useState } from 'react';
import { observer } from 'mobx-react-lite';
import { StoreContext } from '../../mobx/store-context';
import {
	Grid,
	List,
	ListItem,
	Dialog,
	DialogTitle,
	CircularProgress,
	Chip,
	Tab,
	Tabs,
	Tooltip,
	FormControlLabel,
	Switch,
} from '@material-ui/core';
import { Typography } from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';
import { Loader } from '../Loader';
import { TokenCard } from './TokenCard';
import _ from 'lodash';
import { VaultDeposit } from './VaultDeposit';
import { VaultWithdraw } from './VaultWithdraw';
import { GeyserUnstake } from './GeyserUnstake';
import { GeyserStake } from './GeyserStake';
import { VaultSymbol } from '../VaultSymbol';
import { vaultBatches } from 'config/system/contracts';
import { Vault } from 'mobx/reducers/contractReducers';
import { formatPrice } from 'mobx/reducers/statsReducers';
import { DepositCard } from './DepositCard';
import useInterval from '@use-it/interval';

const useStyles = makeStyles((theme) => ({
	list: {
		width: '100%',
		borderRadius: theme.shape.borderRadius,
		overflow: 'hidden',
		// border: `1px solid ${theme.palette.grey[100]}`,
		background: `${theme.palette.background.paper}`,
		padding: 0,
		boxShadow: theme.shadows[1],
		marginBottom: theme.spacing(1),
	},
	listItem: {
		padding: 0,
		'&:last-child div': {
			borderBottom: 0,
		},
	},
	before: {
		marginTop: theme.spacing(3),
		width: '100%',
	},
	carousel: {
		// overflow: 'inherit',
		// marginTop: theme.spacing(1)
		width: '100%',
		background: theme.palette.background.paper,
		borderRadius: theme.shape.borderRadius,
		minHeight: '517px',
		boxShadow: theme.shadows[3],
	},
	featuredHeader: {
		marginBottom: theme.spacing(2),
	},
	indicatorContainer: {
		display: 'none',
	},
	indicator: {
		fontSize: '11px',
		width: '1rem',
	},
	activeIndicator: {
		fontSize: '11px',
		width: '1rem',
		color: '#fff',
	},

	header: {
		padding: theme.spacing(0, -2, 0, 0),
	},
	hiddenMobile: {
		[theme.breakpoints.down('sm')]: {
			display: 'none',
		},
	},
	pendingTx: {
		textAlign: 'center',
		padding: theme.spacing(4, 2, 8),
	},
	progress: {
		padding: theme.spacing(0, 0, 2),
	},
	chip: {
		marginLeft: theme.spacing(1),
		padding: 0,
	},
}));
export const SettList = observer((props: any) => {
	const store = useContext(StoreContext);
	const classes = useStyles();

	const { hideEmpty } = props;

	const {
		router: { params, goTo },
		wallet: { connectedAddress },
		contracts: { vaults, geysers, tokens },
		uiState: { stats, geyserStats, vaultStats, currency, period, setCurrency, txStatus, setTxStatus, notification },
	} = store;

	const [dialogProps, setDialogProps] = useState({ open: false, vault: undefined as any });

	const [hasDeposits, setHasDeposits] = useState(false);

	const onOpen = (vault: Vault) => {
		setDialogProps({ vault, open: true });
	};

	const onClose = () => {
		// if (txStatus === 'pending')
		// 	return
		setDialogProps({ ...dialogProps, open: false });
	};

	const renderVaults = (contracts: any) => {

		let filtered = _.filter(contracts, (address: string) => {
			const vault: Vault = vaults[address.toLowerCase()];
			return (!!vault && (!hideEmpty || vault.underlyingToken.balance.gt(0)))
		});
		let sorted = _.sortBy(filtered, 'position')


		let list = _.map(sorted, (address: string) => {
			const vault: Vault = vaults[address.toLowerCase()];

			return (<ListItem key={address} className={classes.listItem}>
				<TokenCard isGlobal={!hideEmpty} vault={vault} onOpen={onOpen} />
			</ListItem>
			);
		});

		if (list.length > 0)
			return (
				<List key={contracts[0]} className={classes.list}>
					{list}
				</List>
			);
		else
			return undefined
	};

	const renderDeposits = (contracts: any) => {
		let list = _.map(contracts, (address: string) => {
			const vault: Vault = vaults[address.toLowerCase()];

			if (!!vault && !!vault.geyser && (!hideEmpty || (vault.geyser.balance.gt(0) || vault.balance.gt(0))))
				return (<ListItem key={address} className={classes.listItem}>
					<DepositCard isGlobal={!hideEmpty} vault={vault} onOpen={onOpen} />
				</ListItem>
				);
		});

		list = _.compact(list)

		if (list.length > 0)
			return (
				<List key={contracts[0]} className={classes.list}>
					{list}
				</List>
			);
		else
			return undefined

	};

	if (!tokens || !vaults || !geysers) {
		return <Loader />;
	}

	const spacer = () => <div className={classes.before} />;

	const tableHeader = (title: string, tokenTitle: string) => {
		return (
			<>
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
							<Typography variant="body2" color="textPrimary">
								Value
							</Typography>
						</Grid>
					</Grid>
				</Grid>
			</>
		);
	};

	const pendingTx = (message: string) => {
		return (
			<div className={classes.pendingTx}>
				<div className={classes.progress}>
					<CircularProgress />
				</div>
				<Typography variant="body2" color="textSecondary">
					{message}
				</Typography>
			</div>
		);
	};

	const [dialogMode, setDialogMode] = useState('vault');
	const [dialogOut, setDialogOut] = useState(false);
	const renderDialog = () => {
		const { open, vault } = dialogProps;

		if (!open) return <div />;

		let form = <VaultDeposit vault={vault} />;
		if (dialogMode === 'vault' && dialogOut) form = <VaultWithdraw vault={vault} />;
		else if (dialogMode == 'geyser' && !dialogOut) form = <GeyserStake vault={vault} />;
		else if (dialogMode == 'geyser' && dialogOut) form = <GeyserUnstake vault={vault} />;

		return (
			<Dialog key={'dialog'} fullWidth maxWidth={'sm'} open={open} onClose={onClose}>

				<DialogTitle disableTypography style={{ background: 'rgba(0,0,0,.2)' }}>

					<div style={{ float: 'right' }}>
						{dialogOut ? 'Withdraw' : 'Deposit'}
						<Switch
							checked={!dialogOut}
							onChange={() => {
								setDialogOut(!dialogOut);
							}}
							color="primary"
						/>

					</div>
					<VaultSymbol token={vault.underlyingToken} />

					<Typography variant="body1" color="textPrimary" component="div">
						{vault.underlyingToken.name}
					</Typography>
					<Typography variant="body2" color="textSecondary" component="div">
						{vault.underlyingToken.symbol}
					</Typography>

				</DialogTitle>
				<Tabs
					variant="fullWidth"
					indicatorColor="primary"
					value={['vault', 'geyser'].indexOf(dialogMode)}
					style={{ background: 'rgba(0,0,0,.2)', marginBottom: '1rem' }}
				>
					<Tab
						onClick={() => setDialogMode('vault')} label={dialogOut ? 'Withdraw' : 'Deposit'}></Tab>
					{vault.geyser ? (
						<Tab onClick={() => setDialogMode('geyser')} label={dialogOut ? 'Unstake' : 'Stake'}></Tab>
					) : (
							<Tooltip
								enterDelay={0}
								leaveDelay={300}
								arrow
								placement="bottom"
								title={`Staking not enabled for ${vault.underlyingToken.symbol}`}
							>
								<Tab label={dialogOut ? '2. Unstake' : '1. Stake'}></Tab>
							</Tooltip>
						)}
				</Tabs>


				{form}


			</Dialog>
		);
	};

	let all = renderVaults([...vaultBatches[2].contracts, ...vaultBatches[1].contracts, ...vaultBatches[0].contracts])
	let deposits = renderDeposits([...vaultBatches[2].contracts, ...vaultBatches[1].contracts, ...vaultBatches[0].contracts])

	return (
		<>
			{/* {!!connectedAddress && hasDeposits && tableHeader(`Deposits - ${stats.stats.deposits}`, 'Deposited')}
			{!!connectedAddress && renderDeposits()} */}
			{!!all && [tableHeader(
				hideEmpty
					? `Your Wallet - ${formatPrice(stats.stats.wallet, currency)}`
					: `All Setts  - ${formatPrice(stats.stats.tvl, currency)}`,
				hideEmpty ? 'Available' : 'Tokens',
			), all]}
			{!!deposits && hideEmpty && tableHeader(
				`Your Deposits - ${formatPrice(stats.stats.deposits, currency)}`,
				'Tokens',
			)}
			{hideEmpty && deposits}

			{!all && !deposits && <div>
				<Typography align="center" variant="subtitle1" color="textSecondary" style={{ margin: '2rem 0' }}>There are tokens to display at this time.</Typography>
			</div>}
			{/* {isGlobal && <Carousel className={classes.carousel} indicators={false} navButtonsAlwaysVisible >{featuredGeysers()}</Carousel>} */}
			{/* {!hideEmpty && tableHeader(`All Setts`, 'Tokens')}
		{!hideEmpty && emptyGeysers()} */}

			{renderDialog()}
			{spacer()}
		</>
	);
});
