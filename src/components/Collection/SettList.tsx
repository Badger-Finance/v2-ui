import React, { useContext, useState } from 'react';
import { observer } from 'mobx-react-lite';
import { StoreContext } from '../../mobx/store-context';
import { Grid, List, ListItem, Dialog, DialogTitle, Tab, Tabs, Switch } from '@material-ui/core';
import { Typography } from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';
import { TokenCard } from './TokenCard';
import _ from 'lodash';
import { VaultDeposit } from './Forms/VaultDeposit';
import { VaultWithdraw } from './Forms/VaultWithdraw';
import { GeyserUnstake } from './Forms/GeyserUnstake';
import { GeyserStake } from './Forms/GeyserStake';
import { VaultSymbol } from '../Common/VaultSymbol';
import { vaultBatches } from 'config/system/vaults';
import { Vault } from 'mobx/model';
import { formatPrice } from 'mobx/reducers/statsReducers';
import { DepositCard } from './DepositCard';
import { Loader } from 'components/Loader';
import { formatUsd } from 'mobx/utils/api';

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

	header: {
		padding: theme.spacing(0, -2, 0, 0),
	},
	hiddenMobile: {
		[theme.breakpoints.down('sm')]: {
			display: 'none',
		},
	},
	chip: {
		marginLeft: theme.spacing(1),
		padding: 0,
	},
	title: {
		// background: 'rgba(0,0,0,.5)',
		padding: theme.spacing(2, 2, 2),
	},
}));
export const SettList = observer((props: any) => {
	const store = useContext(StoreContext);
	const classes = useStyles();

	const { hideEmpty } = props;

	const {
		contracts: { vaults, geysers, tokens, assets, setts, diggSetts },
		uiState: { stats, currency, period },
		wallet: {},
	} = store;

	const [dialogProps, setDialogProps] = useState({ open: false, vault: undefined as any, sett: undefined as any });

	const onOpen = (vault: Vault, sett: any) => {
		setDialogProps({ vault, open: true, sett });
	};

	const onClose = () => {
		// if (txStatus === 'pending')
		// 	return
		setDialogProps({ ...dialogProps, open: false });
	};

	let allSetts: any = undefined;
	if (setts && diggSetts) {
		allSetts = setts.concat(diggSetts);
	}

	const renderAllSetts = () => {
		const sorted = _.sortBy(allSetts, (sett) => {
			return -(allSetts.length - sett.position) || 0;
		});

		const list = _.map(sorted, (sett) => {
			const vault: Vault = vaults[sett.address.toLowerCase()];
			// console.log('vault: \n', vault);
			return (
				<ListItem key={sett.asset} className={classes.listItem}>
					<TokenCard isGlobal={!hideEmpty} sett={sett} onOpen={onOpen} vault={vault} />
				</ListItem>
			);
		});

		if (list.length > 0) return <List className={classes.list}>{list}</List>;
		else return undefined;
	};

	const renderDeposits = (contracts: any) => {
		let list = _.map(contracts, (address: string) => {
			const vault: Vault = vaults[address.toLowerCase()];

			if (!!vault && (!hideEmpty || (!!vault.geyser && vault.geyser.balance.gt(0)) || vault.balance.gt(0)))
				return (
					<ListItem key={address} className={classes.listItem}>
						<DepositCard isGlobal={!hideEmpty} vault={vault} onOpen={onOpen} />
					</ListItem>
				);
		});

		list = _.compact(list);

		if (list.length > 0)
			return (
				<List key={contracts[0]} className={classes.list}>
					{list}
				</List>
			);
		else return undefined;
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

	const [dialogMode, setDialogMode] = useState('vault');
	const [dialogOut, setDialogOut] = useState(false);
	const renderDialog = () => {
		const { open, vault, sett } = dialogProps;

		if (!open) return <div />;

		let form = <VaultDeposit vault={vault} />;
		if (dialogMode === 'vault' && dialogOut) form = <VaultWithdraw vault={vault} />;
		else if (dialogMode == 'geyser' && !dialogOut) form = <GeyserStake vault={vault} />;
		else if (dialogMode == 'geyser' && dialogOut) form = <GeyserUnstake vault={vault} />;

		return (
			<Dialog key={'dialog'} fullWidth maxWidth={'sm'} open={open} onClose={onClose}>
				<DialogTitle disableTypography className={classes.title}>
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

					<VaultSymbol token={sett.asset} />

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
					<Tab onClick={() => setDialogMode('vault')} label={dialogOut ? 'Withdraw' : 'Deposit'}></Tab>
					{vault.geyser ? (
						<Tab onClick={() => setDialogMode('geyser')} label={dialogOut ? 'Unstake' : 'Stake'}></Tab>
					) : (
						<span></span>
					)}
				</Tabs>

				{form}
			</Dialog>
		);
	};

	const all = renderAllSetts();

	const deposits = renderDeposits([
		...vaultBatches[2].contracts,
		...vaultBatches[1].contracts,
		...vaultBatches[0].contracts,
	]);

	const tvl = assets.totalValue ? formatUsd(assets.totalValue) : '$0.00';

	return (
		<>
			{!!all && [
				tableHeader(
					hideEmpty ? `Your Wallet - ${formatPrice(stats.stats.wallet, currency)}` : `All Setts  - ${tvl}`,
					hideEmpty ? 'Available' : 'Tokens',
				),
				all,
			]}
			{!!deposits &&
				hideEmpty &&
				tableHeader(`Your Deposits - ${formatPrice(stats.stats.deposits, currency)}`, 'Tokens')}
			{hideEmpty && deposits}

			{!all && !deposits && (
				<div>
					<Typography align="center" variant="subtitle1" color="textSecondary" style={{ margin: '2rem 0' }}>
						{!hideEmpty ? 'Loading Badger Setts...' : `Your address does not have tokens to deposit.`}
					</Typography>
				</div>
			)}
			{renderDialog()}
			{spacer()}
		</>
	);
});
