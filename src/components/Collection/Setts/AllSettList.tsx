import React, { useContext } from 'react';
import { Typography, List, ListItem } from '@material-ui/core';
import { Vault } from 'mobx/model';
import BigNumber from 'bignumber.js';
import { usdToCurrency } from '../../../mobx/utils/helpers';
import _ from 'lodash';
import { TokenCard } from './TokenCard';
import TableHeader from './TableHeader';
import { StoreContext } from 'mobx/store-context';

interface SettListProps {
	allSetts: any[];
	vaults: any;
	hideEmpty: any;
	classes: Record<'title' | 'header' | 'list' | 'listItem' | 'before' | 'hiddenMobile' | 'chip', string>;
	onOpen: (vault: Vault, sett: any) => void;
	period: string;
	wallet: any;
	tvl: string;
	walletBalance: string;
}

export default function AllSettList(props: SettListProps): JSX.Element {
	const store = useContext(StoreContext);
	const { allSetts, classes, vaults, hideEmpty, onOpen, period, walletBalance, tvl } = props;

	const {
		uiState: { currency },
	} = store;

	const sorted = _.sortBy(allSetts, (sett) => {
		return -(allSetts.length - sett.position) || 0;
	});

	const filtered = _.filter(sorted, (sett) => {
		const vault: Vault = vaults[sett.address.toLowerCase()];
		return !hideEmpty || (!!vault && vault.underlyingToken.balance.gt(0));
	});

	let list = _.map(filtered, (sett) => {
		const vault: Vault = vaults[sett.address.toLowerCase()];
		return (
			<ListItem key={sett.asset} className={classes.listItem}>
				<TokenCard isGlobal={!hideEmpty} sett={sett} onOpen={onOpen} vault={vault} period={period} />
			</ListItem>
		);
	});
	list = _.compact(list);

	if (list.length > 0)
		return (
			<>
				<TableHeader
					title={
						hideEmpty
							? `Your Wallet - ${walletBalance}`
							: `All Setts  - ${usdToCurrency(new BigNumber(tvl.replace(/,/g, '')), currency)}`
					}
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
