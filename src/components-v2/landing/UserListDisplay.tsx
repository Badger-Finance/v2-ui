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
		setts: { settMap },
		uiState: { currency, period, stats },
		contracts: { vaults },
		wallet: { network },
	} = store;

	if (settMap === undefined) {
		return <Loader message={`Loading ${network.fullName} Setts...`} />;
	}
	if (settMap === null) {
		return <Typography variant="h4">There was an issue loading setts. Try refreshing.</Typography>;
	}
	const walletListItems = network.settOrder
		.map((contract) => {
			const vault = vaults[settMap[contract].vaultToken];
			if (!vault) {
				return null;
			}
			if (vault.underlyingToken.balance.gt(0)) {
				return (
					<SettListItem
						key={`wallet-${settMap[contract].name}`}
						sett={settMap[contract]}
						balance={formatBalance(vault.underlyingToken)}
						balanceValue={formatTokenBalanceValue(vault.underlyingToken, currency)}
						currency={currency}
						period={period}
						onOpen={() => onOpen(vault, settMap[contract])}
					/>
				);
			}
		})
		.filter(Boolean);
	const walletBalance = formatPrice(stats.stats.wallet, currency);

	const depositListItems = network.settOrder
		.map((contract) => {
			const vault = vaults[settMap[contract].vaultToken];
			if (!vault) {
				return null;
			}
			if (vault.balance.gt(0))
				return (
					<SettListItem
						key={`deposit-${settMap[contract].name}`}
						sett={settMap[contract]}
						balance={formatBalanceUnderlying(vault)}
						balanceValue={formatBalanceValue(vault, currency)}
						currency={currency}
						period={period}
						onOpen={() => onOpen(vault, settMap[contract])}
					/>
				);
		})
		.filter(Boolean);
	const depositBalance = formatPrice(stats.stats.deposits, currency);

	const vaultListItems = network.settOrder
		.map((contract) => {
			const vault = vaults[settMap[contract].vaultToken];
			const geyser = vault?.geyser;
			if (geyser && geyser.balance.gt(0))
				return (
					<SettListItem
						key={`deposit-${settMap[contract].name}`}
						sett={settMap[contract]}
						balance={formatGeyserBalance(geyser)}
						balanceValue={formatGeyserBalanceValue(geyser, currency)}
						currency={currency}
						period={period}
						onOpen={() => onOpen(vault, settMap[contract])}
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
