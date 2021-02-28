import { formatTokens, inCurrency, usdToCurrency, numberWithCommas } from '../helpers';
import '@testing-library/jest-dom';
import BigNumber from 'bignumber.js';

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
	const btcExhangeRate = 41.93; // BTC Exchange rate is currently hardcoded for the function
	test.each([
		[new BigNumber(1000000), 'eth', true, 18, true, '1000000.00'],
		[new BigNumber(1000000), 'eth', undefined, 18, undefined, 'Ξ 1,000,000.00'],
		[new BigNumber(123456789123.456789), 'eth', true, 18, undefined, '123,456,789,123.46'],
		[new BigNumber(0.0000435645), 'eth', true, 18, undefined, '0.000043564500000000'],
		[new BigNumber(0.000001), 'eth', true, 5, undefined, '0.10000e-5'],
		[new BigNumber(0.000001), 'eth', true, 18, undefined, '0.000001000000000000'],
		[new BigNumber(0.0000000001), 'eth', true, 9, undefined, '0.100000000e-9'],
		[new BigNumber(0.0001), 'eth', true, 5, undefined, '0.00010'],
		[new BigNumber(''), 'eth', false, 18, undefined, 'Ξ 0.000000000000000000'],
		[new BigNumber(12.5678), 'btc', true, 9, undefined, `₿ ${12.5678 * btcExhangeRate}000`],
		[new BigNumber(-12.5678), 'btc', true, 9, undefined, `₿ -${12.5678 * btcExhangeRate}000`],
		[new BigNumber(-1000000), 'eth', true, 18, false, '-1,000,000.000000000000000000'],
	])('inCurrency(%f, %s, $d, $i, $d) returns %s', (value, currency, hide, preferredDecimals, noCommas, expected) => {
		expect(inCurrency(value, currency, hide, preferredDecimals, noCommas)).toBe(expected);
	});
	// CAD exchange rate is dynamic so exact value won't be tested
	test('inCurrency with CAD contains prefix', () => {
		expect(inCurrency(new BigNumber(12.5678), 'cad', undefined, 18, true)).toContain('C$');
	});
	test('inCurrency with CAD changes value', () => {
		expect(inCurrency(new BigNumber(12.5678), 'cad', undefined, 18, true).match(/\d+.\d+/)).not.toBe(['12.5678']); // Fails if 1ETH = 1CAD
	});
	test('inCurrency with CAD decimals remain 2 for a large enough value', () => {
		expect(inCurrency(new BigNumber(12.5678), 'cad', undefined, 18, true).split('.')[1].length).toBe(2); // Fails if 1ETH << 1CAD
	});
	// USD exchange rate is dynamic so exact value won't be tested
	test('inCurrency with USD contains prefix', () => {
		expect(inCurrency(new BigNumber(12.5678), 'usd', undefined, 18, true)).toContain('$');
	});
	test('inCurrency with USD changes value', () => {
		expect(inCurrency(new BigNumber(12.5678), 'usd', undefined, 18, true).match(/\d+.\d+/)).not.toBe(['12.5678']); // Fails if 1ETH = 1USD
	});
	test('inCurrency with USD decimals remain 2 for a large enough value', () => {
		expect(inCurrency(new BigNumber(12.5678), 'usd', undefined, 18, true).split('.')[1].length).toBe(2); // Fails if 1ETH << 1USD
	});
});

describe('usdToCurrency', () => {
	test.each([
		[new BigNumber(1000000), 'usd', undefined, undefined, undefined, '$1,000,000.00'],
		[new BigNumber(1000000), 'usd', true, 5, true, '1000000.00000'],
		[new BigNumber(0.0001), 'usd', undefined, undefined, undefined, '$0.01e-2'],
		[new BigNumber(''), 'usd', undefined, undefined, undefined, '$0.00'],
		[new BigNumber(-1000000), 'usd', undefined, 5, true, '$-1000000.00000'],
		[new BigNumber(-0.0001), 'usd', true, undefined, true, '-0.00'],
	])(
		'usdToCurrency(%f, %s, $d, $i, $d) returns %s',
		(value, currency, hide, preferredDecimals, noCommas, expected) => {
			expect(usdToCurrency(value, currency, hide, preferredDecimals, noCommas)).toBe(expected);
		},
	);
	// BTC, ETH and CAD exchange rates are dynamic so exact values won't be tested
	test.each([
		[new BigNumber(1), 'btc', undefined, undefined, undefined, '₿ '],
		[new BigNumber(1), 'eth', undefined, undefined, undefined, 'Ξ '],
		[new BigNumber(1), 'cad', undefined, undefined, undefined, 'C$'],
	])(
		'usdToCurrency(%f, %s, $d, $i, $d) contains %s',
		(value, currency, hide, preferredDecimals, noCommas, expected) => {
			expect(usdToCurrency(value, currency, hide, preferredDecimals, noCommas)).toContain(expected);
		},
	);
	test.each([
		[new BigNumber(1), 'btc', undefined, undefined, undefined, '1.00000'], // Fails if 1USD == 1BTC
		[new BigNumber(1), 'eth', undefined, undefined, undefined, '1.00000'], // Fails if 1USD == 1ETH
		[new BigNumber(1), 'cad', undefined, undefined, undefined, '1.00'], // Fails if 1USD == 1CAD
	])(
		'usdToCurrency(%f, %s, $d, $i, $d) changes value from %s',
		(value, currency, hide, preferredDecimals, noCommas, expected) => {
			expect(usdToCurrency(value, currency, hide, preferredDecimals, noCommas).match(/\d+.\d+/)).not.toBe([
				expected,
			]);
		},
	);
	test.each([
		[new BigNumber(1), 'btc', undefined, 18, undefined, 5],
		[new BigNumber(1), 'eth', undefined, 18, undefined, 5],
		[new BigNumber(1), 'cad', undefined, 18, undefined, 18],
	])(
		'usdToCurrency(%f, %s, $d, $i, $d) maintains %i decimals',
		(value, currency, hide, preferredDecimals, noCommas, expected) => {
			expect(usdToCurrency(value, currency, hide, preferredDecimals, noCommas).split('.')[1].length).toBe(
				expected,
			);
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
