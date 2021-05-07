import { makeStyles, Typography } from '@material-ui/core';
import { Loader } from 'components/Loader';
import { FLAGS } from 'config/constants';
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
	badgerHeadIcon: {
		marginRight: theme.spacing(1),
	},
	boostContainer: {
		display: 'flex',
		justifyContent: 'center',
		alignItems: 'center',
		marginBottom: theme.spacing(4),
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
			{FLAGS.BADGER_BOOST_FLAG && accountDetails && (
				<div className={classes.boostContainer}>
					<img
						className={classes.badgerHeadIcon}
						src="./assets/icons/badger_head.svg"
						height={25}
						width={25}
					/>
					<Typography variant="h5">Badger Boost: {accountDetails.boost.toFixed(2)}</Typography>
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
