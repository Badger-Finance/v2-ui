import React from 'react';
import { Tooltip, Typography } from '@material-ui/core';
import SettItemRoiTooltip from './SettItemRoiTooltip';
import { makeStyles } from '@material-ui/core/styles';
import { Sett, SettState } from '@badger-dao/sdk';

const useStyles = makeStyles({
	normalCursor: {
		cursor: 'default',
	},
});

const getAprMessage = (sett: Sett) => {
	if (!sett.apr) {
		return '0%';
	}

	if (!sett.boost.enabled || !sett.minApr || !sett.maxApr) {
		return `${sett.apr.toFixed(2)}%`;
	}

	return `${sett.minApr.toFixed(2)}% - ${sett.maxApr.toFixed(2)}%`;
};

interface Props {
	sett: Sett;
	isDisabled?: boolean;
	multiplier?: number;
}

export const SettItemApr = ({ sett, multiplier }: Props): JSX.Element => {
	const classes = useStyles();
	const apr = getAprMessage(sett);

	if (sett.state === SettState.Deprecated) {
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
			title={<SettItemRoiTooltip sett={sett} multiplier={multiplier} />}
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
