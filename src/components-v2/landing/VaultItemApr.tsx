import React from 'react';
import { Tooltip, Typography, useMediaQuery, useTheme } from '@material-ui/core';
import VaultItemRoiTooltip from './VaultItemRoiTooltip';
import { makeStyles } from '@material-ui/core/styles';
import { Vault } from '@badger-dao/sdk';
import { getUserVaultBoost } from '../../utils/componentHelpers';
import clsx from 'clsx';

const useStyles = makeStyles({
	apr: {
		cursor: 'default',
		fontSize: 16,
	},
	boost: {
		fontWeight: 400,
		cursor: 'default',
	},
	nonBoostedMobileApr: {
		marginBottom: 21,
	},
});

interface Props {
	vault: Vault;
	isDisabled?: boolean;
	multiplier?: number;
	boost?: number;
}

export const VaultItemApr = ({ vault, boost, multiplier }: Props): JSX.Element => {
	const classes = useStyles();
	const isMobile = useMediaQuery(useTheme().breakpoints.down('sm'));
	const vaultBoost = boost ? getUserVaultBoost(vault, boost) : undefined;

	if (!vault.apr) {
		return (
			<Typography
				className={clsx(classes.apr, isMobile && classes.nonBoostedMobileApr)}
				variant="body1"
				color={'textPrimary'}
			>
				0%
			</Typography>
		);
	}

	let vaultApr: JSX.Element;

	if (vaultBoost && vault.minApr) {
		const boostContribution = Math.max(0, vaultBoost - vault.minApr);
		vaultApr = (
			<div>
				<Typography className={classes.apr} variant="body1" color={'textPrimary'}>
					{`${vaultBoost.toFixed(2)}%`}
				</Typography>
				<Typography variant="body1" color="textSecondary" className={classes.boost}>
					My Boost: {boostContribution.toFixed(2)}%
				</Typography>
			</div>
		);
	} else {
		vaultApr = (
			<Typography
				className={clsx(classes.apr, isMobile && classes.nonBoostedMobileApr)}
				variant="body1"
				color={'textPrimary'}
			>
				{`${vault.apr.toFixed(2)}%`}
			</Typography>
		);
	}

	return (
		<Tooltip
			enterTouchDelay={0}
			enterDelay={0}
			leaveDelay={300}
			arrow
			placement="left"
			title={<VaultItemRoiTooltip vault={vault} multiplier={multiplier} />}
			// prevents scrolling overflow off the sett list
			PopperProps={{
				disablePortal: true,
			}}
			// needs to be set otherwise MUI will set a random one on every run causing snapshots to break
			id={`${vault.name} apr breakdown`}
		>
			{vaultApr}
		</Tooltip>
	);
};
