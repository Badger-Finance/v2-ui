import React from 'react';
import { Grid, Typography } from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';
import { Vault } from '@badger-dao/sdk';
import VaultBadge from './VaultBadge';
import clsx from 'clsx';

const useStyles = makeStyles((theme) => ({
	nameContainer: {
		height: 34,
		display: 'flex',
		flexDirection: 'column-reverse',
	},
	vaultName: {
		fontSize: 16,
		'&:first-letter': {
			textTransform: 'capitalize',
		},
	},
	symbol: {
		width: 34,
		height: 34,
	},
	vaultIcon: {
		display: 'flex',
		justifyContent: 'center',
		alignItems: 'center',
		marginRight: 21,
		width: 61,
		flexDirection: 'column',
	},
	tagContainer: {
		display: 'flex',
		alignItems: 'center',
	},
	protocolName: {
		fontSize: 14,
	},
	maxBoost: {
		fontWeight: 400,
	},
	badgeTopAligner: {
		marginTop: theme.spacing(1),
	},
}));

interface Props {
	vault: Vault;
}

export const VaultItemName = ({ vault }: Props): JSX.Element => {
	const classes = useStyles();

	// were calling this as a normal function instead of JSX to check if the component returned null
	const Badge = VaultBadge({ vault });

	return (
		<Grid container alignItems="center">
			<Grid item className={classes.vaultIcon}>
				<img
					alt={`Badger ${vault.name} Vault Symbol`}
					className={classes.symbol}
					src={`/assets/icons/${vault.vaultAsset.toLowerCase()}.png`}
				/>
				{Badge}
			</Grid>
			<Grid item>
				<div className={classes.nameContainer}>
					<Typography className={classes.vaultName}>
						{vault.protocol} - {vault.name}
					</Typography>
				</div>
				<Typography
					variant="body1"
					className={clsx(classes.maxBoost, Badge && classes.badgeTopAligner)}
					color="textSecondary"
				>
					{vault.boost.enabled && vault.maxApr
						? `🚀 Boosted (max. ${vault.maxApr.toFixed(2)}%)`
						: 'Non-boosted'}
				</Typography>
			</Grid>
		</Grid>
	);
};
