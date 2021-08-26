import { SettState } from '../../mobx/model/setts/sett-state';
import slugify from 'slugify';
import { Sett } from '../../mobx/model/setts/sett';
import { BadgerSett } from '../../mobx/model/vaults/badger-sett';
import { SettBalance } from '../../mobx/model/setts/sett-balance';
import { TokenBalance } from '../../mobx/model/tokens/token-balance';
import BigNumber from 'bignumber.js';

export const SAMPLE_BADGER_SETT: BadgerSett = {
	depositToken: {
		address: '0x075b1bb99792c9E1041bA13afEf80C91a1e70fB3',
		decimals: 18,
	},
	vaultToken: {
		address: '0xd04c48A53c111300aD41190D63681ed3dAd998eC',
		decimals: 18,
	},
};

export const SAMPLE_SETT: Sett = {
	asset: 'sBTCCRV',
	state: SettState.Open,
	apr: 0.123456789123454,
	balance: 2580.4779797767615,
	hasBouncer: false,
	boostable: true,
	name: 'Curve.fi renBTC/wBTC/sBTC',
	ppfs: 1.0082389531413567,
	experimental: false,
	sources: [
		{
			name: 'Vault Compounding',
			apy: 0.969833148006872,
			apr: 0.123456789123454,
			harvestable: false,
			boostable: true,
			performance: {
				oneDay: 0,
				threeDay: 0.969833148006872,
				sevenDay: 1.9606822867801268,
				thirtyDay: 1.7906745798173762,
			},
			minApr: 0.123456789123454,
			maxApr: 1.123456789123454,
		},
		{
			name: 'Curve LP Fees',
			apy: 0.3785608655360706,
			apr: 0.123456789123454,
			harvestable: false,
			boostable: true,
			performance: {
				oneDay: 0.3785608655360706,
				threeDay: 0.3785608655360706,
				sevenDay: 0.18228323420248493,
				thirtyDay: 0.368978072171422,
			},
			minApr: 0.123456789123454,
			maxApr: 1.123456789123454,
		},
	],
	tokens: [
		{
			address: '0x075b1bb99792c9E1041bA13afEf80C91a1e70fB3',
			name: 'Curve.fi renBTC/wBTC/sBTC',
			symbol: 'curve-renBTC-wBTC-sBTC',
			decimals: 18,
			balance: 2580.4779797767615,
			value: 135697015.0445408,
		},
	],
	underlyingToken: '0x075b1bb99792c9E1041bA13afEf80C91a1e70fB3',
	value: 135697015.0445408,
	vaultToken: '0xd04c48A53c111300aD41190D63681ed3dAd998eC',
	slug: slugify('Curve.fi renBTC/wBTC/sBTC'),
};

export const SAMPLE_SETT_BALANCE: SettBalance = {
	id: '0xd04c48A53c111300aD41190D63681ed3dAd998eC',
	name: 'Convex renBTC/wBTC/sBTC',
	asset: 'crvsBTC',
	ppfs: 1.0131098014439799,
	balance: 400,
	value: 21219315.213123,
	tokens: [
		{
			address: '0xEB4C2781e4ebA804CE9a9803C67d0893436bB27D',
			name: 'Ren Protocol BTC',
			symbol: 'renBTC',
			decimals: 8,
			balance: 478.88017950592223,
			value: 23410536.455326512,
		},
		{
			address: '0x2260FAC5E5542a773Aa44fBCfeDf7C193bc2C599',
			name: 'Wrapped Bitcoin',
			symbol: 'WBTC',
			decimals: 8,
			balance: 472.0972849608856,
			value: 23145985.687062297,
		},
		{
			address: '0xfE18be6b3Bd88A2D2A7f928d00292E7a9963CfC6',
			name: 'Synthetix Network BTC',
			symbol: 'sBTC',
			decimals: 18,
			balance: 337.6574109700648,
			value: 16588824.96873407,
		},
	],
	earnedBalance: 0.0001352660720517207,
	earnedValue: 6.662841869510715,
	earnedTokens: [
		{
			address: '0xEB4C2781e4ebA804CE9a9803C67d0893436bB27D',
			name: 'Ren Protocol BTC',
			symbol: 'renBTC',
			decimals: 8,
			balance: 478.88017950592223,
			value: 23410536.455326512,
		},
		{
			address: '0x2260FAC5E5542a773Aa44fBCfeDf7C193bc2C599',
			name: 'Wrapped Bitcoin',
			symbol: 'WBTC',
			decimals: 8,
			balance: 472.0972849608856,
			value: 23145985.687062297,
		},
		{
			address: '0xfE18be6b3Bd88A2D2A7f928d00292E7a9963CfC6',
			name: 'Synthetix Network BTC',
			symbol: 'sBTC',
			decimals: 18,
			balance: 337.6574109700648,
			value: 16588824.96873407,
		},
	],
	depositedBalance: 0.7407489634010854,
	withdrawnBalance: 0.7408842294731371,
};

export const SAMPLE_TOKEN_BALANCE = new TokenBalance(
	{
		address: '0x075b1bb99792c9E1041bA13afEf80C91a1e70fB3',
		name: 'Curve.fi renBTC/wBTC/sBTC',
		symbol: 'curve-renBTC-wBTC-sBTC',
		decimals: 18,
	},
	new BigNumber(2580.4779797767615),
	new BigNumber(135697015.0445408),
);
