import React, { useContext } from 'react';
import { Grid, OutlinedInput, Typography, withStyles } from '@material-ui/core';
import { Skeleton } from '@material-ui/lab';
import clsx from 'clsx';
import { makeStyles } from '@material-ui/core/styles';
import BigNumber from 'bignumber.js';
import { getColorFromComparison } from './utils';
import { StoreContext } from '../../mobx/store-context';
import { useNumericInput } from '../../utils/useNumericInput';

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

const useRankStyles = (currentRank?: string, rank?: BigNumber.Value) => {
	return makeStyles((theme) => {
		if (!currentRank || !rank) {
			return {
				fontColor: {
					color: theme.palette.text.secondary,
				},
			};
		}

		return {
			fontColor: {
				color: getColorFromComparison({
					toCompareValue: currentRank,
					toBeComparedValue: rank,
					greaterCaseColor: theme.palette.error.main,
					lessCaseColor: '#74D189',
					defaultColor: theme.palette.text.secondary,
				}),
			},
		};
	});
};

const useStyles = makeStyles((theme) => ({
	header: {
		padding: theme.spacing(2),
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
	invalidBoost: {
		color: theme.palette.error.main,
	},
}));

const isValidBoost = (boost: string) => Number(boost) >= 1 && Number(boost) <= 3;

interface Props {
	boost?: string;
	rank?: string;
	onBoostChange: (change: string) => void;
}

export const BoostCalculatorHeader = ({ boost, rank, onBoostChange }: Props): JSX.Element => {
	const {
		user: { accountDetails },
	} = useContext(StoreContext);

	const { onValidChange, inputProps } = useNumericInput();
	const classes = useStyles();
	const boostClasses = useBoostStyles(boost, accountDetails?.boost)();
	const rankClasses = useRankStyles(rank, accountDetails?.boostRank)();
	const validBoost = boost !== undefined ? isValidBoost(boost) : true; // evaluate only after loaded

	return (
		<Grid container direction="column" justify="center" spacing={3} className={classes.header}>
			<Grid container justify="center" alignItems="center">
				<Typography className={classes.boostText}>Boost: </Typography>
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
			<Grid className={classes.rankContainer} container justify="center" alignItems="center">
				<Typography color="textSecondary">Rank: </Typography>
				<Typography
					color="textSecondary"
					className={clsx(classes.rankValue, rank !== undefined && rankClasses.fontColor)}
				>
					{rank || <Skeleton width={35} />}
				</Typography>
			</Grid>
		</Grid>
	);
};
