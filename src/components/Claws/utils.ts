import BigNumber from 'bignumber.js';
import { INVALID_REASON } from './index';

export interface ValidationParams {
	amount: string | BigNumber;
	maximum: BigNumber;
	minimum?: BigNumber;
}

export function validateAmountBoundaries({
	amount,
	maximum,
	minimum = new BigNumber('0'),
}: ValidationParams): INVALID_REASON | undefined {
	let error: INVALID_REASON | undefined = undefined;

	const input = new BigNumber(amount);
	const amountExceedsBalance = input.gt(maximum);
	const amountIsLessThanMinimum = input.lt(minimum);

	if (amountIsLessThanMinimum) error = INVALID_REASON.UNDER_MINIMUM;
	if (amountExceedsBalance) error = INVALID_REASON.OVER_MAXIMUM;

	console.log({
		input: input.toString(),
		minimum: minimum.toString(),
		maximum: maximum.toString(),
		amountExceedsBalance,
		amountIsLessThanMinimum,
		error,
	});

	return error;
}
