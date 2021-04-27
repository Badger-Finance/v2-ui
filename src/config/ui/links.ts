export interface SidebarLink {
	url: string;
	title: string;
}

export function sidebarTokenLinks(bsc: 'bsc' | 'eth'): SidebarLink[] {
	if (bsc === 'bsc') {
		return [
			{
				url: 'https://pancakeswap.info/pair/0xE1E33459505bB3763843a426F7Fd9933418184ae',
				title: 'PancakeSwap bDigg/BtcB',
			},
			{
				url: 'https://pancakeswap.info/pair/0x10f461ceac7a17f59e249954db0784d42eff5db5',
				title: 'PancakeSwap bBadger/BtcB',
			},
		];
	}
	return [
		{
			url: 'https://matcha.xyz/markets/BADGER',
			title: 'BADGER',
		},
		{
			url: 'https://info.uniswap.org/pair/0xcd7989894bc033581532d2cd88da5db0a4b12859',
			title: 'Uniswap BADGER/wBTC',
		},
		{
			url: 'https://analytics.sushi.com/pairs/0x110492b31c59716ac47337e616804e3e3adc0b4a',
			title: 'Sushiswap BADGER/wBTC',
		},
	];
}

export const sidebarPricingLinks: SidebarLink[] = [
	{
		url: 'https://www.coingecko.com/en/coins/badger-dao',
		title: 'Badger',
	},
	{
		url: 'https://www.coingecko.com/en/coins/digg',
		title: 'Digg',
	},
	{
		url: 'https://www.coingecko.com/en/coins/badger-sett-badger',
		title: 'bBadger',
	},
	{
		url: 'https://www.coingecko.com/en/coins/badger-sett-digg',
		title: 'bDigg',
	},
];
