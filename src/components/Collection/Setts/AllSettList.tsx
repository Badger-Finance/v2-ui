import React from 'react';
import { Typography, List, ListItem } from '@material-ui/core';
import { Vault } from 'mobx/model';
import _ from 'lodash';
import { TokenCard } from './TokenCard';
import TableHeader from './TableHeader';

// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
export default function AllSettList(props: any) {
	const { allSetts, classes, vaults, hideEmpty, onOpen, period, walletBalance, tvl } = props;

	const sorted = _.sortBy(allSetts, (sett) => {
		return -(allSetts.length - sett.position) || 0;
	});

	const filtered = _.filter(sorted, (sett) => {
		const vault: Vault = vaults[sett.address.toLowerCase()];
		return !hideEmpty || (!!vault && vault.underlyingToken.balance.gt(0));
	});

	const list = _.map(filtered, (sett) => {
		const vault: Vault = vaults[sett.address.toLowerCase()];
		return (
			<ListItem key={sett.asset} className={classes.listItem}>
				<TokenCard isGlobal={!hideEmpty} sett={sett} onOpen={onOpen} vault={vault} period={period} />
			</ListItem>
		);
	});

	// TODO: Find a better way to verify data is loaded & ready
	if (list && list.length === 11)
		return (
			<>
				<TableHeader
					title={hideEmpty ? `Your Wallet - ${walletBalance}` : `All Setts  - ${tvl}`}
					tokenTitle={hideEmpty ? 'Available' : 'Tokens'}
					classes={classes}
					period={period}
				/>
				<List className={classes.list}>{list}</List>
			</>
		);

	return (
		<Typography align="center" variant="subtitle1" color="textSecondary" style={{ margin: '2rem 0' }}>
			{!hideEmpty ? 'Loading Badger Setts...' : ``}
		</Typography>
	);
}
