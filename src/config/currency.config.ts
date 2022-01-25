import { Currency } from './enums/currency.enum';
import { CurrencyConfig } from './interfaces/currency-config.interface';

export const currencyConfiguration: Record<Currency, CurrencyConfig> = {
	[Currency.USD]: {
		getExchangeRate: (rates) => rates.usd,
		decimals: 2,
		prefix: '$',
	},
	[Currency.BTC]: {
		getExchangeRate: (rates) => rates.btc,
		decimals: 8,
		prefix: '₿',
	},
	[Currency.ETH]: {
		/* eslint-disable-next-line @typescript-eslint/no-unused-vars */
		getExchangeRate: (_rates) => 1,
		decimals: 6,
		prefix: 'Ξ',
	},
	[Currency.CAD]: {
		getExchangeRate: (rates) => rates.cad,
		decimals: 2,
		prefix: 'C$',
	},
	[Currency.BNB]: {
		getExchangeRate: (rates) => rates.bnb,
		decimals: 5,
		prefix: '/assets/icons/bnb-white.png',
	},
	[Currency.MATIC]: {
		getExchangeRate: (rates) => rates.matic,
		decimals: 2,
		prefix: '/assets/icons/matic.png',
	},
	[Currency.XDAI]: {
		getExchangeRate: (rates) => rates.xdai,
		decimals: 2,
		// TODO: Update xDAI icon once this is a goal
		prefix: '/assets/icons/bnb-white.png',
	},
	[Currency.FTM]: {
		getExchangeRate: (rates) => rates.ftm,
		decimals: 2,
		// TODO: Update xDAI icon once this is a goal
		prefix: '/assets/icons/ftm.png',
	},
};
