import React from 'react';
import { DialogTitle, Grid, Typography } from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';
import { Vault } from '@badger-dao/sdk';

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
		width: 32,
		height: 32,
		marginRight: theme.spacing(1),
	},
}));

interface Props {
	sett: Vault;
	mode: string;
}

export const SettDialogTitle = ({ sett, mode }: Props): JSX.Element => {
	const classes = useStyles();

	return (
		<DialogTitle className={classes.root}>
			<Grid container alignItems="center">
				<Grid item className={classes.logoContainer}>
					<img
						className={classes.settLogo}
						src={`/assets/icons/${sett.vaultAsset.toLowerCase()}.png`}
						alt={`Badger ${sett.name} Vault Symbol`}
					/>
				</Grid>
				<Grid item>
					<Typography className={classes.mode} color="textSecondary">
						{mode}
					</Typography>
					<Typography variant="body1" color="textPrimary">
						{sett.name}
					</Typography>
				</Grid>
			</Grid>
		</DialogTitle>
	);
};
