import React from 'react';
import { Tooltip, Typography } from '@material-ui/core';
import VaultItemRoiTooltip from './VaultItemRoiTooltip';
import { makeStyles } from '@material-ui/core/styles';
import { Vault, VaultState } from '@badger-dao/sdk';

const useStyles = makeStyles({
	apr: {
		cursor: 'default',
		fontSize: 16,
	},
	boost: {
		fontWeight: 400,
		cursor: 'default',
	},
});

interface Props {
	vault: Vault;
	isDisabled?: boolean;
	multiplier?: number;
}

export const VaultItemApr = ({ vault, multiplier = 0 }: Props): JSX.Element => {
	const classes = useStyles();

	if (!vault.apr) {
		return (
			<Typography className={classes.apr} variant="body1" color={'textPrimary'}>
				0%
			</Typography>
		);
	}

	if (!vault.boost.enabled || !vault.minApr || vault.state === VaultState.Deprecated || vault.sources.length === 0) {
		return (
			<Typography className={classes.apr} variant="body1" color={'textPrimary'}>
				{`${vault.apr.toFixed(2)}%`}
			</Typography>
		);
	}

	const totalBoost = vault.sources
		.map((source) => (source.boostable ? source.apr * multiplier : source.apr))
		.reduce((total, apr) => total + apr, 0);

	const boostedApr = Math.max(totalBoost - vault.minApr, 0);
	const currentApr = vault.minApr + boostedApr;

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
		>
			<>
				<Typography className={classes.apr} variant="body1" color={'textPrimary'}>
					{`${currentApr.toFixed(2)}%`}
				</Typography>
				<Typography variant="body1" color="textSecondary" className={classes.boost}>
					My Boost: {boostedApr.toFixed(2)}%
				</Typography>
			</>
		</Tooltip>
	);
};
