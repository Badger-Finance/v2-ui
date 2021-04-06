import React from 'react';
import { observer } from 'mobx-react-lite';
import {
	Paper,
	Table,
	TableBody,
	TableCell,
	TableRow,
	TableContainer,
	TableHead,
	Typography,
	Container,
} from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';

import { StoreContext } from 'mobx/store-context';
import { Liquidation, SyntheticData } from 'mobx/model';
import { LiquidationRow as LiquidationRow } from './LiquidationRow';
import { LiquidationDialog } from './LiquidationDialog';
import BigNumber from 'bignumber.js';

interface FocusedLiquidation {
	liquidation: Liquidation;
	synthetic: SyntheticData;
	decimals: number;
}

const useStyles = makeStyles((theme) => ({
	container: {
		width: '100%',
		marginTop: theme.spacing(4),
		padding: 0,
	},
	tableContainer: {
		marginTop: theme.spacing(1),
		padding: theme.spacing(2),
	},
	table: {
		minWidth: 650,
	},
	tableRow: {
		cursor: 'pointer',
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
	redChip: {
		backgroundColor: theme.palette.error.main,
		color: 'white',
	},
}));

const mockData: Liquidation[] = [
	{
		state: 'Uninitialized',
		liquidationTime: new BigNumber(1618072065),
		tokensOutstanding: new BigNumber(100).multipliedBy(10 ** 18),
		lockedCollateral: new BigNumber(100).multipliedBy(10 ** 18),
		sponsor: '0xC26202cd0428276cC69017Df01137161f0102e55',
		liquidator: '0xC26202cd0428226cC69017Da01137161f0104da22',
		liquidatedCollateral: new BigNumber(122).multipliedBy(10 ** 18),
		rawUnitCollateral: new BigNumber(100).multipliedBy(10 ** 18),
		disputer: '0xC26202cd0428276cC69017Df01137161f0102e55',
		settlementPrice: new BigNumber(111).multipliedBy(10 ** 18),
		finalFee: new BigNumber(33),
	},
	{
		state: 'DisputeFailed',
		liquidationTime: new BigNumber(1618072065),
		tokensOutstanding: new BigNumber(100).multipliedBy(10 ** 18),
		lockedCollateral: new BigNumber(100).multipliedBy(10 ** 18),
		sponsor: '0xC26202cd0428276cC69017Df01137161f0102e55',
		liquidator: '0xC26202cd0428226cC69017Da01137161f0104da22',
		liquidatedCollateral: new BigNumber(122).multipliedBy(10 ** 18),
		rawUnitCollateral: new BigNumber(100).multipliedBy(10 ** 18),
		disputer: '0xC26202cd0428276cC69017Df01137161f0102e55',
		settlementPrice: new BigNumber(111).multipliedBy(10 ** 18),
		finalFee: new BigNumber(33),
	},
	{
		state: 'PendingDispute',
		liquidationTime: new BigNumber(1618072065),
		tokensOutstanding: new BigNumber(100).multipliedBy(10 ** 18),
		lockedCollateral: new BigNumber(100).multipliedBy(10 ** 18),
		sponsor: '0xC26202cd0428276cC69017Df01137161f0102e55',
		liquidator: '0xC26202cd0428226cC69017Da01137161f0104da22',
		liquidatedCollateral: new BigNumber(122).multipliedBy(10 ** 18),
		rawUnitCollateral: new BigNumber(100).multipliedBy(10 ** 18),
		disputer: '0xC26202cd0428276cC69017Df01137161f0102e55',
		settlementPrice: new BigNumber(111).multipliedBy(10 ** 18),
		finalFee: new BigNumber(33),
	},
];

const Liquidations = observer(() => {
	const { claw: store, contracts } = React.useContext(StoreContext);
	const classes = useStyles();
	const [focusedLiquidation, setFocusedLiquidation] = React.useState<FocusedLiquidation | null>(null);
	const { sponsorInformationByEMP, syntheticsData } = store;
	const liquidationRows: React.ReactNode[] = [];

	syntheticsData.forEach((synthetic: SyntheticData) => {
		const sponsorData = sponsorInformationByEMP.get(synthetic.address);
		if (!sponsorData?.position) return;
		const bToken = contracts.tokens[synthetic.collateralCurrency];
		const decimals = bToken ? bToken.decimals : 18;

		mockData.forEach((liquidation: Liquidation) => {
			liquidationRows.push(
				<LiquidationRow
					key={synthetic.name}
					liquidation={liquidation}
					synthetic={synthetic}
					decimals={decimals}
					onClick={() => setFocusedLiquidation({ liquidation, synthetic, decimals })}
				/>,
			);
		});
	});

	return (
		<Container className={classes.container}>
			<Typography variant="h4">Liquidations</Typography>
			<TableContainer component={Paper} className={classes.tableContainer}>
				<Table className={classes.table} aria-label="simple table">
					<TableHead>
						<TableRow className={classes.tableRowSubdued}>
							<TableCell component="th" scope="row">
								Token
							</TableCell>
							<TableCell>Price</TableCell>
							<TableCell>Locked / Liquidated</TableCell>
							<TableCell>Initiated</TableCell>
							<TableCell colSpan={2}>Status / Completion</TableCell>
						</TableRow>
					</TableHead>
					<TableBody>{liquidationRows}</TableBody>
				</Table>
			</TableContainer>
			{focusedLiquidation && (
				<LiquidationDialog
					isOpen
					liquidation={focusedLiquidation.liquidation}
					synthetic={focusedLiquidation.synthetic}
					decimals={focusedLiquidation.decimals}
					onClose={() => setFocusedLiquidation(null)}
				/>
			)}
		</Container>
	);
});

export default Liquidations;
