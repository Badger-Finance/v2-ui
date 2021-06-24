import BigNumber from 'bignumber.js';

type ComparisonConfig = {
	toCompareValue: BigNumber.Value;
	toBeComparedValue: BigNumber.Value;
	greaterCaseColor: string;
	lessCaseColor: string;
	defaultColor: string;
};

export const getColorFromComparison = ({
	toCompareValue,
	toBeComparedValue,
	greaterCaseColor,
	lessCaseColor,
	defaultColor,
}: ComparisonConfig): string => {
	const toCompare = new BigNumber(toCompareValue);
	const toBeCompared = new BigNumber(toBeComparedValue);

	if (toCompare.gt(toBeCompared)) return greaterCaseColor;
	if (toCompare.lt(toBeCompared)) return lessCaseColor;

	return defaultColor;
};

// using Number() removes extra zeros
export const formatWithoutExtraZeros = (
	amount: BigNumber.Value,
	decimals = 6,
	strategy = BigNumber.ROUND_HALF_FLOOR,
): string => {
	return Number(new BigNumber(amount).toFixed(decimals, strategy)).toString();
};

/**
 * Calculates the percentage of a given point within a range
 */
export const percentageBetweenRange = (point: number, upperLimit: number, lowerLimit: number): number => {
	return ((point - lowerLimit) / (upperLimit - lowerLimit)) * 100;
};
