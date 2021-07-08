import React, { useContext } from 'react';
import { Button, Grid, OutlinedInput, Typography, useMediaQuery, useTheme, withStyles } from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';
import BigNumber from 'bignumber.js';
import { getColorFromComparison } from './utils';
import { StoreContext } from '../../mobx/store-context';
import { useNumericInput } from '../../utils/useNumericInput';
import { observer } from 'mobx-react-lite';

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
		justifyContent: 'space-between',
		[theme.breakpoints.up('lg')]: {
			height: 50,
		},
		[theme.breakpoints.down('xs')]: {
			justifyContent: 'center',
		},
	},
	boostText: {
		fontSize: theme.spacing(4),
	},
	invalidBoost: {
		color: theme.palette.error.main,
	},
}));

const isValidBoost = (boost: string) => Number(boost) >= 1 && Number(boost) <= 3;

interface Props {
	boost?: string;
	disableBoost?: boolean;
	onBoostChange: (change: string) => void;
	onReset: () => void;
}

export const CalculatorHeader = observer(
	({ boost, disableBoost = false, onBoostChange, onReset }: Props): JSX.Element => {
		const {
			user: { accountDetails },
		} = useContext(StoreContext);

		const { onValidChange, inputProps } = useNumericInput();
		const classes = useStyles();
		const theme = useTheme();
		const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
		const boostClasses = useBoostStyles(boost, accountDetails?.boost)();
		const validBoost = boost !== undefined ? isValidBoost(boost) : true; // evaluate only after loaded

		return (
			<Grid container spacing={isMobile ? 2 : 0} className={classes.header} alignItems="center">
				<Grid item>
					<Typography display="inline" className={classes.boostText}>
						Boost:
					</Typography>
					<BoostInput
						className={validBoost ? boostClasses.fontColor : classes.invalidBoost}
						disabled={!accountDetails || disableBoost}
						error={!validBoost}
						inputProps={inputProps}
						placeholder="1.00"
						onChange={onValidChange(onBoostChange)}
						value={boost || ''}
					/>
				</Grid>
				<Grid item>
					<Button color="primary" variant="outlined" size="small" onClick={onReset}>
						Reset Calculations
					</Button>
				</Grid>
			</Grid>
		);
	},
);
