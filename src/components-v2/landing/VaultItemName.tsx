import React from 'react';
import { Grid, Typography } from '@material-ui/core';
import VaultBadge from './VaultBadge';
import { makeStyles } from '@material-ui/core/styles';
import { Vault, VaultState } from '@badger-dao/sdk';

const useStyles = makeStyles((theme) => ({
	symbol: {
		marginTop: 'auto',
		marginBottom: 'auto',
		padding: theme.spacing(0, 0, 0, 0),
		marginRight: theme.spacing(2),
		display: 'inline-block',
		float: 'left',
		width: '2.4rem',
	},
	vaultIcon: {
		display: 'flex',
		justifyContent: 'center',
		alignItems: 'center',
	},
	tagContainer: {
		display: 'flex',
		alignItems: 'center',
		marginLeft: theme.spacing(2),
	},
	newTag: {
		background: 'white',
		textTransform: 'uppercase',
		fontSize: '12px',
		fontWeight: 700,
		color: theme.palette.background.paper,
		padding: theme.spacing(0.5),
		paddingLeft: theme.spacing(2),
		paddingRight: theme.spacing(2),
		borderRadius: '25px',
	},
}));

interface Props {
	vault: Vault;
}

export const VaultItemName = ({ vault }: Props): JSX.Element => {
	const classes = useStyles();

	return (
		<Grid container>
			<Grid item className={classes.vaultIcon}>
				<img
					alt={`Badger ${vault.name} Vault Symbol`}
					className={classes.symbol}
					src={`/assets/icons/${vault.vaultAsset.toLowerCase()}.png`}
				/>
			</Grid>
			<Grid item>
				<Grid container direction={'column'}>
					<Typography variant="body1">{vault.name}</Typography>
					<Grid container direction={'row'}>
						<Typography variant="caption" color="textSecondary">
							{vault.protocol}
						</Typography>
						{vault.state === VaultState.Deprecated && <VaultBadge protocol={'No Emissions'} />}
					</Grid>
				</Grid>
			</Grid>
			{vault.newVault && (
				<Grid item className={classes.tagContainer}>
					<div className={classes.newTag}>New</div>
				</Grid>
			)}
		</Grid>
	);
};
