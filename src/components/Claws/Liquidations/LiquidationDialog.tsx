import React from 'react';
import { makeStyles } from '@material-ui/core/styles';
import {
	Button,
	Dialog,
	DialogActions,
	DialogContent,
	DialogTitle,
	Divider,
	Grid,
	Typography,
} from '@material-ui/core';

export const useMainStyles = makeStyles((theme) => ({
	transactionRow: {
		marginTop: theme.spacing(1),
	},
	dialogTitle: {
		borderBottom: theme.palette.common.white,
	},
	dialogContent: {
		paddingBottom: theme.spacing(2),
		paddingTop: theme.spacing(0),
	},
	dialogActions: {
		paddingBottom: theme.spacing(2),
		paddingTop: theme.spacing(2),
		paddingLeft: theme.spacing(3),
		paddingRight: theme.spacing(3),
	},
	mx: {
		marginRight: theme.spacing(3),
		marginLeft: theme.spacing(3),
	},
}));

interface TransactionRowProps {
	header: any;
	content: any;
}

const TransactionRow: React.FC<TransactionRowProps> = ({ header, content }) => {
	const classes = useMainStyles();
	return (
		<Grid container spacing={2} className={classes.transactionRow} alignItems="center">
			<Grid item xs={4}>
				{header}
			</Grid>
			<Grid item xs={8}>
				<Typography variant="body2" color="textPrimary">
					{content}
				</Typography>
			</Grid>
		</Grid>
	);
};

const transactionRows = [
	['Token', 'eClaw FEB29'],
	['Amount', 234.23],
	['Completes On', 'Feb 29th, 2021 @ 12:00 MST'],
	['Locked Collateral', 0.013],
	['Liquidated Collateral', 0.012],
	['Settlement Price', '$63,393'],
	['Fee', '$33.33'],
	['Liquidator', '0x0BC9ce5dE1Ed7a4e31EB1A33Aef43D4d1057F8C6'],
	['Disputer', '0x0BC9ce5dE1Ed7a4e31EB1A33Aef43D4d1057F8C6'],
];

interface Props {
	isOpen?: boolean;
}

export const LiquidationDialog: React.FC<Props> = ({ isOpen = false }) => {
	const classes = useMainStyles();

	return (
		<Dialog maxWidth="sm" fullWidth={true} aria-labelledby="liquidation-dialog" open={isOpen}>
			<DialogTitle className={classes.dialogTitle} id="liquidation-dialog-title">
				eCLAW FEB29 Transaction
			</DialogTitle>
			<Divider variant="middle" className={classes.mx} />
			<DialogContent className={classes.dialogContent}>
				{transactionRows.map((row) => {
					return <TransactionRow header={row[0]} content={row[1]}/>
				})}
			</DialogContent>
			<Divider variant="middle" className={classes.mx} />
			<DialogActions className={classes.dialogActions}>
				<Button color="primary">Cancel</Button>
			</DialogActions>
		</Dialog>
	);
};
