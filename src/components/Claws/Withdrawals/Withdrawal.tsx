import React from 'react';
import { Position, SyntheticData } from 'mobx/model';
import { TableCell, Typography, Box, Tooltip, Button, TableRow, Chip, makeStyles } from '@material-ui/core';
import { InfoOutlined as InfoOutlinedIcon } from '@material-ui/icons';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';

import { StoreContext } from 'mobx/store-context';
import { scaleToString, Direction } from 'utils/componentHelpers';

dayjs.extend(utc);

interface Props {
	position: Position;
	synthetic: SyntheticData;
	decimals: number;
}

const useStyles = makeStyles(() => ({
	tableRow: {
		'&:last-child td, &:last-child th': {
			border: 0,
			borderBottomLeftRadius: 4,
			borderBottomRightRadius: 4,
		},
	},
}));

export const Withdrawal = ({ position, synthetic, decimals }: Props) => {
	const { claw: store } = React.useContext(StoreContext);
	const classes = useStyles();

	const amount = scaleToString(position.withdrawalRequestAmount, decimals, Direction.Down);
	// Scale from unix secs -> ms.
	const completionDate = dayjs(position.withdrawalRequestPassTimestamp.toNumber() * 1000);
	const completion = completionDate.format('MMM DD[,] YYYY [@] HH:mm [UTC]');
	const withdrawalPeriodPassed = completionDate.isBefore(dayjs().utc());

	const cancel = () => store.actionStore.cancelWithdrawal(synthetic.address);
	const withdraw = () => store.actionStore.withdrawPassedRequest(synthetic.address);

	return (
		<TableRow key={synthetic.name} className={classes.tableRow}>
			<TableCell>
				<Typography variant="body1">{synthetic.name}</Typography>
			</TableCell>
			<TableCell>{amount}</TableCell>
			<TableCell>
				<Box style={{ display: 'flex', alignItems: 'center' }}>
					<Tooltip title="This withdrawal is under the global average collateral ratio. You may withdraw on the completion date if there are no liquidations.">
						<Chip color="primary" icon={<InfoOutlinedIcon />} label="Slow" />
					</Tooltip>
				</Box>
			</TableCell>
			<TableCell>
				<Typography variant="body2">{completion}</Typography>
			</TableCell>
			<TableCell align="right">
				<Button
					onClick={withdrawalPeriodPassed ? withdraw : cancel}
					color="primary"
					variant="outlined"
					size="small"
				>
					{withdrawalPeriodPassed ? 'Withdraw' : 'Cancel Withdrawal'}
				</Button>
			</TableCell>
		</TableRow>
	);
};
