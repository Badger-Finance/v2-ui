import React from 'react';
import { customRender, fireEvent, screen } from './Utils';
import Landing from '../pages/Landing';
import '@testing-library/jest-dom';
import { StoreProvider } from '../mobx/store-context';
import store from '../mobx/RootStore';
import BigNumber from 'bignumber.js';
import { SettState } from '../mobx/model/setts/sett-state';
import UserStore from '../mobx/stores/UserStore';
import SettStore from '../mobx/stores/SettStore';
import { BouncerType } from '../mobx/model/setts/sett-bouncer';
import { DelegationState } from '../mobx/model/setts/locked-cvx-delegation';

jest.mock('../mobx/utils/apiV2', () => ({
	...jest.requireActual('../mobx/utils/apiV2'),
	getTotalValueLocked: jest.fn().mockReturnValue({
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
}));

describe('Landing Page', () => {
	beforeEach(() => {
		store.prices.getPrice = jest.fn().mockReturnValue(new BigNumber(15e18));
		store.network.network.deploy.token = '0x3472A5A71965499acd81997a54BBA8D852C6E53d';
		store.wallet.connectedAddress = '0x1a1a1a1a1a1a1a1a1a1a1a1a1a1a1a1a1a1a1a1a';
		store.user.accountDetails = {
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
		};

		store.lockedCvxDelegation.loadLockedCvxBalance = jest.fn();
		store.lockedCvxDelegation.getVotiumMerkleTrees = jest.fn();

		jest.spyOn(UserStore.prototype, 'initialized', 'get').mockReturnValue(true);

		jest.spyOn(UserStore.prototype, 'portfolioValue', 'get').mockReturnValue(new BigNumber(1000));

		jest.spyOn(SettStore.prototype, 'getSettMap').mockReturnValue({
			'0xd04c48A53c111300aD41190D63681ed3dAd998eC': {
				name: 'Convex renBTC/wBTC/sBTC',
				asset: 'crvsBTC',
				vaultAsset: 'bcrvsBTC',
				state: SettState.Open,
				underlyingToken: '0x075b1bb99792c9E1041bA13afEf80C91a1e70fB3',
				vaultToken: '0xd04c48A53c111300aD41190D63681ed3dAd998eC',
				value: 19170.096517028287,
				balance: 1300.7086980203162,
				ppfs: 1.0140068683413035,
				tokens: [
					{
						value: 6641.876081871302,
						address: '0xEB4C2781e4ebA804CE9a9803C67d0893436bB27D',
						name: 'Ren Protocol BTC',
						symbol: 'renBTC',
						decimals: 8,
						balance: 456.44987540316725,
					},
					{
						value: 6292.44359730964,
						address: '0x2260FAC5E5542a773Aa44fBCfeDf7C193bc2C599',
						name: 'Wrapped Bitcoin',
						symbol: 'WBTC',
						decimals: 8,
						balance: 430.42289812266483,
					},
					{
						value: 6235.776837847344,
						address: '0xfE18be6b3Bd88A2D2A7f928d00292E7a9963CfC6',
						name: 'Synthetix Network BTC',
						symbol: 'sBTC',
						decimals: 18,
						balance: 425.87297097645205,
					},
				],
				apr: 8.473155029650599,
				boostable: true,
				minApr: 6.821813641806616,
				maxApr: 45.63458805775913,
				sources: [
					{
						name: 'bCVX Rewards',
						apr: 3.014153454939595,
						boostable: false,
						harvestable: false,
						performance: {
							oneDay: 3.014153454939595,
							threeDay: 3.014153454939595,
							sevenDay: 3.014153454939595,
							thirtyDay: 3.014153454939595,
						},
						minApr: 3.014153454939595,
						maxApr: 3.014153454939595,
						apy: 3.014153454939595,
					},
					{
						name: 'Vault Compounding',
						apr: 0.9565633511951301,
						boostable: false,
						harvestable: false,
						performance: {
							oneDay: 1.2370256791012044,
							threeDay: 0,
							sevenDay: 0.9565633511951301,
							thirtyDay: 1.0334991906402897,
						},
						minApr: 0.9565633511951301,
						maxApr: 0.9565633511951301,
						apy: 0.9565633511951301,
					},
					{
						name: 'Badger Rewards',
						apr: 1.6707574830995873,
						boostable: true,
						harvestable: false,
						performance: {
							oneDay: 1.6707574830995873,
							threeDay: 1.6707574830995873,
							sevenDay: 1.6707574830995873,
							thirtyDay: 1.6707574830995873,
						},
						minApr: 0.019416095255604053,
						maxApr: 38.83219051120812,
						apy: 38.83219051120812,
					},
					{
						name: 'bcvxCRV Rewards',
						apr: 2.482038798179831,
						boostable: false,
						harvestable: false,
						performance: {
							oneDay: 2.482038798179831,
							threeDay: 2.482038798179831,
							sevenDay: 2.482038798179831,
							thirtyDay: 2.482038798179831,
						},
						minApr: 2.482038798179831,
						maxApr: 2.482038798179831,
						apy: 2.482038798179831,
					},
					{
						name: 'Curve LP Fees',
						apr: 0.34964194223645606,
						boostable: false,
						harvestable: false,
						performance: {
							oneDay: 0.11401730466431559,
							threeDay: 0.11401730466431559,
							sevenDay: 0.34964194223645606,
							thirtyDay: 0.22562413172917406,
						},
						minApr: 0.34964194223645606,
						maxApr: 0.34964194223645606,
						apy: 0.34964194223645606,
					},
				],
				bouncer: BouncerType.None,
				experimental: false,
				deprecated: false,
				multipliers: [
					{
						boost: 1,
						multiplier: 0.02323645583292968,
					},
					{
						boost: 2,
						multiplier: 0.03485177846609458,
					},
					{
						boost: 5,
						multiplier: 0.06969774636558927,
					},
					{
						boost: 10,
						multiplier: 0.12777435953141378,
					},
					{
						boost: 20,
						multiplier: 0.24392758586306276,
					},
					{
						boost: 50,
						multiplier: 0.5923872648580097,
					},
					{
						boost: 100,
						multiplier: 1.1731533965162548,
					},
					{
						boost: 150,
						multiplier: 1.7539195281744997,
					},
					{
						boost: 200,
						multiplier: 2.334685659832745,
					},
					{
						boost: 300,
						multiplier: 3.4962179231492345,
					},
					{
						boost: 400,
						multiplier: 4.657750186465725,
					},
					{
						boost: 500,
						multiplier: 5.819282449782214,
					},
					{
						boost: 600,
						multiplier: 6.980814713098704,
					},
					{
						boost: 800,
						multiplier: 6.980814713098704,
					},
					{
						boost: 1000,
						multiplier: 11.626943766364663,
					},
					{
						boost: 1200,
						multiplier: 11.626943766364663,
					},
					{
						boost: 1400,
						multiplier: 13.950008292997643,
					},
					{
						boost: 1600,
						multiplier: 18.596137346263603,
					},
					{
						boost: 1800,
						multiplier: 20.919201872896583,
					},
					{
						boost: 2000,
						multiplier: 23.242266399529562,
					},
				],
				slug: 'convex-renbtc-wbtc-sbtc',
			},
			'0x6dEf55d2e18486B9dDfaA075bc4e4EE0B28c1545': {
				name: 'Convex renBTC/wBTC',
				asset: 'crvrenWBTC',
				vaultAsset: 'bcrvrenBTC',
				state: SettState.Open,
				underlyingToken: '0x49849C98ae39Fff122806C06791Fa73784FB3675',
				vaultToken: '0x6dEf55d2e18486B9dDfaA075bc4e4EE0B28c1545',
				value: 54243.62275463376,
				balance: 3655.3363585477673,
				ppfs: 1.0130202753585444,
				tokens: [
					{
						value: 30407.000114214163,
						address: '0xEB4C2781e4ebA804CE9a9803C67d0893436bB27D',
						name: 'Ren Protocol BTC',
						symbol: 'renBTC',
						decimals: 8,
						balance: 2089.6613008785253,
					},
					{
						value: 23836.622640419602,
						address: '0x2260FAC5E5542a773Aa44fBCfeDf7C193bc2C599',
						name: 'Wrapped Bitcoin',
						symbol: 'WBTC',
						decimals: 8,
						balance: 1630.4998272423713,
					},
				],
				apr: 5.961279974689675,
				boostable: true,
				minApr: 4.805467815372695,
				maxApr: 58.44137528182395,
				sources: [
					{
						name: 'Curve LP Fees',
						apr: 0.21575503753936687,
						boostable: false,
						harvestable: false,
						performance: {
							oneDay: 0.015698960562482434,
							threeDay: 0.015698960562482434,
							sevenDay: 0.21575503753936687,
							thirtyDay: 0.2560926374100436,
						},
						minApr: 0.21575503753936687,
						maxApr: 0.21575503753936687,
						apy: 0.21575503753936687,
					},
					{
						name: 'bcvxCRV Rewards',
						apr: 1.748729376665271,
						boostable: false,
						harvestable: false,
						performance: {
							oneDay: 1.748729376665271,
							threeDay: 1.748729376665271,
							sevenDay: 1.748729376665271,
							thirtyDay: 1.748729376665271,
						},
						minApr: 1.748729376665271,
						maxApr: 1.748729376665271,
						apy: 1.748729376665271,
					},
					{
						name: 'bCVX Rewards',
						apr: 2.123632674999022,
						boostable: false,
						harvestable: false,
						performance: {
							oneDay: 2.123632674999022,
							threeDay: 2.123632674999022,
							sevenDay: 2.123632674999022,
							thirtyDay: 2.123632674999022,
						},
						minApr: 2.123632674999022,
						maxApr: 2.123632674999022,
						apy: 2.123632674999022,
					},
					{
						name: 'Badger Rewards',
						apr: 1.1826435287349153,
						boostable: true,
						harvestable: false,
						performance: {
							oneDay: 1.1826435287349153,
							threeDay: 1.1826435287349153,
							sevenDay: 1.1826435287349153,
							thirtyDay: 1.1826435287349153,
						},
						minApr: 0.026831369417934587,
						maxApr: 53.66273883586919,
						apy: 53.66273883586919,
					},
					{
						name: 'Vault Compounding',
						apr: 0.6905193567510997,
						boostable: false,
						harvestable: false,
						performance: {
							oneDay: 1.0970229069888993,
							threeDay: 0,
							sevenDay: 0.6905193567510997,
							thirtyDay: 0.6899989536145371,
						},
						minApr: 0.6905193567510997,
						maxApr: 0.6905193567510997,
						apy: 0.6905193567510997,
					},
				],
				bouncer: BouncerType.None,
				experimental: false,
				deprecated: false,
				multipliers: [
					{
						boost: 1,
						multiplier: 0.04536390031960805,
					},
					{
						boost: 2,
						multiplier: 0.06804017857389574,
					},
					{
						boost: 5,
						multiplier: 0.13606901333675886,
					},
					{
						boost: 10,
						multiplier: 0.24945040460819734,
					},
					{
						boost: 20,
						multiplier: 0.4762131871510743,
					},
					{
						boost: 50,
						multiplier: 1.1565015347797052,
					},
					{
						boost: 100,
						multiplier: 2.2903154474940903,
					},
					{
						boost: 150,
						multiplier: 3.4241293602084752,
					},
					{
						boost: 200,
						multiplier: 4.55794327292286,
					},
					{
						boost: 300,
						multiplier: 6.82557109835163,
					},
					{
						boost: 400,
						multiplier: 9.093198923780399,
					},
					{
						boost: 500,
						multiplier: 11.360826749209169,
					},
					{
						boost: 600,
						multiplier: 13.628454574637939,
					},
					{
						boost: 800,
						multiplier: 13.628454574637939,
					},
					{
						boost: 1000,
						multiplier: 22.698965876353018,
					},
					{
						boost: 1200,
						multiplier: 22.698965876353018,
					},
					{
						boost: 1400,
						multiplier: 27.234221527210558,
					},
					{
						boost: 1600,
						multiplier: 36.30473282892564,
					},
					{
						boost: 1800,
						multiplier: 40.83998847978318,
					},
					{
						boost: 2000,
						multiplier: 45.375244130640716,
					},
				],
				slug: 'convex-renbtc-wbtc',
			},
			'0xb9D076fDe463dbc9f915E5392F807315Bf940334': {
				name: 'Convex tBTC/sBTC',
				asset: 'crvtBTC',
				vaultAsset: 'bcrvtBTC',
				state: SettState.Open,
				underlyingToken: '0x64eda51d3Ad40D56b9dFc5554E06F94e1Dd786Fd',
				vaultToken: '0xb9D076fDe463dbc9f915E5392F807315Bf940334',
				value: 13709.43733460813,
				balance: 929.4508526492556,
				ppfs: 1.0269845504164843,
				tokens: [
					{
						value: 2339.7403167993593,
						address: '0x8dAEBADE922dF735c38C80C7eBD708Af50815fAa',
						name: 'Keep Network BTC',
						symbol: 'TBTC',
						decimals: 18,
						balance: 157.44085248202833,
					},
					{
						value: 11369.69701780877,
						address: '0x075b1bb99792c9E1041bA13afEf80C91a1e70fB3',
						name: 'Curve.fi renBTC/wBTC/sBTC',
						symbol: 'crvsBTC',
						decimals: 18,
						balance: 771.5441582451709,
					},
				],
				apr: 10.579455835357866,
				boostable: true,
				minApr: 8.25240020296642,
				maxApr: 24.930128329236407,
				sources: [
					{
						name: 'Vault Compounding',
						apr: 1.7013237892159667,
						boostable: false,
						harvestable: false,
						performance: {
							oneDay: 1.9458911088446225,
							threeDay: 0,
							sevenDay: 1.7013237892159667,
							thirtyDay: 1.7797333764547605,
						},
						minApr: 1.7013237892159667,
						maxApr: 1.7013237892159667,
						apy: 1.7013237892159667,
					},
					{
						name: 'Badger Rewards',
						apr: 2.335398667972373,
						boostable: true,
						harvestable: false,
						performance: {
							oneDay: 2.335398667972373,
							threeDay: 2.335398667972373,
							sevenDay: 2.335398667972373,
							thirtyDay: 2.335398667972373,
						},
						minApr: 0.008343035580925456,
						maxApr: 16.68607116185091,
						apy: 16.68607116185091,
					},
					{
						name: 'bcvxCRV Rewards',
						apr: 2.796301882184901,
						boostable: false,
						harvestable: false,
						performance: {
							oneDay: 2.796301882184901,
							threeDay: 2.796301882184901,
							sevenDay: 2.796301882184901,
							thirtyDay: 2.796301882184901,
						},
						minApr: 2.796301882184901,
						maxApr: 2.796301882184901,
						apy: 2.796301882184901,
					},
					{
						name: 'bCVX Rewards',
						apr: 3.3957901808072566,
						boostable: false,
						harvestable: false,
						performance: {
							oneDay: 3.3957901808072566,
							threeDay: 3.3957901808072566,
							sevenDay: 3.3957901808072566,
							thirtyDay: 3.3957901808072566,
						},
						minApr: 3.3957901808072566,
						maxApr: 3.3957901808072566,
						apy: 3.3957901808072566,
					},
					{
						name: 'Curve LP Fees',
						apr: 0.3506413151773691,
						boostable: false,
						harvestable: false,
						performance: {
							oneDay: 0.12738253442108327,
							threeDay: 0.12738253442108327,
							sevenDay: 0.3506413151773691,
							thirtyDay: 0.23011595415696195,
						},
						minApr: 0.3506413151773691,
						maxApr: 0.3506413151773691,
						apy: 0.3506413151773691,
					},
				],
				bouncer: BouncerType.None,
				experimental: false,
				deprecated: false,
				multipliers: [
					{
						boost: 1,
						multiplier: 0.007143062926615401,
					},
					{
						boost: 2,
						multiplier: 0.010713701283780741,
					},
					{
						boost: 5,
						multiplier: 0.021425616355276754,
					},
					{
						boost: 10,
						multiplier: 0.03927880814110345,
					},
					{
						boost: 20,
						multiplier: 0.07498519171275683,
					},
					{
						boost: 50,
						multiplier: 0.182104342427717,
					},
					{
						boost: 100,
						multiplier: 0.36063626028598395,
					},
					{
						boost: 150,
						multiplier: 0.5391681781442508,
					},
					{
						boost: 200,
						multiplier: 0.7177000960025178,
					},
					{
						boost: 300,
						multiplier: 1.0747639317190516,
					},
					{
						boost: 400,
						multiplier: 1.4318277674355857,
					},
					{
						boost: 500,
						multiplier: 1.7888916031521194,
					},
					{
						boost: 600,
						multiplier: 2.145955438868653,
					},
					{
						boost: 800,
						multiplier: 2.145955438868653,
					},
					{
						boost: 1000,
						multiplier: 3.5742107817347883,
					},
					{
						boost: 1200,
						multiplier: 3.5742107817347883,
					},
					{
						boost: 1400,
						multiplier: 4.288338453167856,
					},
					{
						boost: 1600,
						multiplier: 5.716593796033992,
					},
					{
						boost: 1800,
						multiplier: 6.430721467467059,
					},
					{
						boost: 2000,
						multiplier: 7.144849138900127,
					},
				],
				slug: 'convex-tbtc-sbtc',
			},
			'0xAf5A1DECfa95BAF63E0084a35c62592B774A2A87': {
				boostable: true,
				name: 'Harvest renBTC/wBTC',
				asset: 'crvrenWBTC',
				vaultAsset: 'bcrvhrenBTC',
				state: SettState.Open,
				underlyingToken: '0x49849C98ae39Fff122806C06791Fa73784FB3675',
				vaultToken: '0xAf5A1DECfa95BAF63E0084a35c62592B774A2A87',
				value: 7015.984060585119,
				balance: 472.7888796007378,
				ppfs: 1.017396975137572,
				tokens: [
					{
						value: 3932.905239322576,
						address: '0xEB4C2781e4ebA804CE9a9803C67d0893436bB27D',
						name: 'Ren Protocol BTC',
						symbol: 'renBTC',
						decimals: 8,
						balance: 270.28118024681305,
					},
					{
						value: 3083.078821262542,
						address: '0x2260FAC5E5542a773Aa44fBCfeDf7C193bc2C599',
						name: 'Wrapped Bitcoin',
						symbol: 'WBTC',
						decimals: 8,
						balance: 210.89227116089035,
					},
				],
				apr: 4.648797461404374,
				sources: [
					{
						name: 'Vault Compounding',
						apr: 4.4330424238650075,
						boostable: false,
						harvestable: false,
						performance: {
							oneDay: 11.170027156359932,
							threeDay: 0,
							sevenDay: 4.4330424238650075,
							thirtyDay: 5.492088631918829,
						},
						minApr: 4.4330424238650075,
						maxApr: 4.4330424238650075,
						apy: 4.4330424238650075,
					},
					{
						name: 'Curve LP Fees',
						apr: 0.21575503753936687,
						boostable: false,
						harvestable: false,
						performance: {
							oneDay: 0.015698960562482434,
							threeDay: 0.015698960562482434,
							sevenDay: 0.21575503753936687,
							thirtyDay: 0.2560926374100436,
						},
						minApr: 0.21575503753936687,
						maxApr: 0.21575503753936687,
						apy: 0.21575503753936687,
					},
				],
				bouncer: BouncerType.None,
				experimental: false,
				deprecated: false,
				multipliers: [
					{
						boost: 1,
						multiplier: 0.3978314475328442,
					},
					{
						boost: 2,
						multiplier: 0.5966974299329832,
					},
					{
						boost: 5,
						multiplier: 1.1932953771334,
					},
					{
						boost: 10,
						multiplier: 2.187625289134095,
					},
					{
						boost: 20,
						multiplier: 4.176285113135485,
					},
					{
						boost: 50,
						multiplier: 10.142264585139653,
					},
					{
						boost: 100,
						multiplier: 20.0855637051466,
					},
					{
						boost: 150,
						multiplier: 30.02886282515355,
					},
					{
						boost: 200,
						multiplier: 39.9721619451605,
					},
					{
						boost: 300,
						multiplier: 59.8587601851744,
					},
					{
						boost: 400,
						multiplier: 79.74535842518829,
					},
					{
						boost: 500,
						multiplier: 99.63195666520218,
					},
					{
						boost: 600,
						multiplier: 119.51855490521608,
					},
					{
						boost: 800,
						multiplier: 119.51855490521608,
					},
					{
						boost: 1000,
						multiplier: 199.06494786527168,
					},
					{
						boost: 1200,
						multiplier: 199.06494786527168,
					},
					{
						boost: 1400,
						multiplier: 238.83814434529947,
					},
					{
						boost: 1600,
						multiplier: 318.384537305355,
					},
					{
						boost: 1800,
						multiplier: 358.15773378538285,
					},
					{
						boost: 2000,
						multiplier: 397.9309302654106,
					},
				],
				slug: 'harvest-renbtc-wbtc',
			},
			'0x235c9e24D3FB2FAFd58a2E49D454Fdcd2DBf7FF1': {
				boostable: true,
				name: 'Uniswap Wrapped BTC/Badger',
				asset: 'BADGER-WBTC',
				vaultAsset: 'bBADGER-WBTC',
				state: SettState.Open,
				underlyingToken: '0xcD7989894bc033581532D2cd88Da5db0A4b12859',
				vaultToken: '0x235c9e24D3FB2FAFd58a2E49D454Fdcd2DBf7FF1',
				value: 3267.4977804645587,
				balance: 0.050210072454004405,
				ppfs: 1.7262328804432525,
				tokens: [
					{
						value: 1634.768643942879,
						address: '0x2260FAC5E5542a773Aa44fBCfeDf7C193bc2C599',
						name: 'Wrapped Bitcoin',
						symbol: 'WBTC',
						decimals: 8,
						balance: 111.82330784606441,
					},
					{
						value: 1632.7291365216795,
						address: '0x3472A5A71965499acd81997a54BBA8D852C6E53d',
						name: 'Badger',
						symbol: 'BADGER',
						decimals: 18,
						balance: 305554.250308165,
					},
				],
				apr: 45.142724337861125,
				sources: [
					{
						name: 'Vault Compounding',
						apr: 25.532609844933475,
						boostable: false,
						harvestable: false,
						performance: {
							oneDay: 4.7592943427868135e-12,
							threeDay: 0,
							sevenDay: 25.532609844933475,
							thirtyDay: 29.532754170496332,
						},
						minApr: 25.532609844933475,
						maxApr: 25.532609844933475,
						apy: 25.532609844933475,
					},
					{
						name: 'Badger Rewards',
						apr: 19.610114492927647,
						boostable: false,
						harvestable: false,
						performance: {
							oneDay: 19.610114492927647,
							threeDay: 19.610114492927647,
							sevenDay: 19.610114492927647,
							thirtyDay: 19.610114492927647,
						},
						minApr: 19.610114492927647,
						maxApr: 19.610114492927647,
						apy: 19.610114492927647,
					},
				],
				bouncer: BouncerType.None,
				experimental: false,
				deprecated: false,
				multipliers: [],
				slug: 'uniswap-wrapped-btc-badger',
			},
		});
	});

	test('Renders correctly', async () => {
		const { container } = customRender(
			<StoreProvider value={store}>
				<Landing
					title="Test Bitcoin Strategies"
					subtitle="Snapshots are great. Landing looks good."
					state={SettState.Open}
				/>
			</StoreProvider>,
		);

		expect(container).toMatchSnapshot();
	});

	test('Renders Locked CVX Banner', async () => {
		store.lockedCvxDelegation.delegationState = DelegationState.Eligible;
		store.lockedCvxDelegation.lockedCVXBalance = new BigNumber(100 * 1e18);
		store.lockedCvxDelegation.totalEarned = new BigNumber(10 * 1e18);
		store.lockedCvxDelegation.unclaimedBalance = new BigNumber(10 * 1e18);

		const { container } = customRender(
			<StoreProvider value={store}>
				<Landing
					title="Test Bitcoin Strategies"
					subtitle="Snapshots are great. Landing looks good."
					state={SettState.Open}
				/>
			</StoreProvider>,
		);

		expect(container).toMatchSnapshot();
	});

	test('can click delegate locked cvx', async () => {
		const mockDelegateLocked = jest.fn();
		store.lockedCvxDelegation.lockedCVXBalance = new BigNumber(100 * 1e18);
		store.lockedCvxDelegation.delegationState = DelegationState.Eligible;
		store.lockedCvxDelegation.delegateLockedCVX = mockDelegateLocked;

		customRender(
			<StoreProvider value={store}>
				<Landing
					title="Test Bitcoin Strategies"
					subtitle="Snapshots are great. Landing looks good."
					state={SettState.Open}
				/>
			</StoreProvider>,
		);

		fireEvent.click(screen.getByRole('button', { name: 'Delegate to Badger' }));

		expect(mockDelegateLocked).toHaveBeenCalled();
	});
});
