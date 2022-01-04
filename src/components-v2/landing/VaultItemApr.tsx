import React from 'react';
import { Tooltip, Typography } from '@material-ui/core';
import VaultItemRoiTooltip from './VaultItemRoiTooltip';
import { makeStyles } from '@material-ui/core/styles';
import { Vault, VaultState } from '@badger-dao/sdk';

const useStyles = makeStyles({
	normalCursor: {
		cursor: 'default',
	},
});

const getAprMessage = (vault: Vault) => {
	if (!vault.apr) {
		return '0%';
	}

	if (!vault.boost.enabled || !vault.minApr || !vault.maxApr) {
		return `${vault.apr.toFixed(2)}%`;
	}

	return `${vault.minApr.toFixed(2)}% - ${vault.maxApr.toFixed(2)}%`;
};

interface Props {
	vault: Vault;
	isDisabled?: boolean;
	multiplier?: number;
}

export const VaultItemApr = ({ vault, multiplier }: Props): JSX.Element => {
	const classes = useStyles();
	const apr = getAprMessage(vault);

	if (vault.state === VaultState.Deprecated) {
		return (
			<Typography className={classes.normalCursor} variant="body1" color={'textPrimary'}>
				{apr}
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
		>
			<Typography className={classes.normalCursor} variant="body1" color={'textPrimary'}>
				{apr}
			</Typography>
		</Tooltip>
	);
};
