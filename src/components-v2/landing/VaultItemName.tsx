import React from 'react';
import { Grid, Typography, useMediaQuery, useTheme } from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';
import { Vault } from '@badger-dao/sdk';
import VaultBadge from './VaultBadge';
import { getUserVaultBoost } from '../../utils/componentHelpers';

const useStyles = makeStyles((theme) => ({
	rootContainerLarge: {
		width: 'calc(100% + 21px)',
		margin: '-10.5px',
	},
	nameAndBoostContainer: {
		padding: '10.5px',
	},
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
		width: 24,
		height: 24,
		[theme.breakpoints.down('sm')]: {
			marginRight: theme.spacing(2),
		},
	},
	vaultIcon: {
		display: 'flex',
		justifyContent: 'center',
		alignItems: 'flex-end',
		flexDirection: 'column',
		[theme.breakpoints.up('md')]: {
			maxWidth: '20%',
			flexBasis: '20%',
			padding: '10.5px',
		},
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
	vaultNameMobile: {
		marginTop: theme.spacing(1),
	},
}));

interface Props {
	vault: Vault;
	boost?: number;
}

export const VaultItemName = ({ vault, boost }: Props): JSX.Element => {
	const isMobile = useMediaQuery(useTheme().breakpoints.down('sm'));
	const classes = useStyles();

	const vaultBoost = boost ? getUserVaultBoost(vault, boost) : null;
	const currentApr = vault.minApr && vaultBoost ? vault.minApr + vaultBoost : vault.apr;

	const Badge = <VaultBadge vault={vault} />;

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
				<Grid container alignItems="center">
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
		<Grid container alignItems="center" className={classes.rootContainerLarge}>
			<Grid item xs={2} className={classes.vaultIcon}>
				{vaultIcon}
				{Badge}
			</Grid>
			<Grid item xs className={classes.nameAndBoostContainer}>
				<div className={classes.nameContainer}>{vaultName}</div>
				<Typography variant="body1" className={classes.boost} color="textSecondary">
					{boostText}
				</Typography>
			</Grid>
		</Grid>
	);
};
