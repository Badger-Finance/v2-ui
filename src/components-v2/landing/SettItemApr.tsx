import React from 'react';
import { Tooltip, Typography } from '@material-ui/core';
import { SettItemRoiTooltip } from './SettItemRoiTooltip';
import { makeStyles } from '@material-ui/core/styles';
import { Sett } from '@badger-dao/sdk';

const useStyles = makeStyles({
	normalCursor: {
		cursor: 'default',
	},
});

const getAprMessage = (sett: Sett, divisor: number) => {
	if (!sett.apr) {
		return '0%';
	}

	if (!sett.boostable || !sett.minApr || !sett.maxApr) {
		return `${(sett.apr / divisor).toFixed(2)}%`;
	}

	return `${(sett.minApr / divisor).toFixed(2)}% - ${(sett.maxApr / divisor).toFixed(2)}%`;
};

interface Props {
	sett: Sett;
	divisor: number;
	isDisabled?: boolean;
	multiplier?: number;
}

export const SettItemApr = ({ sett, divisor, multiplier }: Props): JSX.Element => {
	const classes = useStyles();
	const apr = getAprMessage(sett, divisor);

	if (sett.deprecated) {
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
			title={<SettItemRoiTooltip sett={sett} divisor={divisor} multiplier={multiplier} />}
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
