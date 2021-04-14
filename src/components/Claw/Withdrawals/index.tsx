import React from 'react';
import { observer } from 'mobx-react-lite';
import {
	Container,
	Grid,
	Paper,
	Table,
	TableBody,
	TableCell,
	TableContainer,
	TableHead,
	TableRow,
	Typography,
} from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';

import { StoreContext } from 'mobx/store-context';
import { SyntheticData } from 'mobx/model';
import { Withdrawal } from './Withdrawal';

export const useStyles = makeStyles((theme) => ({
	container: {
		marginTop: theme.spacing(8),
		padding: 0,
		width: '100%',
	},
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

const Withdrawals = observer(() => {
	const { claw: store, contracts } = React.useContext(StoreContext);
	const { sponsorInformationByEMP, syntheticsData } = store;
	const classes = useStyles();

	return (
		<Container className={classes.container}>
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
						{syntheticsData.map((synthetic: SyntheticData) => {
							const sponsorData = sponsorInformationByEMP.get(synthetic.address);
							if (!sponsorData || !sponsorData.position || !sponsorData.pendingWithdrawal) return;

							const bToken = contracts.tokens[synthetic.collateralCurrency];
							const decimals = bToken ? bToken.decimals : 18;

							return (
								<Withdrawal
									key={synthetic.name}
									position={sponsorData.position}
									synthetic={synthetic}
									decimals={decimals}
								/>
							);
						})}
					</TableBody>
				</Table>
			</TableContainer>
		</Container>
	);
});

export default Withdrawals;
