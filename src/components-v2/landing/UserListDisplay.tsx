import { Typography } from '@material-ui/core';
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

const UserListDisplay = observer((props: SettListViewProps) => {
	const { onOpen } = props;
	const store = useContext(StoreContext);
	const {
		setts: { settList },
		uiState: { currency, period, stats },
		contracts: { vaults },
	} = store;

	if (settList === undefined) {
		return <Loader message={'Loading Setts...'} />;
	}
	if (settList === null) {
		return <Typography variant="h4">There was an issue loading setts. Try refreshing.</Typography>;
	}

	const walletListItems = settList
		.map((sett) => {
			const vault = vaults[sett.vaultToken];
			if (!vault) {
				return null;
			}
			if (vault.underlyingToken.balance.gt(0)) {
				return (
					<SettListItem
						key={`wallet-${sett.name}`}
						sett={sett}
						balance={formatBalance(vault.underlyingToken)}
						balanceValue={formatTokenBalanceValue(vault.underlyingToken, currency)}
						currency={currency}
						period={period}
						onOpen={() => onOpen(vault, sett)}
					/>
				);
			}
		})
		.filter(Boolean);
	const walletBalance = formatPrice(stats.stats.wallet, currency);

	const depositListItems = settList
		.map((sett) => {
			const vault = vaults[sett.vaultToken];
			if (!vault) {
				return null;
			}
			if (vault.balance.gt(0))
				return (
					<SettListItem
						key={`deposit-${sett.name}`}
						sett={sett}
						balance={formatBalanceUnderlying(vault)}
						balanceValue={formatBalanceValue(vault, currency)}
						currency={currency}
						period={period}
						onOpen={() => onOpen(vault, sett)}
					/>
				);
		})
		.filter(Boolean);
	const depositBalance = formatPrice(stats.stats.deposits, currency);

	const vaultListItems = settList
		.map((sett) => {
			const vault = vaults[sett.vaultToken];
			const geyser = vault?.geyser;
			if (geyser && geyser.balance.gt(0))
				return (
					<SettListItem
						key={`deposit-${sett.name}`}
						sett={sett}
						balance={formatGeyserBalance(geyser)}
						balanceValue={formatGeyserBalanceValue(geyser, currency)}
						currency={currency}
						period={period}
						onOpen={() => onOpen(vault, sett)}
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
			{displayWallet && (
				<SettTable
					title={`Your Wallet - ${walletBalance}`}
					tokenTitle={'Available'}
					period={period}
					settList={walletListItems}
				/>
			)}
			{displayDeposit && (
				<SettTable
					title={`Your Vault Deposits - ${depositBalance}`}
					tokenTitle={'Available'}
					period={period}
					settList={depositListItems}
				/>
			)}
			{displayVault && (
				<SettTable
					title={`Your Staked Amounts - ${vaultBalance}`}
					tokenTitle={'Available'}
					period={period}
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
