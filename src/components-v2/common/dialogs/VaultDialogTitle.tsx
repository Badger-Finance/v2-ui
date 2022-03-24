import React from 'react';
import { DialogTitle, Grid, Typography } from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';
import { VaultDTO } from '@badger-dao/sdk';
import VaultLogo from '../../landing/VaultLogo';

const useStyles = makeStyles((theme) => ({
	root: {
		padding: theme.spacing(3),
	},
	mode: {
		fontSize: 12,
	},
	settLogo: {
		width: '100%',
		margin: 'auto',
	},
	logoContainer: {
		display: 'flex',
		marginRight: theme.spacing(1),
	},
}));

interface Props {
	vault: VaultDTO;
	mode: string;
}

export const VaultDialogTitle = ({ vault, mode }: Props): JSX.Element => {
	const classes = useStyles();

	return (
		<DialogTitle className={classes.root}>
			<Grid container alignItems="center">
				<Grid item className={classes.logoContainer}>
					<VaultLogo tokens={vault.tokens} />
				</Grid>
				<Grid item>
					<Typography className={classes.mode} color="textSecondary">
						{mode}
					</Typography>
					<Typography variant="body1" color="textPrimary">
						{vault.name}
					</Typography>
				</Grid>
			</Grid>
		</DialogTitle>
	);
};
