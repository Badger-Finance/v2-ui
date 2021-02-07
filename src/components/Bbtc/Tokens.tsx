import React, { useState } from 'react';
import { makeStyles } from '@material-ui/core/styles';

import { Select, MenuItem } from '@material-ui/core';

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
		marginRight: '14px',
		marginLeft: '14px',
	},
	unstylishInput: {
		color: 'white',
		fontSize: '18px',
		lineHeight: '20px',
		margin: '0px 32px',
		width: '100%',
	},
}));

type TokenListProps = {
	tokens: Array<string>;
	default: string;
	onTokenSelect: EventListener;
};

export const Tokens = (props: TokenListProps): any => {
	const classes = useStyles();

	const [selectedToken, setTokenSelected] = useState<string>(props.default);
	const handleTokenSelection = (event: any) => {
		setTokenSelected(event?.target?.value);
		props.onTokenSelect(event);
	};

	const tokenItems = props.tokens.map((token) => (
		<MenuItem value={token} key={token}>
			<div className={classes.token}>
				<img src={require(`assets/tokens/${token}.png`)} className={classes.tokenIcon} alt="token name" />
				<div className={classes.tokenLabel}>renBTC</div>
			</div>
		</MenuItem>
	));

	return (
		<Select name="tokens" className={classes.noUnderline} value={selectedToken} onChange={handleTokenSelection}>
			{tokenItems}
		</Select>
	);
};
