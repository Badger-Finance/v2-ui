import { Button, Grid, Tooltip, Typography, useMediaQuery, useTheme } from '@material-ui/core';
import { makeStyles, styled } from '@material-ui/core/styles';
import InfoIcon from '@material-ui/icons/Info';
import clsx from 'clsx';
import { StoreContext } from 'mobx/stores/store-context';
import { observer } from 'mobx-react-lite';
import React, { useContext } from 'react';

import { calculateUserBoost } from '../../utils/boost-ranks';
import { isValidCalculatedValue, roundWithPrecision } from '../../utils/componentHelpers';
import { getColorFromComparison } from './utils';

const StyledInfoIcon = styled(InfoIcon)(({ theme }) => ({
	marginLeft: theme.spacing(1),
	color: 'rgba(255, 255, 255, 0.3)',
}));

const useStakeRatioClasses = (currentStakeRatio: number, accountStakeRatio = 0) => {
	return makeStyles((theme) => {
		if (!isValidCalculatedValue(currentStakeRatio) || !isValidCalculatedValue(accountStakeRatio)) {
			return {
				fontColor: {
					color: theme.palette.text.primary,
				},
			};
		}

		return {
			fontColor: {
				color: getColorFromComparison({
					toCompareValue: roundWithPrecision(currentStakeRatio, 4),
					toBeComparedValue: roundWithPrecision(accountStakeRatio, 4),
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

const OptimizerHeader = ({ stakeRatio, onReset }: Props): JSX.Element => {
	const {
		user: { accountDetails },
	} = useContext(StoreContext);
	const classes = useStyles();
	const theme = useTheme();
	const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
	const accountStakeRatio = accountDetails ? accountDetails.nativeBalance / accountDetails.nonNativeBalance : 0;
	const boostClasses = useStakeRatioClasses(stakeRatio, accountStakeRatio)();
	const currentBoost = calculateUserBoost(stakeRatio);
	return (
		<Grid container spacing={isMobile ? 2 : 0} className={classes.header} alignItems="center">
			<Grid item className={classes.boostSectionContainer}>
				<Typography display="inline" className={classes.boostText}>
					Boost:
				</Typography>
				<Typography display="inline" className={clsx(classes.boostValue, boostClasses.fontColor)}>
					{`${currentBoost}x`}
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

export default observer(OptimizerHeader);
