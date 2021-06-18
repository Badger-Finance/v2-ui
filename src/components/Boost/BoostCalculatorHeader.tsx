import React, { useContext } from 'react';
import { Button, Grid, OutlinedInput, Typography, withStyles } from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';
import BigNumber from 'bignumber.js';
import { getColorFromComparison } from './utils';
import { StoreContext } from '../../mobx/store-context';
import { useNumericInput } from '../../utils/useNumericInput';
import clsx from 'clsx';

const BoostInput = withStyles(() => ({
	root: {
		marginLeft: 12,
		maxWidth: 60,
	},
	input: {
		fontSize: 21,
		padding: 8,
		textAlign: 'center',
	},
	notchedOutline: {
		borderWidth: 2,
	},
}))(OutlinedInput);

const useBoostStyles = (currentBoost?: string, boost?: BigNumber.Value) => {
	return makeStyles((theme) => {
		if (!currentBoost || !boost) {
			return {
				fontColor: {
					color: theme.palette.text.secondary,
				},
			};
		}

		return {
			fontColor: {
				color: getColorFromComparison({
					toCompareValue: currentBoost,
					toBeComparedValue: boost,
					greaterCaseColor: '#74D189',
					lessCaseColor: theme.palette.error.main,
					defaultColor: theme.palette.text.secondary,
				}),
			},
		};
	});
};

const useStyles = makeStyles((theme) => ({
	header: {
		height: 50,
	},
	boostText: {
		fontSize: theme.spacing(4),
	},
	rankContainer: {
		marginTop: 4,
	},
	rankValue: {
		marginLeft: 6,
	},
	boostContainer: {
		textAlign: 'center',
	},
	invalidBoost: {
		color: theme.palette.error.main,
	},
	estimatedEarningsContainer: {
		marginRight: 10,
	},
	estimatedEarningsText: {
		fontSize: 12,
		textTransform: 'uppercase',
	},
	estimatedEarningsAmount: {
		fontSize: 20,
	},
	resetCalculations: {
		textAlign: 'end',
	},
	resetButton: {
		height: 34,
	},
}));

const isValidBoost = (boost: string) => Number(boost) >= 1 && Number(boost) <= 3;

interface Props {
	boost?: string;
	onBoostChange: (change: string) => void;
	onReset: () => void;
}

export const BoostCalculatorHeader = ({ boost, onBoostChange, onReset }: Props): JSX.Element => {
	const {
		user: { accountDetails },
	} = useContext(StoreContext);

	const { onValidChange, inputProps } = useNumericInput();
	const classes = useStyles();
	const boostClasses = useBoostStyles(boost, accountDetails?.boost)();
	const validBoost = boost !== undefined ? isValidBoost(boost) : true; // evaluate only after loaded

	return (
		<Grid container className={classes.header} alignItems="center">
			<Grid item container xs>
				<Grid item className={classes.estimatedEarningsContainer}>
					<Typography className={classes.estimatedEarningsText} color="textSecondary">
						Estimated
					</Typography>
					<Typography className={classes.estimatedEarningsText} color="textSecondary">
						Earnings:
					</Typography>
				</Grid>
				<Grid item>
					<Typography className={clsx(classes.estimatedEarningsText, classes.estimatedEarningsAmount)}>
						$5,630
					</Typography>
				</Grid>
			</Grid>
			<Grid item xs={5} className={classes.boostContainer}>
				<Typography display="inline" className={classes.boostText}>
					Boost:
				</Typography>
				<BoostInput
					className={validBoost ? boostClasses.fontColor : classes.invalidBoost}
					disabled={!accountDetails}
					error={!validBoost}
					inputProps={inputProps}
					placeholder="1.00"
					onChange={onValidChange(onBoostChange)}
					value={boost || ''}
				/>
			</Grid>
			<Grid item xs className={classes.resetCalculations}>
				<Button
					className={classes.resetButton}
					color="primary"
					variant="outlined"
					size="small"
					onClick={onReset}
				>
					Reset Calculations
				</Button>
			</Grid>
		</Grid>
	);
};
