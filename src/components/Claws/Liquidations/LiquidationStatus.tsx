import React from 'react';
import { Chip, makeStyles, Tooltip } from '@material-ui/core';
import InfoOutlinedIcon from '@material-ui/icons/InfoOutlined';
import { Liquidation } from 'mobx/model';

enum Status {
	Uninitialized = 'Uninitialized',
	PreDispute = 'PreDispute',
	PendingDispute = 'PendingDispute',
	DisputeSucceeded = 'DisputeSucceeded',
	DisputeFailed = 'DisputeFailed',
}

const useStyles = makeStyles((theme) => ({
	redChip: {
		backgroundColor: theme.palette.error.main,
		color: 'white',
	},
}));

export const LiquidationStatus = ({ state }: Pick<Liquidation, 'state'>) => {
	const classes = useStyles();

	switch (state.toString()) {
		case Status.Uninitialized:
		default:
			return <Chip color="primary" label="Uninitialized" />;
		case Status.PreDispute:
			return <Chip color="primary" label="Pre Dispute" />;
		case Status.PendingDispute:
			return <Chip color="primary" label="Pending Dispute" />;
		case Status.DisputeSucceeded:
			return <Chip color="primary" label="Dispute Succeeded" />;
		case Status.DisputeFailed:
			return (
				<Tooltip title="Error details go here." placement="right">
					<Chip
						color="primary"
						className={classes.redChip}
						icon={<InfoOutlinedIcon />}
						label="Dispute Failed"
					/>
				</Tooltip>
			);
	}
};
