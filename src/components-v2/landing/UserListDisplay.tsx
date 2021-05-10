import { makeStyles, Typography } from '@material-ui/core';
import clsx from 'clsx';
import { Loader } from 'components/Loader';
import { observer } from 'mobx-react-lite';
import {
	formatBalance,
	formatBalanceUnderlying,
	formatBalanceValue,
	formatGeyserBalance,
	formatGeyserBalanceValue,
	formatPrice,
	formatTokenBalanceValue,
} from 'mobx/reducers/statsReducers';
import { StoreContext } from 'mobx/store-context';
import React, { useContext } from 'react';
import SettListItem from './SettListItem';
import { SettListViewProps } from './SettListView';
import SettTable from './SettTable';

const useStyles = makeStyles((theme) => ({
	icon: {
		marginLeft: theme.spacing(4),
		marginRight: theme.spacing(4),
		marginBottom: theme.spacing(4),
		[theme.breakpoints.down('sm')]: {
			marginLeft: theme.spacing(2),
			marginRight: theme.spacing(2),
			marginBottom: theme.spacing(2),
		},
	},
	boostIcon: {
		height: 55,
		width: 55,
		[theme.breakpoints.down('sm')]: {
			height: 38,
			width: 38,
		},
	},
	headIcon: {
		height: 48,
		width: 48,
		[theme.breakpoints.down('sm')]: {
			height: 30,
			width: 30,
		},
	},
	boostContainer: {
		display: 'flex',
		justifyContent: 'center',
		alignItems: 'center',
		marginBottom: theme.spacing(3),
		[theme.breakpoints.down('sm')]: {
			marginBottom: theme.spacing(2),
		},
	},
	boostInfo: {
		flexDirection: 'column',
	},
	boostText: {
		fontSize: '2.5rem',
		[theme.breakpoints.down('sm')]: {
			fontSize: '1.4rem',
		},
	},
	boostRankText: {
		fontSize: '1.3rem',
		[theme.breakpoints.down('sm')]: {
			fontSize: '0.8rem',
		},
	},
}));

const UserListDisplay = observer((props: SettListViewProps) => {
	const classes = useStyles();
	const { onOpen, experimental } = props;
	const store = useContext(StoreContext);
	const {
		setts: { settMap, experimentalMap },
		uiState: { currency, period, stats },
		contracts: { vaults },
		wallet: { network },
		user: { accountDetails },
	} = store;

	const currentSettMap = experimental ? experimentalMap : settMap;

	if (currentSettMap === undefined) {
		return <Loader message={`Loading ${network.fullName} Setts...`} />;
	}
	if (currentSettMap === null) {
		return <Typography variant="h4">There was an issue loading setts. Try refreshing.</Typography>;
	}
	const walletListItems = network.settOrder
		.map((contract) => {
			if (
				!currentSettMap[contract] ||
				!currentSettMap[contract].vaultToken ||
				!vaults[currentSettMap[contract].vaultToken]
			) {
				return null;
			}
			const vault = vaults[currentSettMap[contract].vaultToken];
			if (!vault) {
				return null;
			}
			if (vault.underlyingToken.balance.gt(0)) {
				return (
					<SettListItem
						key={`wallet-${currentSettMap[contract].name}`}
						sett={currentSettMap[contract]}
						balance={formatBalance(vault.underlyingToken)}
						balanceValue={formatTokenBalanceValue(vault.underlyingToken, currency)}
						currency={currency}
						period={period}
						onOpen={() => onOpen(vault, currentSettMap[contract])}
					/>
				);
			}
		})
		.filter(Boolean);
	const walletBalance = formatPrice(stats.stats.wallet, currency);

	const depositListItems = network.settOrder
		.map((contract) => {
			if (!currentSettMap[contract]) return null;
			const vault = vaults[currentSettMap[contract].vaultToken];
			if (!vault) return null;
			if (vault.balance.gt(0))
				return (
					<SettListItem
						key={`deposit-${currentSettMap[contract].name}`}
						sett={currentSettMap[contract]}
						balance={formatBalanceUnderlying(vault)}
						balanceValue={formatBalanceValue(vault, currency)}
						currency={currency}
						period={period}
						onOpen={() => onOpen(vault, currentSettMap[contract])}
					/>
				);
		})
		.filter(Boolean);
	const depositBalance = formatPrice(stats.stats.deposits, currency);

	const vaultListItems = network.settOrder
		.map((contract) => {
			if (!currentSettMap[contract]) return null;
			const vault = vaults[currentSettMap[contract].vaultToken];
			const geyser = vault?.geyser;
			if (geyser && geyser.balance.gt(0))
				return (
					<SettListItem
						key={`deposit-${currentSettMap[contract].name}`}
						sett={currentSettMap[contract]}
						balance={formatGeyserBalance(geyser)}
						balanceValue={formatGeyserBalanceValue(geyser, currency)}
						currency={currency}
						period={period}
						onOpen={() => onOpen(vault, currentSettMap[contract])}
					/>
				);
		})
		.filter(Boolean);
	const vaultBalance = formatPrice(stats.stats.vaultDeposits, currency);

	const displayWallet = walletListItems.length > 0;
	const displayDeposit = depositListItems.length > 0;
	const displayVault = vaultListItems.length > 0;

	return (
		<>
			{accountDetails && (
				<div className={classes.boostContainer}>
					<img className={clsx(classes.icon, classes.headIcon)} src="./assets/icons/badger_head.svg" />
					<div className={clsx(classes.boostInfo, classes.boostContainer)}>
						<Typography className={classes.boostText}>Boost: {accountDetails.boost.toFixed(2)}</Typography>
						<Typography className={classes.boostRankText}>Rank: {accountDetails.boostRank}</Typography>
					</div>
					<img className={clsx(classes.icon, classes.boostIcon)} src="./assets/icons/badger_saiyan.png" />
				</div>
			)}
			{displayWallet && (
				<SettTable
					title={'Your Wallet -'}
					displayValue={walletBalance}
					tokenTitle={'Available'}
					period={period}
					experimental={experimental}
					settList={walletListItems}
				/>
			)}
			{displayDeposit && (
				<SettTable
					title={'Your Vault Deposits -'}
					displayValue={depositBalance}
					tokenTitle={'Available'}
					period={period}
					experimental={experimental}
					settList={depositListItems}
				/>
			)}
			{displayVault && (
				<SettTable
					title={'Your Staked Amounts -'}
					displayValue={vaultBalance}
					tokenTitle={'Available'}
					period={period}
					experimental={experimental}
					settList={vaultListItems}
				/>
			)}
			{!displayWallet && !displayDeposit && !displayVault && (
				<Typography align="center" variant="subtitle1" color="textSecondary">
					Your address does not have tokens to deposit.
				</Typography>
			)}
		</>
	);
});

export default UserListDisplay;
