import {
	calculateNewSupply,
	getNextRebase,
	getTimeBarPercentage,
	toHHMMSS,
	getPercentageChange,
} from '../../mobx/utils/diggHelpers';
import '@testing-library/jest-dom';
import { BigNumber } from 'ethers';

describe('calculateNewSupply', () => {
	const UPPER_LIMIT = 1.05 * 1e18;
	const LOWER_LIMIT = 0.95 * 1e18;
	test.each([
		[UPPER_LIMIT, 1, 2, 1],
		[LOWER_LIMIT, 1, 2, 1],
		[1e18, 1, 2, 1],
		[1e17, 1, 2, 5e16],
		[4, 1, 2, 2.5],
		[-4, 1, 2, -1.5],
		[4, -1, 2, -2.5],
		[4, 1, -2, -0.5],
	])('calculateNewSupply(%f, %f, %f) returns %f', (oracleRate, currentSupply, rebaseLag, expected) => {
		expect(calculateNewSupply(oracleRate, currentSupply, rebaseLag)).toEqual(expected);
	});
});

describe('getNextRebase', () => {
	test.each([
		[10, 1614558530, new Date(1614558540000)],
		[1000, 1614558530, new Date(1614559530000)],
		[-10, 1614558530, new Date(1614558520000)],
		[0, 1614558530, new Date(1614558530000)],
	])('getNextRebase(%f, %f) returns %s', (minRebaseDurationSec, lastRebaseTimestampSec, expected) => {
		expect(getNextRebase(minRebaseDurationSec, lastRebaseTimestampSec)).toEqual(expected);
	});
});

describe('getTimeBarPercentage', () => {
	test.each([
		[10, 9, 10],
		[100, 15, 85],
		[-10, -5, 50],
		[10, 100, 0],
		[0, 100, 0],
		[0, -100, Infinity],
		[10, 0, 100],
	])('getTimeBarPercentage(%f, %f) returns %s', (minRebaseDurationSec, countDown, expected) => {
		expect(getTimeBarPercentage(minRebaseDurationSec, countDown)).toEqual(expected);
	});
});

describe('toHHMMSS', () => {
	test.each([
		['3600', '01:00:00'],
		['43250', '12:00:50'],
		['0', '00:00'],
		['-3600', '0-1:00:00'],
		['43270', '12:01:10'],
	])('toHHMMSS(%s) returns %s', (secs, expected) => {
		expect(toHHMMSS(secs)).toBe(expected);
	});
});

describe('getPercentageChange', () => {
	test.each([
		[BigNumber.from(50), BigNumber.from(100), -50],
		[BigNumber.from(1000), BigNumber.from(10), 9900],
		[BigNumber.from(-100), BigNumber.from(100), -200],
		[BigNumber.from(''), BigNumber.from(100), NaN],
		[BigNumber.from(100), BigNumber.from(''), NaN],
		[BigNumber.from(100), BigNumber.from(100), 0],
	])('getPercentageChange(%f, %f) returns %f', (newValue, originalValue, expected) => {
		expect(getPercentageChange(newValue, originalValue)).toBe(expected);
	});
});
