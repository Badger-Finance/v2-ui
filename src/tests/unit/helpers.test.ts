import { formatTokens, inCurrency, usdToCurrency, numberWithCommas, toFixedDecimals } from '../../mobx/utils/helpers';
import '@testing-library/jest-dom';
import BigNumber from 'bignumber.js';
import { ExchangeRates } from 'mobx/model';
import store from 'mobx/store';

describe('helpers', () => {
	const exchangeRates: ExchangeRates = { usd: 641.69, cad: 776.44, btc: 41.93, bnb: 7.2 };

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

	describe('inCurrency', () => {
		test.each([
			[new BigNumber(1000000), 'eth', true, 18, true, '1000000.00'],
			[new BigNumber(1000000), 'eth', undefined, 18, undefined, 'Ξ 1,000,000.00'],
			[new BigNumber(123456789123.456789), 'eth', true, 18, undefined, '123,456,789,123.46'],
			[new BigNumber(0.0000435645), 'eth', true, 18, undefined, '0.000043564500000000'],
			[new BigNumber(0.000001), 'eth', true, 5, undefined, '0.10000e-5'],
			[new BigNumber(0.000001), 'eth', true, 18, undefined, '0.000001000000000000'],
			[new BigNumber(0.0000000001), 'eth', true, 9, undefined, '0.100000000e-9'],
			[new BigNumber(0.0001), 'eth', true, 5, undefined, '0.00010'],
			[new BigNumber(''), 'eth', false, 18, undefined, undefined],
			[new BigNumber(-1000000), 'eth', true, 18, false, '-1,000,000.000000000000000000'],
			[new BigNumber(12.5678), 'btc', true, 9, undefined, `₿ ${(12.5678 * exchangeRates.btc).toFixed(9)}`],
			[new BigNumber(-12.5678), 'btc', false, 9, undefined, `₿ -${(12.5678 * exchangeRates.btc).toFixed(9)}`],
			[new BigNumber(0.00001), 'btc', false, 2, undefined, `₿ 0.04e-2`],
			[new BigNumber(1), 'cad', true, undefined, undefined, `C$${exchangeRates.cad}`],
			[new BigNumber(0.00001), 'cad', false, 1, undefined, 'C$0.1e-1'], // Bignumber rounding
			[new BigNumber(1), 'usd', true, undefined, undefined, `$${exchangeRates.usd}`],
			[new BigNumber(0.00001), 'usd', false, 1, undefined, '$0.1e-1'], // Bignumber rounding
		])(
			'inCurrency(%f, %s, %s, %i, %s) returns %s',
			(value, currency, hide, preferredDecimals, noCommas, expected) => {
				expect(inCurrency(value, currency, hide, preferredDecimals, noCommas)).toBe(expected);
			},
		);
	});

	describe('usdToCurrency', () => {
		test.each([
			[new BigNumber(1000000), 'usd', undefined, undefined, undefined, '$1,000,000.00'],
			[new BigNumber(1000000), 'usd', true, 5, true, '1000000.00000'],
			[new BigNumber(0.0001), 'usd', undefined, undefined, undefined, '$0.01e-2'],
			[new BigNumber(''), 'usd', undefined, undefined, undefined, undefined],
			[new BigNumber(-1000000), 'usd', undefined, 5, true, '$-1000000.00000'],
			[new BigNumber(-0.0001), 'usd', true, undefined, true, '-0.00'],
			// The following calculations are performed programatically to match BigNumber integrity
			[
				new BigNumber(exchangeRates.btc),
				'btc',
				true,
				undefined,
				true,
				`₿ ${new BigNumber(exchangeRates.btc)
					.dividedBy(exchangeRates.usd)
					.multipliedBy(exchangeRates.btc)
					.toFixed(5, 8)}`,
			],
			[
				new BigNumber(exchangeRates.usd),
				'eth',
				true,
				undefined,
				true,
				`Ξ ${new BigNumber(exchangeRates.usd).dividedBy(exchangeRates.usd)}.00000`,
			],
			[
				new BigNumber(exchangeRates.cad),
				'cad',
				true,
				undefined,
				true,
				`C$${new BigNumber(exchangeRates.cad)
					.dividedBy(exchangeRates.usd)
					.multipliedBy(exchangeRates.cad)
					.toFixed(2, 8)}`,
			],
			[
				new BigNumber(0.0001),
				'btc',
				true,
				undefined,
				true,
				`₿ ${new BigNumber(0.0001)
					.dividedBy(exchangeRates.usd)
					.multipliedBy(exchangeRates.btc)
					.multipliedBy(1e5)
					.toFixed(5, 8)}e-5`,
			],
			[
				new BigNumber(0.001),
				'eth',
				true,
				undefined,
				true,
				`Ξ ${new BigNumber(0.001).dividedBy(exchangeRates.usd).multipliedBy(1e5).toFixed(5, 8)}e-5`,
			],
			[
				new BigNumber(0.0001),
				'cad',
				undefined,
				2,
				true,
				`C$${new BigNumber(0.0001)
					.dividedBy(exchangeRates.usd)
					.multipliedBy(exchangeRates.cad)
					.multipliedBy(1e2)
					.toFixed(2, 8)}e-2`,
			],
		])(
			'usdToCurrency(%f, %s, %s, %i, %s) returns %s',
			(value, currency, hide, preferredDecimals, noCommas, expected) => {
				expect(usdToCurrency(value, currency, hide, preferredDecimals, noCommas)).toBe(expected);
			},
		);
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
