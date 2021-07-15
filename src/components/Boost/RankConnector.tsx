import React from 'react';
import { makeStyles } from '@material-ui/core/styles';
import { getColorFromComparison } from './utils';

const useRankConnectorStyles = (currentBoost: number, accountBoost: number, rankLevelBoost: number) => {
	const upperLimit = Math.max(currentBoost, accountBoost);
	const lowerLimit = Math.min(currentBoost, accountBoost);

	const differenceSection = upperLimit - lowerLimit;
	const isLocked = rankLevelBoost > upperLimit;
	const isObtained = accountBoost >= rankLevelBoost;

	// only show difference on connectors of ranks that are above the current boost
	const shouldShowNegativeChange = rankLevelBoost > upperLimit - differenceSection;

	return makeStyles((theme) => {
		let backgroundColor: string;

		if (isLocked) {
			backgroundColor = 'rgba(255, 255, 255, 0.1)';
		} else {
			backgroundColor = getColorFromComparison({
				toCompareValue: currentBoost,
				toBeComparedValue: accountBoost,
				greaterCaseColor: isObtained ? theme.palette.primary.main : '#74D189',
				lessCaseColor: shouldShowNegativeChange ? theme.palette.error.main : theme.palette.primary.main,
				defaultColor: theme.palette.primary.main,
			});
		}

		return {
			connector: {
				width: 5,
				height: 2,
				marginLeft: 2,
				marginRight: 8,
				background: backgroundColor,
			},
		};
	});
};

interface Props {
	boost: number;
	accountBoost: number;
	rankBoost: number;
}

export const RankConnector = ({ boost, accountBoost, rankBoost }: Props): JSX.Element => {
	const classes = useRankConnectorStyles(boost, accountBoost, rankBoost)();

	return <div className={classes.connector} />;
};
