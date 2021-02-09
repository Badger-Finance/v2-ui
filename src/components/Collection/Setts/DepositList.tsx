import React, { useContext } from 'react';
import { Typography, List, ListItem } from '@material-ui/core';
import { Vault, Geyser } from 'mobx/model';
import { DepositCard } from './DepositCard';
import _ from 'lodash';
import TableHeader from './TableHeader';
import {
	formatBalanceUnderlying,
	formatBalanceValue,
	formatGeyserBalance,
	formatGeyserBalanceValue,
	formatBalance,
} from 'mobx/reducers/statsReducers';
import { StoreContext } from 'mobx/store-context';

// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
export default function DepositList(props: any) {
	const {
		allSetts,
		contracts,
		classes,
		vaults,
		hideEmpty,
		onOpen,
		period,
		walletBalance,
		depositBalance,
		vaultBalance,
	} = props;
	const store = useContext(StoreContext);
	const {
		uiState: { currency },
	} = store;

	let walletBalances = contracts.map((address: string) => {
		const vault: Vault = vaults[address.toLowerCase()];
		const sett: any = allSetts.find((s: any) => s.address.toLowerCase() === address.toLowerCase());
		let userBalance = vault && vault.underlyingToken ? vault.underlyingToken.balance.toNumber() : 0;
		if (sett && userBalance > 0) {
			return (
				<ListItem key={address} className={classes.listItem}>
					<DepositCard
						isGlobal={!hideEmpty}
						vault={vault}
						sett={sett}
						onOpen={onOpen}
						balance={formatBalance(vault.underlyingToken)}
						balanceValue={formatBalanceValue(vault.underlyingToken, currency)}
					/>
				</ListItem>
			);
		}
	});

	let depositBalances = contracts.map((address: string) => {
		const vault: Vault = vaults[address.toLowerCase()];
		const sett: any = allSetts.find((s: any) => s.address.toLowerCase() === address.toLowerCase());
		let userBalance = vault ? vault.balance.toNumber() : 0;
		if (sett && userBalance > 0) {
			return (
				<ListItem key={address} className={classes.listItem}>
					<DepositCard
						isGlobal={!hideEmpty}
						vault={vault}
						sett={sett}
						onOpen={onOpen}
						balance={formatBalanceUnderlying(vault)}
						balanceValue={formatBalanceValue(vault, currency)}
					/>
				</ListItem>
			);
		}
	});

	let vaultBalances = contracts.map((address: string) => {
		const vault: Vault = vaults[address.toLowerCase()];
		const sett: any = allSetts.find((s: any) => s.address.toLowerCase() === address.toLowerCase());
		const geyser: Geyser | undefined = vault ? vault.geyser : undefined;
		let userBalance = geyser ? geyser.balance.toNumber() : 0;
		if (sett && geyser && userBalance > 0) {
			return (
				<ListItem key={address} className={classes.listItem}>
					<DepositCard
						isGlobal={!hideEmpty}
						vault={vault}
						sett={sett}
						onOpen={onOpen}
						balance={formatGeyserBalance(geyser)}
						balanceValue={formatGeyserBalanceValue(geyser, currency)}
					/>
				</ListItem>
			);
		}
	});

	walletBalances = _.compact(walletBalances);
	depositBalances = _.compact(depositBalances);
	vaultBalances = _.compact(vaultBalances);
	const positions = walletBalances.length + depositBalances.length + vaultBalances.length;

	if (positions > 0)
		return (
			<>
				{walletBalances.length > 0 && (
					<>
						<TableHeader
							title={`Your Wallet - ${walletBalance}`}
							tokenTitle="Available"
							classes={classes}
							period={period}
						/>
						<List key={'wallet' + contracts[0]} className={classes.list}>
							{walletBalances}
						</List>
					</>
				)}
				{depositBalances.length > 0 && (
					<>
						<TableHeader
							title={`Your Vault Deposits - ${depositBalance}`}
							tokenTitle="Tokens"
							classes={classes}
							period={period}
						/>
						<List key={'deposit' + contracts[0]} className={classes.list}>
							{depositBalances}
						</List>
					</>
				)}
				{vaultBalances.length > 0 && (
					<>
						<TableHeader
							title={`Your Staked Amounts - ${vaultBalance}`}
							tokenTitle="Tokens"
							classes={classes}
							period={period}
						/>
						<List key={'vault' + contracts[0]} className={classes.list}>
							{vaultBalances}
						</List>
					</>
				)}
			</>
		);

	return (
		<Typography align="center" variant="subtitle1" color="textSecondary" style={{ margin: '2rem 0' }}>
			Your address does not have tokens to deposit.
		</Typography>
	);
}
