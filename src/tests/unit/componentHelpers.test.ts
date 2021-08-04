import 'jest';
import { restrictToRange, roundWithDecimals } from '../../utils/componentHelpers';

describe('Component Helpers', () => {
	describe('restrictToRange', () => {
		test.each([
			[100, 10, 20, 20],
			[Infinity, 1231, 20222, 20222],
			[0, 100, 210, 100],
			[-Infinity, 0, 100, 0],
		])('restrictToRange(%f,%f,%f) returns %f', (val, min, max, restiricetedValue) => {
			expect(restrictToRange(val, min, max)).toEqual(restiricetedValue);
		});
	});

	describe('roundWithDecimals', () => {
		test.each([
			[12.1322, 1, 12.1],
			[100.123121, 2, 100.12],
			[81.6712, 3, 81.671],
		])('roundWithDecimals(%f,%f,%f) returns %f', (num, decimals, roundedValue) => {
			expect(roundWithDecimals(num, decimals)).toEqual(roundedValue);
		});
	});
});
