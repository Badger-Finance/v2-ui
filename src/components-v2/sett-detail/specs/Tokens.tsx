import React from 'react';
import { Grid, makeStyles, Typography } from '@material-ui/core';
import { StyledDivider } from '../styled';
import { Sett } from '../../../mobx/model/setts/sett';
import { SettToken } from './SettToken';

const useStyles = makeStyles((theme) => ({
	title: {
		paddingBottom: theme.spacing(0.5),
	},
}));

interface Props {
	sett: Sett;
}

export const Tokens = ({ sett }: Props): JSX.Element => {
	const classes = useStyles();
	return (
		<Grid container>
			<Typography className={classes.title}>Tokens</Typography>
			<StyledDivider />
			<Grid container>
				{sett.tokens.map((token, index) => (
					<SettToken key={`${sett.name}-${token.name}-${index}`} token={token} />
				))}
			</Grid>
		</Grid>
	);
};
