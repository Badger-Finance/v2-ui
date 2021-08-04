export const restrictToRange = (num: number, min: number, max: number): number => Math.min(Math.max(num, min), max);

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

/**
 * Calculates the percentage of a given point within a range
 */
export const percentageBetweenRange = (point: number, upperLimit: number, lowerLimit: number): number => {
	if (point < lowerLimit) {
		return 0;
	}

	if (point >= upperLimit) {
		return 100;
	}
	return ((point - lowerLimit) / (upperLimit - lowerLimit)) * 100;
};

export const roundWithDecimals = (value: number, decimals: number): number => {
	const decimalsCriteria = Math.pow(10, decimals);
	return Math.round((value + Number.EPSILON) * decimalsCriteria) / decimalsCriteria;
};
