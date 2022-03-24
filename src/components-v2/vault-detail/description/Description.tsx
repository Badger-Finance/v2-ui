import React from 'react';
import { Grid, Typography } from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';
import { VaultDTO } from '@badger-dao/sdk';
import VaultLogo from '../../landing/VaultLogo';

const useStyles = makeStyles((theme) => ({
	root: {
		display: 'flex',
	},
	namesContainer: {
		marginLeft: theme.spacing(1),
	},
	settName: {
		display: 'inline',
		fontSize: 24,
	},
	vaultName: {
		fontSize: 14,
	},
	settLogo: {
		width: '100%',
		margin: 'auto',
	},
	logoContainer: {
		display: 'flex',
		alignItems: 'center',
	},
}));

interface Props {
	vault: VaultDTO;
}

export const Description = ({ vault }: Props): JSX.Element => {
	const classes = useStyles();

	return (
		<div className={classes.root}>
			<Grid item className={classes.logoContainer}>
				<VaultLogo tokens={vault.tokens} />
			</Grid>
			<Grid item container direction="column" justifyContent="center" className={classes.namesContainer}>
				<Grid item container alignItems="center">
					<Typography className={classes.settName}>
						{vault.protocol} - {vault.name}
					</Typography>
				</Grid>
				<Grid item>
					<Typography className={classes.vaultName} color="textSecondary">
						{vault.asset}
					</Typography>
				</Grid>
			</Grid>
		</div>
	);
};
