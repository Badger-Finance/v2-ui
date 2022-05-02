import React from 'react';
import { Token } from '@badger-dao/sdk';
import TokenLogo from '../../components-v2/TokenLogo';
import { Typography } from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';

const useStyles = makeStyles((theme) => ({
	tokenIcon: {
		height: '25px',
		marginRight: theme.spacing(1),
	},
	tokenContainer: {
		display: 'flex',
		alignItems: 'center',
		padding: theme.spacing(0.5),
	},
}));

interface TokenProps {
	token: Token;
}

export const OptionToken = ({ token }: TokenProps): JSX.Element => {
	const { symbol } = token;
	const classes = useStyles();
	return (
		<div className={classes.tokenContainer} aria-label={symbol}>
			<TokenLogo token={token} className={classes.tokenIcon} />
			<Typography variant="body1" component="div">
				{symbol}
			</Typography>
		</div>
	);
};
