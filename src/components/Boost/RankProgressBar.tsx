import React from 'react';
import { makeStyles } from '@material-ui/core/styles';
import { getColorFromComparison } from './utils';
import { percentageBetweenRange, roundWithPrecision } from '../../utils/componentHelpers';

const useStyles = makeStyles(() => ({
	rankBar: {
		position: 'relative',
		alignSelf: 'stretch',
		width: 4,
		backgroundColor: 'rgba(255, 255, 255, 0.1)',
	},
}));

const useProgressStyles = (
	currentStakeRatio: number,
	accountStakeRatio: number,
	rangeStart: number,
	rangeEnd: number,
) => {
	return makeStyles((theme) => {
		// we select the highest number as this will decide the bar height
		const highestMultiplierPoint = Math.max(currentStakeRatio, accountStakeRatio);

		const rawBarHeight = percentageBetweenRange(highestMultiplierPoint, rangeEnd, rangeStart);
		const sanitizedBarHeight = Math.min(rawBarHeight, 100); // don't exceed container height

		const isAlreadyOwned = accountStakeRatio > rangeEnd;
		const isStillOwned = currentStakeRatio > rangeEnd;

		// no need to show progress for already acquired levels
		const greaterCaseColor = isAlreadyOwned ? theme.palette.primary.main : '#74D189';

		// even if current boost is less than account boost, if it's still greater than the start of this level
		// then it means it still owns it
		const lessCaseColor = isStillOwned ? theme.palette.primary.main : theme.palette.error.main;

		const differenceColor = getColorFromComparison({
			toCompareValue: roundWithPrecision(currentStakeRatio, 4),
			toBeComparedValue: roundWithPrecision(accountStakeRatio, 4),
			defaultColor: theme.palette.primary.main,
			greaterCaseColor,
			lessCaseColor,
		});

		// we want to differentiate the percentage of the bar that the user owns, f.e: if the user owns 50% of the bar
		// we show a gradient from the start of the bar to the 50% point
		const isOwnedBetweenRange = accountStakeRatio > rangeStart && accountStakeRatio < rangeEnd;
		const percentageOwned = percentageBetweenRange(accountStakeRatio, rangeEnd, rangeStart);
		const gradient = `linear-gradient(to top, ${theme.palette.primary.main} ${percentageOwned}%, ${differenceColor} ${percentageOwned}%)`;

		// there's no point in showing the progress bar if the user doesn't own any of it
		const isValidForGradient = isOwnedBetweenRange && currentStakeRatio > accountStakeRatio;
		const backgroundColor = isValidForGradient ? gradient : differenceColor;

		return {
			progressBar: {
				position: 'absolute',
				bottom: 0,
				background: backgroundColor,
				width: 4,
				height: `${sanitizedBarHeight}%`,
			},
		};
	});
};

interface Props {
	currentStakeRatio: number;
	accountStakeRatio: number;
	rangeStart: number;
	rangeEnd: number;
}

export const RankProgressBar = ({ currentStakeRatio, accountStakeRatio, rangeStart, rangeEnd }: Props): JSX.Element => {
	const classes = useStyles();
	const progressClasses = useProgressStyles(currentStakeRatio, accountStakeRatio, rangeStart, rangeEnd)();
	return (
		<div className={classes.rankBar}>
			<div className={progressClasses.progressBar} />
		</div>
	);
};
