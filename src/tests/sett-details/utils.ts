import { SettState } from '../../mobx/model/setts/sett-state';
import slugify from 'slugify';
import { Sett } from '../../mobx/model/setts/sett';
import { BadgerSett } from '../../mobx/model/vaults/badger-sett';

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
