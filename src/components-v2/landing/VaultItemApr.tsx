import React from 'react';
import { Tooltip, Typography } from '@material-ui/core';
import VaultItemRoiTooltip from './VaultItemRoiTooltip';
import { makeStyles } from '@material-ui/core/styles';
import { Vault } from '@badger-dao/sdk';
import { numberWithCommas } from 'mobx/utils/helpers';

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
	boost: number | null;
	isDisabled?: boolean;
	multiplier?: number;
}

export const VaultItemApr = ({ vault, boost, multiplier }: Props): JSX.Element => {
	const classes = useStyles();

	if (!vault.apr) {
		return (
			<Typography className={classes.apr} variant="body1" color={'textPrimary'}>
				--%
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
			<Typography className={classes.apr} variant="body1" color={'textPrimary'}>
				{`${numberWithCommas((boost || vault.apr).toFixed(2))}%`}
			</Typography>
		</Tooltip>
	);
};
