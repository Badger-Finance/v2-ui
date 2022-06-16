import { MenuItem, Select } from '@material-ui/core';
import React from 'react';

import { TokenBalance } from '../../mobx/model/tokens/token-balance';
import { OptionToken } from './OptionToken';

type TokenListProps = {
	balances: Array<TokenBalance>;
	selected: TokenBalance;
	onTokenSelect: (token: TokenBalance) => void;
};

export const OptionTokens = ({ balances, selected, onTokenSelect }: TokenListProps): JSX.Element => (
	<Select aria-label="token options" variant="outlined" color="primary" value={selected.token.address}>
		{balances.map((balance) => (
			<MenuItem
				aria-label={balance.token.symbol}
				key={balance.token.address}
				value={balance.token.address}
				onClick={() => onTokenSelect(balance)}
			>
				<OptionToken token={balance.token} />
			</MenuItem>
		))}
	</Select>
);
