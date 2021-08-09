import React from 'react';
import { Grid, Typography } from '@material-ui/core';
import { StyledDivider } from '../styled';
import { makeStyles } from '@material-ui/core/styles';
import { Sett } from '../../../mobx/model/setts/sett';
import { SettToken } from './SettToken';

const useStyles = makeStyles((theme) => ({
	root: {
		marginBottom: 20,
	},
	specName: {
		fontSize: 12,
		lineHeight: '1.66',
	},
	tokenSpec: {
		marginBottom: theme.spacing(1),
	},
	tokenName: {
		marginLeft: theme.spacing(1),
	},
	tokenImageContainer: {
		width: 16,
		height: 16,
		display: 'inline',
		alignItems: 'center',
	},
	tokenImage: {
		width: '100%',
	},
}));

interface Props {
	sett: Sett;
}

export const Tokens = ({ sett }: Props): JSX.Element => {
	const classes = useStyles();

	return (
		<Grid container className={classes.root}>
			<Typography>Tokens</Typography>
			<StyledDivider />
			<Grid container>
				{sett.tokens.map((token, index) => (
					<SettToken key={`${sett.name}-${token.name}-${index}`} token={token} />
				))}
			</Grid>
		</Grid>
	);
};
