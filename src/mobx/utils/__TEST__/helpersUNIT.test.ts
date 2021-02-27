import { formatTokens } from '../helpers';
import '@testing-library/jest-dom';
import BigNumber from 'bignumber.js';

describe('formatTokens', () => {
	test.each([
		[new BigNumber(1000000), , '1,000,000.00'],
		[new BigNumber(1234567.891234), , '1,234,567.89'],
		[new BigNumber(0.0000435645), , '0.00004'],
		[new BigNumber(0.0000435645), 18, '0.000043564500000000'],
		[new BigNumber(0.000001), , '< 0.00001'],
		[new BigNumber(0.000001), 18, '0.000001000000000000'],
		[new BigNumber(0.000001), 9, '0.000001000'],
		[new BigNumber(''), , '0.00000'],
		[new BigNumber(''), 18, '0.000000000000000000'],
		[new BigNumber(''), 9, '0.000000000'],
	])('formatTokens(%i, %i) returns %i', (value, decimals, expected) => {
		expect(formatTokens(value, decimals)).toBe(expected);
	});
});
