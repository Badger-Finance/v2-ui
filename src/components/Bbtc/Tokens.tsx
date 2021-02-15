import React, { useState } from 'react';
import { makeStyles } from '@material-ui/core/styles';

import { Select, MenuItem, Typography } from '@material-ui/core';
import { TokenModel } from './model';

const useStyles = makeStyles(() => ({
	noUnderline: {
		'&:after': {
			opacity: 0,
		},
		'&::before': {
			opacity: 0,
		},
	},
	token: {
		display: 'flex',
	},
	tokenIcon: {
		height: '30px',
		width: '30px',
		alignSelf: 'center',
	},
	tokenLabel: {
		alignSelf: 'center',
		margin: '0px 8px 0px 14px',
	},
}));

type TokenListProps = {
	tokens: Array<TokenModel>;
	default: string;
	onTokenSelect: EventListener;
};

export const Tokens = (props: TokenListProps): any => {
	const classes = useStyles();

	const [selectedToken, setSelectedToken] = useState<string>(props.default);
	const handleTokenSelection = (event: any) => {
		setSelectedToken(event?.target?.value);
		props.onTokenSelect(event?.target?.value);
	};

	const tokenItems = props.tokens.map((token) => (
		<MenuItem value={token.symbol} key={token.symbol}>
			<div className={classes.token}>
				<img src={token.icon} className={classes.tokenIcon} alt={token.name} />
				<Typography className={classes.tokenLabel} variant="body1">
					{token.symbol}
				</Typography>
			</div>
		</MenuItem>
	));

	return (
		<Select name="tokens" className={classes.noUnderline} value={selectedToken} onChange={handleTokenSelection}>
			{tokenItems}
		</Select>
	);
};
