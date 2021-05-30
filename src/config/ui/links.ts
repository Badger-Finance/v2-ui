import { NETWORK_LIST } from 'config/constants';

export class SidebarLink {
	url: URL;
	title: string;

	constructor(url: URL, title: string) {
		this.url = url;
		this.title = title;
	}
}

export function sidebarTokenLinks(bsc: NETWORK_LIST): SidebarLink[] {
	switch (bsc) {
		case NETWORK_LIST.BSC:
			return [
				{
					url: new URL('https://pancakeswap.info/pair/0xE1E33459505bB3763843a426F7Fd9933418184ae'),
					title: 'PancakeSwap bDigg/BtcB',
				},
				{
					url: new URL('https://pancakeswap.info/pair/0x10f461ceac7a17f59e249954db0784d42eff5db5'),
					title: 'PancakeSwap bBadger/BtcB',
				},
			];
		case NETWORK_LIST.ETH:
		default:
			return [
				{
					url: new URL('https://matcha.xyz/markets/BADGER'),
					title: 'BADGER',
				},
				{
					url: new URL('https://v2.info.uniswap.org/pair/0xcd7989894bc033581532d2cd88da5db0a4b12859'),
					title: 'Uniswap BADGER/wBTC',
				},
				{
					url: new URL('https://analytics.sushi.com/pairs/0x110492b31c59716ac47337e616804e3e3adc0b4a'),
					title: 'Sushiswap BADGER/wBTC',
				},
				{
					url: new URL('https://analytics.sushi.com/pairs/0x18d98d452072ac2eb7b74ce3db723374360539f1'),
					title: 'Sushiswap ibBTC/wBTC',
				},
				{
					url: new URL('https://v2.info.uniswap.org/pair/0xe86204c4eddd2f70ee00ead6805f917671f56c52'),
					title: 'Uniswap DIGG/wBTC',
				},
				{
					url: new URL('https://analytics.sushi.com/pairs/0x9a13867048e01c663ce8ce2fe0cdae69ff9f35e3'),
					title: 'Sushiswap DIGG/wBTC',
				},
			];
	}
}

export const sidebarPricingLinks: SidebarLink[] = [
	{
		url: new URL('https://www.coingecko.com/en/coins/badger-dao'),
		title: 'Badger',
	},
	{
		url: new URL('https://www.coingecko.com/en/coins/digg'),
		title: 'Digg',
	},
	{
		url: new URL('https://www.coingecko.com/en/coins/badger-sett-badger'),
		title: 'bBadger',
	},
	{
		url: new URL('https://www.coingecko.com/en/coins/badger-sett-digg'),
		title: 'bDigg',
	},
];
