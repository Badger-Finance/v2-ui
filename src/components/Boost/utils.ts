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

export const isValidBoost = (boost: string): boolean => Number(boost) >= 1 && Number(boost) <= 3;
