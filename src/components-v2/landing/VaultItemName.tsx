import React from 'react';
import { Grid, Typography, useMediaQuery, useTheme } from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';
import { Vault } from '@badger-dao/sdk';
import VaultBadge from './VaultBadge';
import clsx from 'clsx';
import { getUserVaultBoost } from '../../utils/componentHelpers';

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
		[theme.breakpoints.down('sm')]: {
			marginRight: theme.spacing(2),
		},
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
	boost: {
		fontWeight: 400,
	},
	badgeTopAligner: {
		marginTop: theme.spacing(1),
	},
	vaultNameMobile: {
		marginTop: theme.spacing(1),
	},
}));

interface Props {
	vault: Vault;
	multiplier?: number;
}

export const VaultItemName = ({ vault, multiplier = 0 }: Props): JSX.Element => {
	const isMobile = useMediaQuery(useTheme().breakpoints.down('sm'));
	const classes = useStyles();

	const vaultBoost = getUserVaultBoost(vault, multiplier);
	const currentApr = vault.minApr && vaultBoost ? vault.minApr + vaultBoost : vault.apr;

	// we invoke this as a normal function instead of JSX to check if the component returned null
	const Badge = VaultBadge({ vault });

	const vaultIcon = (
		<img
			alt={`Badger ${vault.name} Vault Symbol`}
			className={classes.symbol}
			src={`/assets/icons/${vault.vaultAsset.toLowerCase()}.png`}
		/>
	);

	const vaultName = (
		<Typography className={classes.vaultName}>
			{vault.protocol} - {vault.name}
		</Typography>
	);

	const boostText =
		vault.boost.enabled && vault.maxApr ? `🚀 Boosted (max. ${vault.maxApr.toFixed(2)}%)` : 'Non-boosted';

	if (isMobile) {
		return (
			<Grid container>
				<Grid container>
					{vaultIcon}
					{Badge}
				</Grid>
				<Grid container direction="column" className={classes.vaultNameMobile}>
					<Grid item container spacing={2}>
						<Grid item xs={7}>
							{vaultName}
						</Grid>
						<Grid item xs>
							<Typography className={classes.vaultName}>{`${currentApr.toFixed(2)}%`}</Typography>
						</Grid>
					</Grid>
					<Grid item container spacing={2}>
						<Grid item xs={7}>
							<Typography variant="body1" className={classes.boost} color="textSecondary">
								{boostText}
							</Typography>
						</Grid>
						{!!vaultBoost && (
							<Grid item xs>
								<Typography variant="body1" color="textSecondary" className={classes.boost}>
									My Boost: {vaultBoost.toFixed(2)}%
								</Typography>
							</Grid>
						)}
					</Grid>
				</Grid>
			</Grid>
		);
	}

	return (
		<Grid container alignItems="center">
			<Grid item className={classes.vaultIcon}>
				{vaultIcon}
				{Badge}
			</Grid>
			<Grid item>
				<div className={classes.nameContainer}>{vaultName}</div>
				<Typography
					variant="body1"
					className={clsx(classes.boost, Badge && classes.badgeTopAligner)}
					color="textSecondary"
				>
					{boostText}
				</Typography>
			</Grid>
		</Grid>
	);
};
