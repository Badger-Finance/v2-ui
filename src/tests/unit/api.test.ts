import { formatUsd, formatWithCommas } from '../../mobx/utils/api';
import '@testing-library/jest-dom';

describe('formatUsd', () => {
	test.each([
		[1, '1'],
		[1234.5678, '1,234.56'],
		[1558869987.901, '1,558,869,987.90'],
		[-1000.001, '-1,000.00'],
		[NaN, 'NaN'],
	])('formatUsd(%f) returns %s', (x, expected) => {
		expect(formatUsd(x)).toEqual(expected);
	});
});

describe('formatWithCommas', () => {
	test.each([
		[1, '1'],
		[1234.5678912, '1,234.56789'],
		[1558869987.901, '1,558,869,987.901'],
		[-1000.001, '-1,000.001'],
		[NaN, 'NaN'],
	])('formatWithCommas(%f) returns %s', (x, expected) => {
		expect(formatWithCommas(x)).toEqual(expected);
	});
});
