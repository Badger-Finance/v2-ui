import BigNumber from 'bignumber.js';
import * as api from '../../mobx/utils/apiV2';
import { testYearnVaultApiResponse } from 'mobx/utils/mockData';

export function mockApi(): void {
	jest.spyOn(api, 'listSetts').mockReturnValue(Promise.resolve([testYearnVaultApiResponse]));

	jest.spyOn(api, 'getTokenPrices').mockReturnValue(
		Promise.resolve({
			'0x3472A5A71965499acd81997a54BBA8D852C6E53d': new BigNumber(0.01177548),
			'0x2260FAC5E5542a773Aa44fBCfeDf7C193bc2C599': new BigNumber(21.475027),
			'0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2': new BigNumber(1.023819),
			'0x49849C98ae39Fff122806C06791Fa73784FB3675': new BigNumber(21.458917),
			'0x075b1bb99792c9E1041bA13afEf80C91a1e70fB3': new BigNumber(21.639523),
			'0x64eda51d3Ad40D56b9dFc5554E06F94e1Dd786Fd': new BigNumber(21.862744),
			'0x798D1bE841a82a273720CE31c822C61a67a601C3': new BigNumber(16.668173),
			'0x6B3595068778DD592e39A122f4f5a5cF09C90fE2': new BigNumber(0.00512575),
			'0x110492b31c59716AC47337E616804E3E3AdC0b4a': new BigNumber(104355.93624675558),
			'0x9a13867048e01c663ce8Ce2fE0cDAE69Ff9F35E3': new BigNumber(68708936992.72883),
			'0xCEfF51756c56CeFFCA006cD410B03FFC46dd3a58': new BigNumber(22387170.102105886),
			'0xcD7989894bc033581532D2cd88Da5db0A4b12859': new BigNumber(112237.99034222205),
			'0xE86204c4eDDd2f70eE00EAd6805f917671F56c52': new BigNumber(74629520214.76715),
			'0x19D97D8fA813EE2f51aD4B4e04EA08bAf4DFfC28': new BigNumber(0.014431553594041455),
			'0x7e7E112A68d8D2E221E11047a72fFC1065c38e1a': new BigNumber(7.765345441389416),
			'0xC17078FDd324CC473F8175Dc5290fae5f2E84714': new BigNumber(110216505106.23857),
			'0x235c9e24D3FB2FAFd58a2E49D454Fdcd2DBf7FF1': new BigNumber(172838.99845821565),
			'0x758A43EE2BFf8230eeb784879CdcFF4828F2544D': new BigNumber(22387119.650653824),
			'0x1862A18181346EBd9EdAf800804f89190DeF24a5': new BigNumber(136419.2104264116),
			'0x88128580ACdD9c04Ce47AFcE196875747bF2A9f6': new BigNumber(98170544399.67908),
			'0x6dEf55d2e18486B9dDfaA075bc4e4EE0B28c1545': new BigNumber(21.618729413677382),
			'0xd04c48A53c111300aD41190D63681ed3dAd998eC': new BigNumber(21.81781001599831),
			'0xb9D076fDe463dbc9f915E5392F807315Bf940334': new BigNumber(22.180300350022645),
			'0xAf5A1DECfa95BAF63E0084a35c62592B774A2A87': new BigNumber(21.574423394593733),
			'0x4b92d19c11435614CD49Af1b589001b7c08cD4D5': new BigNumber(21.547500491619058),
		}),
	);

	jest.spyOn(api, 'getTotalValueLocked').mockReturnValue(
		Promise.resolve({
			totalValue: 1027656295.4097776,
			setts: [
				{
					balance: 2580.4779797767615,
					name: 'Curve.fi renBTC/wBTC/sBTC',
					value: 135697015.0445408,
				},
				{
					balance: 4941.679422683604,
					name: 'Curve.fi crvRenWBTC',
					value: 257412081.12758893,
				},
				{
					balance: 2415.4268390200577,
					name: 'Curve.fi tBTC/sBTCCrv LP',
					value: 128162548.07840426,
				},
				{
					balance: 1992.1769700610525,
					name: 'Harvest Curve.fi crvRenWBTC',
					value: 103772498.37048022,
				},
				{
					balance: 0.07568321005973541,
					name: 'Uniswap Wrapped BTC/Badger',
					value: 20616381.803960983,
				},
				{
					balance: 5.8658897644e-8,
					name: 'Uniswap Wrapped BTC/Digg',
					value: 10628193.407480046,
				},
				{
					balance: 0.003869623825219316,
					name: 'Sushiswap Wrapped BTC/Wrapped Ether',
					value: 210323943.36817974,
				},
				{
					balance: 0.10604880118763182,
					name: 'Sushiswap Wrapped BTC/Badger',
					value: 26859374.32111849,
				},
				{
					balance: 7.6435509973e-8,
					name: 'Sushiswap Wrapped BTC/Digg',
					value: 12750374.947456503,
				},
				{
					balance: 374.597748655,
					name: 'Digg',
					value: 15164466.06105171,
				},
				{
					balance: 3627133.2708200538,
					name: 'Badger',
					value: 103663468.88003713,
				},
				{
					balance: 49.99999999,
					name: 'Yearn WBTC',
					value: 2605949.99947881,
				},
			],
		}),
	);

	jest.spyOn(api, 'checkShopEligibility').mockReturnValue(
		Promise.resolve({
			isEligible: true,
		}),
	);

	jest.spyOn(api, 'fetchBouncerProof').mockReturnValue(
		Promise.resolve({
			address: '0x1a1a1a1a1a1a1a1a1a1a1a1a1a1a1a1a1a1a1a1a',
			proof: [],
		}),
	);

	jest.spyOn(api, 'getAccountDetails').mockReturnValue(
		Promise.resolve({
			id: '0x1a1a1a1a1a1a1a1a1a1a1a1a1a1a1a1a1a1a1a1a',
			value: 0,
			earnedValue: 0,
			balances: [],
			depositLimits: {
				'0x4b92d19c11435614CD49Af1b589001b7c08cD4D9': {
					available: 0.5,
					limit: 0.5,
				},
			},
			boost: 1,
			boostRank: 251,
			multipliers: {
				'0x2b2b2b2b2b2b2b2b2b2b2b2b2b2b2b2b2b2b2b2b': 1,
			},
			nativeBalance: 100,
			nonNativeBalance: 10,
			stakeRatio: 100,
		}),
	);
}
