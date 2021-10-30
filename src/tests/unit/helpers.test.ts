import { formatTokens, inCurrency, numberWithCommas } from '../../mobx/utils/helpers';
import '@testing-library/jest-dom';
import store from 'mobx/RootStore';
import { ExchangeRates } from '../../mobx/model/system-config/exchange-rates';
import { Currency } from 'config/enums/currency.enum';

describe('helpers', () => {
	const exchangeRates: ExchangeRates = {
		usd: 641.69,
		cad: 776.44,
		btc: 41.93,
		bnb: 7.2,
		matic: 1831.21,
		xdai: 1430.23,
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
			[new BigNumber(12.5678), Currency.BTC, 9, `₿${(12.5678 * exchangeRates.btc).toFixed(9)}`],
			[new BigNumber(-12.5678), Currency.BTC, 9, `₿-${(12.5678 * exchangeRates.btc).toFixed(9)}`],
			[new BigNumber(0.00001), Currency.BTC, 2, `₿0.04e-2`],
			[new BigNumber(1), Currency.CAD, undefined, `C$${exchangeRates.cad}`],
			[new BigNumber(0.00001), Currency.CAD, 1, 'C$0.1e-1'], // Bignumber rounding
			[new BigNumber(1), Currency.USD, undefined, `$${exchangeRates.usd}`],
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
});
