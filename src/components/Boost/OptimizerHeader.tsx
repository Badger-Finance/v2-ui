import React from 'react';
import { Button, Grid, Tooltip, Typography, useMediaQuery, useTheme } from '@material-ui/core';
import InfoIcon from '@material-ui/icons/Info';
import { makeStyles, styled } from '@material-ui/core/styles';
import clsx from 'clsx';
import { getColorFromComparison } from './utils';
import { calculateUserBoost, isValidStakeRatio } from '../../utils/boost-ranks';

const StyledInfoIcon = styled(InfoIcon)(({ theme }) => ({
	marginLeft: theme.spacing(1),
	color: 'rgba(255, 255, 255, 0.3)',
}));

const useMultiplierStyles = (currentMultiplier: number, accountMultiplier = 0) => {
	return makeStyles((theme) => {
		if (!isValidStakeRatio(currentMultiplier) || !isValidStakeRatio(accountMultiplier)) {
			return {
				fontColor: {
					color: theme.palette.text.primary,
				},
			};
		}

		return {
			fontColor: {
				color: getColorFromComparison({
					toCompareValue: currentMultiplier,
					toBeComparedValue: accountMultiplier,
					greaterCaseColor: '#74D189',
					lessCaseColor: theme.palette.error.main,
					defaultColor: theme.palette.text.primary,
				}),
			},
		};
	});
};

const useStyles = makeStyles((theme) => ({
	header: {
		justifyContent: 'space-between',
		[theme.breakpoints.down(480)]: {
			justifyContent: 'center',
		},
	},
	boostText: {
		fontSize: theme.spacing(4),
	},
	boostValue: {
		fontSize: theme.spacing(4),
		marginLeft: theme.spacing(1),
	},
	invalidMultiplier: {
		color: theme.palette.error.main,
	},
	boostSectionContainer: {
		display: 'flex',
		alignItems: 'center',
	},
}));

interface Props {
	stakeRatio: number;
	onReset: () => void;
}

export const OptimizerHeader = ({ stakeRatio, onReset }: Props): JSX.Element => {
	const classes = useStyles();
	const theme = useTheme();
	const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
	const userBoost = calculateUserBoost(stakeRatio);
	const boostClasses = useMultiplierStyles(stakeRatio, userBoost)();
	return (
		<Grid container spacing={isMobile ? 2 : 0} className={classes.header} alignItems="center">
			<Grid item className={classes.boostSectionContainer}>
				<Typography display="inline" className={classes.boostText}>
					Boost:
				</Typography>
				<Typography display="inline" className={clsx(classes.boostValue, boostClasses.fontColor)}>
					{`${userBoost}x`}
				</Typography>
				<Tooltip
					enterTouchDelay={0}
					title={
						'This is a boost estimation at a point in time for the purpose of illustration only. This is a means to help you optimize your returns. Please refer to the Sett page for your specific returns.'
					}
					arrow
					placement="bottom"
					color="primary"
				>
					<StyledInfoIcon />
				</Tooltip>
			</Grid>
			<Grid item>
				<Button color="primary" variant="outlined" size="small" onClick={onReset}>
					Reset Calculations
				</Button>
			</Grid>
		</Grid>
	);
};
