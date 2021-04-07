import React from 'react';
import { Chip, makeStyles, Tooltip, Typography } from '@material-ui/core';
import dayjs from 'dayjs';
import InfoOutlinedIcon from '@material-ui/icons/InfoOutlined';
import { Liquidation, SyntheticData, LiquidationStatus as Status } from 'mobx/model';

interface Props {
	liquidation: Liquidation;
	synthetic: SyntheticData;
}

const useStyles = makeStyles((theme) => ({
	redChip: {
		backgroundColor: theme.palette.error.main,
		color: 'white',
	},
}));

export const LiquidationStatus = ({ liquidation, synthetic }: Props) => {
	const classes = useStyles();
	const isCompleted = isLiquidationCompleted(liquidation, synthetic);

	if (isCompleted) {
		const formattedLiquidationTime = dayjs(
			liquidation.liquidationTime.plus(synthetic.liquidationLiveness).toNumber() * 1000,
		).format('MMM DD, YYYY');

		return (
			<Typography variant="body2" color="textPrimary">
				{`Complete - ${formattedLiquidationTime}`}
			</Typography>
		);
	}

	switch (liquidation.state.toString()) {
		case Status.Uninitialized:
		default:
			return (
				<Tooltip title="The liquidation is yet to be initialized" placement="right">
					<Chip icon={<InfoOutlinedIcon />} color="primary" label="Uninitialized" />
				</Tooltip>
			);
		case Status.PreDispute:
			return (
				<Tooltip title="The liquidation is about to be disputed" placement="right">
					<Chip icon={<InfoOutlinedIcon />} color="primary" label="Pre Dispute" />
				</Tooltip>
			);
		case Status.PendingDispute:
			return (
				<Tooltip title="The liquidation is being disputed" placement="right">
					<Chip icon={<InfoOutlinedIcon />} color="primary" label="Pending Dispute" />
				</Tooltip>
			);
		case Status.DisputeFailed:
			return (
				<Tooltip title="The liquidation dispute got rejected" placement="right">
					<Chip icon={<InfoOutlinedIcon />} color="primary" label="Dispute Failed" />
				</Tooltip>
			);
		case Status.DisputeSucceeded:
			return (
				<Tooltip title="The liquidation dispute got approved" placement="right">
					<Chip
						color="primary"
						className={classes.redChip}
						icon={<InfoOutlinedIcon />}
						label="Dispute Succeed"
					/>
				</Tooltip>
			);
	}
};

function isLiquidationCompleted({ liquidationTime, state }: Liquidation, { liquidationLiveness }: SyntheticData) {
	const liquidationIsExpired = liquidationTime.plus(liquidationLiveness).toNumber() * 1000 < new Date().getTime();
	return liquidationIsExpired && state === Status.PreDispute;
}
