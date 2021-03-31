import React, { FC, useContext } from 'react';
import { toJS } from 'mobx';
import { observer } from 'mobx-react-lite';
import {
	Box,
	Button,
	Chip,
	Grid,
	Paper,
	Table,
	TableBody,
	TableCell,
	TableContainer,
	TableHead,
	TableRow,
	Tooltip,
	Typography,
} from '@material-ui/core';
import { InfoOutlined as InfoOutlinedIcon, UnfoldMoreTwoTone } from '@material-ui/icons';
import { makeStyles } from '@material-ui/core/styles';
import { ClassNameMap } from '@material-ui/core/styles/withStyles';

import { scaleToString, Direction } from 'utils/componentHelpers';
import { StoreContext } from 'mobx/store-context';
import { ClawStore } from 'mobx/stores/claw/clawStore';
import { Position, SyntheticData } from 'mobx/model';

export const useMainStyles = makeStyles((theme) => ({
	table: {
		minWidth: 650,
	},
	tableRow: {
		'&:last-child td, &:last-child th': {
			border: 0,
			borderBottomLeftRadius: 4,
			borderBottomRightRadius: 4,
		},
	},
	tableRowSubdued: {
		'& .MuiTableCell-head': {
			color: theme.palette.text.secondary,
		},
	},
}));

interface WithdrawalProps {
	classes: ClassNameMap;
	store: ClawStore;
	position: Position;
	synthetic: SyntheticData;
	decimals: number;
}

const Withdrawal: FC<WithdrawalProps> = ({ store, position, synthetic, classes, decimals }: WithdrawalProps) => {
	const amount = scaleToString(position.withdrawalRequestAmount, decimals, Direction.Down);
	// Scale from unix secs -> ms.
	const completionDate = new Date(position.withdrawalRequestPassTimestamp.toNumber() * 1000);
	const completion = `${completionDate.toLocaleDateString()} ${completionDate.toLocaleTimeString()}`;
	const withdrawalPeriodPassed = new Date() > completionDate;

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

const Withdrawals: FC = observer(() => {
	const { claw: store, contracts } = useContext(StoreContext);
	const { isLoading, sponsorInformationByEMP, syntheticsData } = store;
	const classes = useMainStyles();
	const sponsorInfo = new Map(Object.entries(toJS(sponsorInformationByEMP)));
	const synthetics = toJS(syntheticsData);
	return (
		<Box style={{ marginTop: '2rem' }}>
			<Grid container alignItems="center" justify="space-between">
				<Grid item>
					<Typography variant="h4">Pending Withdrawals</Typography>
				</Grid>
				<Grid item>
					<Typography variant="body2" color={'textSecondary'}>
						NOTE: Completed withdrawals are not currently being tracked by Badger.
					</Typography>
				</Grid>
			</Grid>
			<TableContainer component={Paper} style={{ marginTop: '.5rem', padding: '1rem' }}>
				<Table className={classes.table} aria-label="simple table">
					<TableHead>
						<TableRow className={classes.tableRowSubdued}>
							<TableCell component="th" scope="row">
								Token
							</TableCell>
							<TableCell>Amount</TableCell>
							<TableCell>Type</TableCell>
							<TableCell colSpan={2}>Completes On</TableCell>
						</TableRow>
					</TableHead>
					<TableBody>
						{synthetics.map((synthetic: SyntheticData) => {
							const { position, pendingWithdrawal } = sponsorInfo.get(synthetic.address);
							if (!position) return;

							if (pendingWithdrawal) {
								const bToken = contracts.tokens[synthetic.collateralCurrency];
								const decimals = bToken ? bToken.decimals : 18;
								return (
									<Withdrawal
										key={synthetic.name}
										store={store}
										position={position}
										synthetic={synthetic}
										decimals={decimals}
										classes={classes}
									/>
								);
							}
							return;
						})}
					</TableBody>
				</Table>
			</TableContainer>
		</Box>
	);
});

export default Withdrawals;
