import React from 'react';
import { Grid, makeStyles, Typography } from '@material-ui/core';
import { StyledDivider } from '../styled';
import { VaultToken } from './VaultToken';
import { Vault } from '@badger-dao/sdk';

const useStyles = makeStyles((theme) => ({
	title: {
		paddingBottom: theme.spacing(0.25),
	},
}));

interface Props {
	vault: Vault;
}

export const Tokens = ({ vault }: Props): JSX.Element => {
	const classes = useStyles();
	return (
		<Grid container>
			<Typography className={classes.title}>Tokens</Typography>
			<StyledDivider />
			<Grid container>
				{vault.tokens.map((token, index) => (
					<VaultToken key={`${vault.name}-${token.name}-${index}`} token={token} />
				))}
			</Grid>
		</Grid>
	);
};
