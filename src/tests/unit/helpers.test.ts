import '@testing-library/jest-dom';

import BigNumber from 'bignumber.js';
import store from 'mobx/stores/RootStore';

import { ExchangeRates } from '../../mobx/model/system-config/exchange-rates';
import { formatTokens, numberWithCommas, parseQueryMultipleParams, toFixedDecimals } from '../../mobx/utils/helpers';

describe('helpers', () => {
	const exchangeRates: ExchangeRates = {
		usd: 641.69,
		cad: 776.44,
		btc: 41.93,
		bnb: 7.2,
		matic: 1831.21,
		xdai: 1430.23,
		ftm: 1,
		avax: 1,
	};

	beforeAll(() => (store.prices.exchangeRates = exchangeRates));

	describe('formatTokens', () => {
		test.each([
			[new BigNumber(1000000), undefined, '1,000,000.00'],
			[new BigNumber(1234567.891234), undefined, '1,234,567.89'],
			[new BigNumber(0.0000435645), undefined, '0.00004'],
			[new BigNumber(0.0000435645), 18, '0.000043564500000000'],
			[new BigNumber(0.000001), undefined, '< 0.00001'],
			[new BigNumber(0.000001), 18, '0.000001000000000000'],
			[new BigNumber(0.000001), 9, '0.000001000'],
			[new BigNumber(''), undefined, '0.00000'],
			[new BigNumber(''), 18, '0.000000000000000000'],
			[new BigNumber(''), 9, '0.000000000'],
			[new BigNumber(-1000), undefined, '-1,000.00000'],
		])('formatTokens(%f, %i) returns %s', (value, decimals, expected) => {
			expect(formatTokens(value, decimals)).toBe(expected);
		});
	});

	describe('numberWithCommas', () => {
		test.each([
			['1000', '1,000'],
			['1000000.1000', '1,000,000.1000'],
			['100', '100'],
			['-1000000.00', '-1,000,000.00'],
		])('formatTokens(%s) returns %s', (x, expected) => {
			expect(numberWithCommas(x)).toBe(expected);
		});
	});

	describe('toFixedDecimals', () => {
		test.each([
			[new BigNumber(1000000), 2, '1000000.00'],
			[new BigNumber(1234567.891234), 3, '1234567.891'],
			[new BigNumber(0.0000435645), 3, '0.044e-3'],
			[new BigNumber(0.000001), 9, '0.000001000'],
			[new BigNumber(1234567.891234), 8, '1234567.89123400'],
			[new BigNumber(0), 5, '0.00000'],
		])('toFixedDecimals(%f, %i) returns %s', (value, decimals, expected) => {
			expect(toFixedDecimals(value, decimals)).toBe(expected);
		});
	});

	describe('parseQueryMultipleParams', () => {
		test.each([
			[undefined, undefined],
			['', undefined],
			['value', ['value']],
			[
				['value1', 'value2'],
				['value1', 'value2'],
			],
		])('parseQueryMultipleParams(%s) returns %s', (query, expected) => {
			expect(parseQueryMultipleParams(query)).toEqual(expected);
		});
	});
});
