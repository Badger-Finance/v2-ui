import React from 'react';
import { makeStyles } from '@material-ui/core/styles';
import { getColorFromComparison } from './utils';
import { percentageBetweenRange } from '../../utils/componentHelpers';

const useStyles = makeStyles(() => ({
	rankBar: {
		position: 'relative',
		alignSelf: 'stretch',
		width: 4,
		backgroundColor: 'rgba(255, 255, 255, 0.1)',
	},
}));

const useProgressStyles = (currentBoost: number, accountBoost: number, rangeStart: number, rangeEnd: number) => {
	return makeStyles((theme) => {
		const upperLimit = Math.max(currentBoost, accountBoost); // current boost can be greater than account boost
		const lowerLimit = Math.min(currentBoost, accountBoost);

		const sanitizedMax = Math.min(upperLimit, 3); // no matter the input the max boost is 3
		const sanitizedMin = Math.max(lowerLimit, 1); // no matter the input the min boost is 1

		const rawBarHeight = percentageBetweenRange(sanitizedMax, rangeEnd, rangeStart);
		const sanitizedBarHeight = Math.min(rawBarHeight, 100);

		// calculate the height of the difference section between the current boost and account boost
		const differenceSectionHeight = percentageBetweenRange(sanitizedMin, sanitizedMax, rangeStart);

		// show whether the difference is positive or negative
		const differenceColor = getColorFromComparison({
			toCompareValue: currentBoost,
			toBeComparedValue: accountBoost,
			greaterCaseColor: '#74D189',
			lessCaseColor: theme.palette.error.main,
			defaultColor: theme.palette.primary.main,
		});

		return {
			progressBar: {
				position: 'absolute',
				bottom: 0,
				background: `linear-gradient(to top, ${theme.palette.primary.main} 0%, ${theme.palette.primary.main} ${differenceSectionHeight}%, ${differenceColor} ${differenceSectionHeight}%, ${differenceColor} 100%)`,
				width: 4,
				height: `${sanitizedBarHeight}%`,
			},
		};
	});
};

interface Props {
	boost: number;
	accountBoost: number;
	rangeStart: number;
	rangeEnd: number;
}

export const RankProgressBar = ({ boost, accountBoost, rangeStart, rangeEnd }: Props): JSX.Element => {
	const classes = useStyles();
	const progressClasses = useProgressStyles(boost, accountBoost, rangeStart, rangeEnd)();

	return (
		<div className={classes.rankBar}>
			<div className={progressClasses.progressBar} />
		</div>
	);
};
