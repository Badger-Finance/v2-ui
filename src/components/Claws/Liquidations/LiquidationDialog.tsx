import React from 'react';
import { makeStyles } from '@material-ui/core/styles';
import { Dialog, DialogTitleProps, DialogContent, Divider, Grid, IconButton, Typography } from '@material-ui/core';
import MuiDialogTitle from '@material-ui/core/DialogTitle';
import CloseIcon from '@material-ui/icons/Close';
import { Liquidation, SyntheticData } from 'mobx/model';
import { Direction, scaleToString } from 'utils/componentHelpers';

interface Props {
	isOpen?: boolean;
	liquidation: Liquidation;
	synthetic: SyntheticData;
	decimals: number;
	onClose: () => void;
}

interface DialogProps extends DialogTitleProps {
	onClose: () => void;
}

const useStyles = makeStyles((theme) => ({
	dialogTitle: {
		borderBottom: theme.palette.common.white,
		margin: 0,
		padding: theme.spacing(2, 4),
	},
	dialogContent: {
		padding: theme.spacing(3, 4),
	},
	closeButton: {
		position: 'absolute',
		right: theme.spacing(1),
		top: theme.spacing(1),
		color: theme.palette.grey[500],
	},
}));

const DialogTitle = (props: DialogProps) => {
	const classes = useStyles();
	const { children, onClose, ...other } = props;

	return (
		<MuiDialogTitle disableTypography className={classes.dialogTitle} {...other}>
			<Typography variant="h6">{children}</Typography>
			<IconButton aria-label="close" className={classes.closeButton} onClick={onClose}>
				<CloseIcon />
			</IconButton>
		</MuiDialogTitle>
	);
};

export const LiquidationDialog = ({ isOpen = false, liquidation, synthetic, decimals, onClose }: Props) => {
	const classes = useStyles();

	const {
		rawUnitCollateral,
		lockedCollateral,
		liquidatedCollateral,
		liquidationTime,
		settlementPrice,
		liquidator,
		disputer,
		finalFee,
	} = liquidation;

	return (
		<Dialog maxWidth="sm" fullWidth={true} aria-labelledby="liquidation-dialog" open={isOpen}>
			<DialogTitle onClose={onClose}>eCLAW FEB29 Transaction</DialogTitle>
			<Divider variant="middle" />
			<DialogContent className={classes.dialogContent}>
				<Grid container spacing={2} alignItems="center">
					<Grid item container xs={12}>
						<Grid item xs={4}>
							<Typography variant="body2" color="textPrimary">
								Token
							</Typography>
						</Grid>
						<Grid item xs={8}>
							<Typography variant="body2" color="textPrimary">
								{synthetic.name}
							</Typography>
						</Grid>
					</Grid>
					<Grid item container xs={12}>
						<Grid item xs={4}>
							<Typography variant="body2" color="textPrimary">
								Amount
							</Typography>
						</Grid>
						<Grid item xs={8}>
							<Typography variant="body2" color="textPrimary">
								{scaleToString(rawUnitCollateral, decimals, Direction.Down)}
							</Typography>
						</Grid>
					</Grid>
					<Grid item container xs={12}>
						<Grid item xs={4}>
							<Typography variant="body2" color="textPrimary">
								Completes On
							</Typography>
						</Grid>
						<Grid item xs={8}>
							<Typography variant="body2" color="textPrimary">
								{'-'}
							</Typography>
						</Grid>
					</Grid>
					<Grid item container xs={12}>
						<Grid item xs={4}>
							<Typography variant="body2" color="textPrimary">
								Locked Collateral
							</Typography>
						</Grid>
						<Grid item xs={8}>
							<Typography variant="body2" color="textPrimary">
								{scaleToString(lockedCollateral, decimals, Direction.Down)}
							</Typography>
						</Grid>
					</Grid>
					<Grid item container xs={12}>
						<Grid item xs={4}>
							<Typography variant="body2" color="textPrimary">
								Liquidated Collateral
							</Typography>
						</Grid>
						<Grid item xs={8}>
							<Typography variant="body2" color="textPrimary">
								{scaleToString(liquidatedCollateral, decimals, Direction.Down)}
							</Typography>
						</Grid>
					</Grid>
					<Grid item container xs={12}>
						<Grid item xs={4}>
							<Typography variant="body2" color="textPrimary">
								Settlement Price
							</Typography>
						</Grid>
						<Grid item xs={8}>
							<Typography variant="body2" color="textPrimary">
								{scaleToString(settlementPrice, decimals, Direction.Down)}
							</Typography>
						</Grid>
					</Grid>
					<Grid item container xs={12}>
						<Grid item xs={4}>
							<Typography variant="body2" color="textPrimary">
								Fee
							</Typography>
						</Grid>
						<Grid item xs={8}>
							<Typography variant="body2" color="textPrimary">
								{finalFee.toString()}
							</Typography>
						</Grid>
					</Grid>
					<Grid item container xs={12}>
						<Grid item xs={4}>
							<Typography variant="body2" color="textPrimary">
								Liquidator
							</Typography>
						</Grid>
						<Grid item xs={8}>
							<Typography variant="body2" color="textPrimary">
								{liquidator.toString()}
							</Typography>
						</Grid>
					</Grid>
					<Grid item container xs={12}>
						<Grid item xs={4}>
							<Typography variant="body2" color="textPrimary">
								Disputer
							</Typography>
						</Grid>
						<Grid item xs={8}>
							<Typography variant="body2" color="textPrimary">
								{disputer.toString()}
							</Typography>
						</Grid>
					</Grid>
				</Grid>
			</DialogContent>
		</Dialog>
	);
};
