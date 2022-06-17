import { VaultDTO } from '@badger-dao/sdk';
import { currencyConfiguration } from 'config/currency.config';
import { Currency } from 'config/enums/currency.enum';
import store from 'mobx/RootStore';
import slugify from 'slugify';

/**
 * Function for wrapping ETH based prices or values to be displayed in any currency.
 * @param value Amount of eth to be displayed.
 * @param currency
 * @param dispalyDecimals
 * @returns
 */
export function inCurrency(value: number, currency: Currency, dispalyDecimals?: number): string | undefined {
	const { exchangeRates } = store.prices;
	if (isNaN(value) || !exchangeRates) {
		return;
	}
	const currencyConfig = currencyConfiguration[currency];
	const { prefix, getExchangeRate, decimals } = currencyConfig;
	const conversionDecimals = dispalyDecimals ?? decimals;
	let converted = value * getExchangeRate(exchangeRates);
	let suffix = '';
	if (converted > 0 && converted < 10 ** -conversionDecimals) {
		converted = converted * 10 ** conversionDecimals;
		suffix = `e-${conversionDecimals}`;
	}
	const amount = numberWithCommas(converted.toFixed(conversionDecimals));
	return `${prefix}${amount}${suffix}`;
}

export const numberWithCommas = (x: string): string => {
	const parts = x.toString().split('.');
	parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ',');
	return parts.join('.');
};

export const minBalance = (decimals: number): number => Number(`0.${'0'.repeat(decimals - 1)}1`);

/**
 * If the parameter is a string, return an array with that string as the only element. Otherwise, return the parameter as
 * an array.
 * @param {string | string[]} [param] - The parameter to parse.
 */
export function parseQueryMultipleParams<T extends string>(param?: string | string[]): T[] | undefined {
	if (!param) {
		return undefined;
	}

	if (typeof param === 'string') {
		return [param as T];
	}

	return param as T[];
}
