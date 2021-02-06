import React from 'react';
import { Typography, List, ListItem } from '@material-ui/core';
import { Vault } from 'mobx/model';
import { DepositCard } from './DepositCard';
import _ from 'lodash';
import TableHeader from './TableHeader';

// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
export default function DepositList(props: any) {
	const { contracts, classes, vaults, hideEmpty, onOpen, depositBalance, period } = props;
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
			<>
				<TableHeader
					title={`Your Deposits - ${depositBalance}`}
					tokenTitle="Tokens"
					classes={classes}
					period={period}
				/>
				<List key={contracts[0]} className={classes.list}>
					{list}
				</List>
			</>
		);

	return (
		<Typography align="center" variant="subtitle1" color="textSecondary" style={{ margin: '2rem 0' }}>
			Your address does not have tokens to deposit.
		</Typography>
	);
}
