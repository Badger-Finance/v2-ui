import { formatTokens, inCurrency, numberWithCommas, toFixedDecimals } from '../../mobx/utils/helpers';
import '@testing-library/jest-dom';
import BigNumber from 'bignumber.js';
import store from 'mobx/RootStore';
import { Currency } from 'config/enums/currency.enum';
import { SAMPLE_EXCHANGES_RATES } from '../utils/samples';

describe('helpers', () => {
	beforeAll(() => (store.prices.exchangeRates = SAMPLE_EXCHANGES_RATES));

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

	describe('inCurrency', () => {
		test.each([
			[new BigNumber(1000000), Currency.ETH, 0, 'Ξ1,000,000'],
			[new BigNumber(15.456789355), Currency.ETH, 18, 'Ξ15.456789355000000000'],
			[new BigNumber(0.0000435645), Currency.ETH, 18, 'Ξ0.000043564500000000'],
			[new BigNumber(0.000001), Currency.ETH, 5, 'Ξ0.10000e-5'],
			[new BigNumber(0.000001), Currency.ETH, 18, 'Ξ0.000001000000000000'],
			[new BigNumber(0.0000000001), Currency.ETH, 9, 'Ξ0.100000000e-9'],
			[new BigNumber(0.0001), Currency.ETH, 5, 'Ξ0.00010'],
			[new BigNumber(''), Currency.ETH, 18, undefined],
			[new BigNumber(-1000000), Currency.ETH, 18, 'Ξ-1,000,000.000000000000000000'],
			[new BigNumber(12.5678), Currency.BTC, 9, `₿${(12.5678 * SAMPLE_EXCHANGES_RATES.btc).toFixed(9)}`],
			[new BigNumber(-12.5678), Currency.BTC, 9, `₿-${(12.5678 * SAMPLE_EXCHANGES_RATES.btc).toFixed(9)}`],
			[new BigNumber(0.00001), Currency.BTC, 2, `₿0.04e-2`],
			[new BigNumber(1), Currency.CAD, undefined, `C$${SAMPLE_EXCHANGES_RATES.cad}`],
			[new BigNumber(0.00001), Currency.CAD, 1, 'C$0.1e-1'], // Bignumber rounding
			[new BigNumber(1), Currency.USD, undefined, `$${SAMPLE_EXCHANGES_RATES.usd}`],
			[new BigNumber(0.00001), Currency.USD, 1, '$0.1e-1'], // Bignumber rounding
		])('inCurrency(%f, %s, %i) returns %s', (value, currency, preferredDecimals, expected) => {
			expect(inCurrency(value, currency, preferredDecimals)).toBe(expected);
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
});
