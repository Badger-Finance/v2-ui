import React from 'react';
import { Typography, List, ListItem } from '@material-ui/core';
import { Vault, Geyser } from 'mobx/model';
import { DepositCard } from './DepositCard';
import _ from 'lodash';
import TableHeader from './TableHeader';
import BigNumber from "bignumber.js";

// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
export default function DepositList(props: any) {
	const { allSetts, contracts, classes, vaults, hideEmpty, onOpen, period, walletBalance } = props;
	
	let walletBalances = contracts.map((address: string) => {
		const vault: Vault = vaults[address.toLowerCase()];
		const sett: any = allSetts.find((s: any) => s.address.toLowerCase() === address.toLowerCase());
		let userBalance = vault && vault.underlyingToken ? vault.underlyingToken.balance.toNumber() : 0;
		if (sett && userBalance > 0) {
			userBalance /= Math.pow(10, vault.underlyingToken.decimals);
			return (
				<ListItem key={address} className={classes.listItem}>
					<DepositCard isGlobal={!hideEmpty} vault={vault} sett={sett}
						onOpen={onOpen} balance={userBalance} balanceToken={vault.underlyingToken} />
				</ListItem>
			);
		}
	});

	let depositBalances = contracts.map((address: string) => {
		const vault: Vault = vaults[address.toLowerCase()];
		const sett: any = allSetts.find((s: any) => s.address.toLowerCase() === address.toLowerCase());
		let userBalance = vault ? vault.balance.toNumber() : 0;
		if (sett && userBalance > 0) {
			userBalance /= Math.pow(10, vault.decimals);
			return (
				<ListItem key={address} className={classes.listItem}>
					<DepositCard isGlobal={!hideEmpty} vault={vault} sett={sett}
						onOpen={onOpen} balance={userBalance} balanceToken={vault} />
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
			userBalance /= Math.pow(10, vault.decimals);
			return (
				<ListItem key={address} className={classes.listItem}>
					<DepositCard isGlobal={!hideEmpty} vault={vault} sett={sett}
						onOpen={onOpen} balance={userBalance} balanceToken={geyser} />
				</ListItem>
			);
		}
	});

	walletBalances = _.compact(walletBalances);
	depositBalances = _.compact(depositBalances);
	vaultBalances = _.compact(vaultBalances);
	console.log(depositBalances);
	const depositBalance = 0;
	const vaultBalance = 0;
	const positions = walletBalances.length + depositBalances.length + vaultBalances.length;

	if (positions > 0)
		return (
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
				<TableHeader
					title={`Your Deposits - ${depositBalance}`}
					tokenTitle="Available"
					classes={classes}
					period={period}
				/>
				<List key={'deposit' + contracts[0]} className={classes.list}>
					{depositBalances}
				</List>
				<TableHeader
					title={`Your Sett Vaults - ${vaultBalance}`}
					tokenTitle="Tokens"
					classes={classes}
					period={period}
				/>
				<List key={'vault' + contracts[0]} className={classes.list}>
					{vaultBalances}
				</List>
			</>
		);

	return (
		<Typography align="center" variant="subtitle1" color="textSecondary" style={{ margin: '2rem 0' }}>
			Your address does not have tokens to deposit.
		</Typography>
	);
}
