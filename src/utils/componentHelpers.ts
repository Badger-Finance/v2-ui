import BigNumber from 'bignumber.js';

import { TEN } from 'config/constants';

export enum BOUNDARY_ERROR {
	OVER,
	UNDER,
}

interface ValidationParams {
	amount: string | BigNumber;
	maximum?: BigNumber;
	minimum?: BigNumber;
}

export const debounce = (n: number, fn: (...params: any[]) => any, immediate = false): any => {
	let timer: any = undefined;
	return function (this: any, ...args: any[]) {
		if (timer === undefined && immediate) {
			fn.apply(this, args);
		}
		clearTimeout(timer);
		timer = setTimeout(() => fn.apply(this, args), n);
		return timer;
	};
};

export const shortenAddress = (address: string): string => {
	if (!address) return '';
	return address.slice(0, 6) + '...' + address.slice(address.length - 6, address.length);
};

export enum Direction {
	Up = 1,
	Down,
}

// scaleToString will flexibly scale a BigNumber Value (or undefined).
export const scaleToString = (n: BigNumber.Value | undefined, decimals: number, direction: Direction): string => {
	if (typeof n === 'undefined') {
		return '0';
	}
	const v = new BigNumber(n as BigNumber.Value);
	if (v.isNaN()) {
		return '0';
	}
	switch (direction) {
		case Direction.Up: {
			return v.multipliedBy(TEN.pow(decimals)).toString();
		}
		case Direction.Down: {
			return v.dividedBy(TEN.pow(decimals)).toString();
		}
		default: {
			throw `Unknown scale direction ${direction}`;
		}
	}
};

/**
 * Helper function that checks if values is between two limits
 * @param values amount, max and min
 * @returns boundary error or undefined if not error is found
 */
export function validateAmountBoundaries({
	amount,
	maximum = new BigNumber('Infinity'),
	minimum = new BigNumber('0'),
}: ValidationParams): BOUNDARY_ERROR | undefined {
	let error: BOUNDARY_ERROR | undefined = undefined;

	const input = new BigNumber(amount);
	const amountExceedsUpperLimit = input.gt(maximum);
	const amountIsUnderBottomLimit = input.lt(minimum);

	if (amountIsUnderBottomLimit) error = BOUNDARY_ERROR.UNDER;
	if (amountExceedsUpperLimit) error = BOUNDARY_ERROR.OVER;

	return error;
}
