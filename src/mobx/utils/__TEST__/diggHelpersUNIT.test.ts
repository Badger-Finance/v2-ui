import {
	calculateNewSupply,
	getNextRebase,
	getTimeBarPercentage,
	toHHMMSS,
	shortenNumbers,
	getPercentageChange,
	getDiggPerShare,
} from '../diggHelpers';
import '@testing-library/jest-dom';
import BigNumber from 'bignumber.js';
import { Token, Vault } from 'mobx/model';
import { AbiItem } from 'web3-utils';
import { RootStore } from 'mobx/store';

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

describe('shortenNumbers', () => {
	test.each([
		[new BigNumber(10000000), '', undefined, undefined, ' 10.00m'],
		[new BigNumber(10000), '', undefined, undefined, ' 10,000.00000'],
		[new BigNumber(101000), '', undefined, undefined, ' 101.00k'],
		[new BigNumber(1), '', undefined, undefined, ' 1.00000'],
		[new BigNumber(0.000001), '', undefined, undefined, ' 0.10000e-5'],
		[new BigNumber(0.000001), '', 6, undefined, ' 0.000001'],
		[new BigNumber(1000000), '', undefined, true, ' 1000000.00000'],
		[new BigNumber(1000000000), '', undefined, true, ' 1000000000.00000'],
		[new BigNumber(1000000), '$', undefined, undefined, '$ 1,000.00k'],
		[new BigNumber(''), 'C$', 2, undefined, 'C$ 0.00'],
		[new BigNumber(-1000), '', 18, undefined, ' -1,000.000000000000000000'],
	])('shortenNumbers(%f, %s, $i, $s) returns %s', (value, prefix, preferedDecimals, noCommas, expected) => {
		expect(shortenNumbers(value, prefix, preferedDecimals, noCommas)).toBe(expected);
	});
});

describe('getPercentageChange', () => {
	test.each([
		[new BigNumber(50), new BigNumber(100), -50],
		[new BigNumber(1000), new BigNumber(10), 9900],
		[new BigNumber(-100), new BigNumber(100), -200],
		[new BigNumber(''), new BigNumber(100), NaN],
		[new BigNumber(100), new BigNumber(''), NaN],
		[new BigNumber(100), new BigNumber(100), 0],
	])('getPercentageChange(%f, %f) returns %f', (newValue, originalValue, expected) => {
		expect(getPercentageChange(newValue, originalValue)).toBe(expected);
	});
});

describe('getDiggPerShare', () => {
	// Mock abi object
	const abi: AbiItem = { type: 'constructor' };
	// Mock Vault object
	const vault = new Vault(
		new RootStore(),
		'0x1a1a1a1a1a1a1a1a1a1a1a1a1a1a1a1a1a1a1a1a',
		18,
		new Token(new RootStore(), '0x1a1a1a1a1a1a1a1a1a1a1a1a1a1a1a1a1a1a1a1a', 18),
		abi,
	);

	test('vaultBalance = totalSupply = undefined, returns 1', () => {
		expect(getDiggPerShare(vault)).toEqual(1);
	});
	test('vaultBalance = 1000 & totalSupply = undefined, returns 1', () => {
		vault.vaultBalance = new BigNumber(1000);
		expect(getDiggPerShare(vault)).toEqual(1);
	});
	test('vaultBalance = NaN & totalSupply = 1000, returns NaN', () => {
		vault.vaultBalance = new BigNumber(NaN);
		vault.totalSupply = new BigNumber(1000);
		expect(getDiggPerShare(vault)).toEqual(new BigNumber(NaN));
	});
	test('vaultBalance = 0.000005 & totalSupply = 1000, returns 5', () => {
		vault.vaultBalance = new BigNumber(0.000005);
		vault.totalSupply = new BigNumber(1000);
		expect(getDiggPerShare(vault)).toEqual(new BigNumber(5));
	});
	test('vaultBalance = -0.000005 & totalSupply = 1000, returns -5', () => {
		vault.vaultBalance = new BigNumber(-0.000005);
		vault.totalSupply = new BigNumber(1000);
		expect(getDiggPerShare(vault)).toEqual(new BigNumber(-5));
	});
	test('vaultBalance = 0.000005 & totalSupply = -1000, returns -5', () => {
		vault.vaultBalance = new BigNumber(0.000005);
		vault.totalSupply = new BigNumber(-1000);
		expect(getDiggPerShare(vault)).toEqual(new BigNumber(-5));
	});
	test('vaultBalance = 1000 & totalSupply = 0, returns Infinity', () => {
		vault.vaultBalance = new BigNumber(1000);
		vault.totalSupply = new BigNumber(0);
		expect(getDiggPerShare(vault)).toEqual(new BigNumber(Infinity));
	});
	test('vaultBalance = 0 & totalSupply = 1000, returns 0', () => {
		// Creating new vault to reset value of vaultBalance to 0 its default, 0
		const vault2 = new Vault(
			new RootStore(),
			'0x1a1a1a1a1a1a1a1a1a1a1a1a1a1a1a1a1a1a1a1a',
			18,
			new Token(new RootStore(), '0x1a1a1a1a1a1a1a1a1a1a1a1a1a1a1a1a1a1a1a1a', 18),
			abi,
		);
		vault2.totalSupply = new BigNumber(1000);
		expect(getDiggPerShare(vault2)).toEqual(new BigNumber(0));
	});
});
