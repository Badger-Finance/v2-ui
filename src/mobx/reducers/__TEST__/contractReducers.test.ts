import '@testing-library/jest-dom';
import { cleanup } from '@testing-library/react';
import BigNumber from 'bignumber.js';
import { START_BLOCK } from 'config/constants';
import store from 'mobx/store';
import { growthQuery } from 'mobx/utils/helpers';
import {
	reduceBatchResult,
	reduceContractConfig,
	reduceCurveResult,
	reduceGeyserSchedule,
	reduceGraphResult,
	reduceGrowth,
	reduceGrowthQueryConfig,
	reduceMethodConfig,
	reduceResult,
	reduceSushiAPIResults,
	reduceXSushiROIResults,
} from '../contractReducers';

afterEach(cleanup);

describe('reduceBatchResult', () => {
	test('Mock data set is reduced correctly', () => {
		const resultData = [
			{
				address: '0x1A1A1A1A1A1A1A1A1A1A1A1A1A1A1A1A1A1A1A1A',
				balanceOf: [
					{
						args: ['0x1A1A1A1A1A1A1A1A1A1A1A1A1A1A1A1A1A1A1A1A'],
						input: '0x2B2B2B2B2B2B2B2B2B2B2B2B2B2B2B2B2B2B2B2B',
						value: '0',
					},
				],
				decimals: [{ value: '18' }],
				namespace: 'namespace',
				symbol: [{ value: 'TEST' }],
				totalSupply: [{ value: '3055346132545037818264442' }],
				getUnlockSchedulesFor: [
					{
						args: ['0x1A1A1A1A1A1A1A1A1A1A1A1A1A1A1A1A1A1A1A1A'],
						input: '0x328b10d800000000000000000000000001A1A1A1A1A1A1A1A1A1A1A1A1A1A1A1A1A1A1A1A',
						value: [
							['45000000000000000000000', '1607619600', '604800', '1607014800'],
							['10214285700000000000000', '1607706000', '864002', '1607619600'],
						],
					},
					{
						args: ['0x2B2B2B2B2B2B2B2B2B2B2B2B2B2B2B2B2B2B2B2B'],
						input: '0x328b10d800000000000000000000000002B2B2B2B2B2B2B2B2B2B2B2B2B2B2B2B2B2B2B2B',
						value: [
							['35000000000000000000000', '1029384756', '102938', '1209348756'],
							['12345678900000000000000', '5647382910', '483920', '9078564523'],
						],
					},
				],
			},
		];

		const expectedData = [
			{
				address: '0x1a1a1a1a1a1a1a1a1a1a1a1a1a1a1a1a1a1a1a1a',
				balanceOf: new BigNumber(0),
				decimals: 18,
				namespace: 'namespace',
				symbol: 'TEST',
				totalSupply: new BigNumber('3055346132545037818264442'),
				getUnlockSchedulesFor: {
					'0x1A1A1A1A1A1A1A1A1A1A1A1A1A1A1A1A1A1A1A1A': [
						['45000000000000000000000', '1607619600', '604800', '1607014800'],
						['10214285700000000000000', '1607706000', '864002', '1607619600'],
					],
					'0x2B2B2B2B2B2B2B2B2B2B2B2B2B2B2B2B2B2B2B2B': [
						['35000000000000000000000', '1029384756', '102938', '1209348756'],
						['12345678900000000000000', '5647382910', '483920', '9078564523'],
					],
				},
			},
		];
		// This data set contains the different possible scenarios (structure based on actual fetched data).
		expect(reduceBatchResult(resultData)).toEqual(expectedData);
	});
});

describe('reduceResult', () => {
	test('Input 1 returns BN(1)', () => {
		expect(reduceResult(1)).toEqual(new BigNumber(1));
	});
	test('Input "1" returns BN(1)', () => {
		expect(reduceResult('1')).toEqual(new BigNumber(1));
	});
	test('Input "100000000" returns BN(100000000)', () => {
		expect(reduceResult('100000000')).toEqual(new BigNumber(100000000));
	});
	test('Input "-100" returns BN(-100)', () => {
		expect(reduceResult('-100')).toEqual(new BigNumber(-100));
	});
	test('Input "" returns ""', () => {
		expect(reduceResult('')).toEqual('');
	});
	test('Input "0x1A1A1A1A1A1A1A1A1A1A1A1A1A1A1A1A1A1A1A1A" returns "0x1a1a1a1a1a1a1a1a1a1a1a1a1a1a1a1a1a1a1a1a"', () => {
		expect(reduceResult('0x1A1A1A1A1A1A1A1A1A1A1A1A1A1A1A1A1A1A1A1A')).toEqual(
			'0x1a1a1a1a1a1a1a1a1a1a1a1a1a1a1a1a1a1a1a1a',
		);
	});
	test('Input NaN returns NaN', () => {
		expect(reduceResult(NaN)).toEqual(NaN);
	});
	test('Input undefined returns undefined', () => {
		expect(reduceResult(undefined)).toEqual(undefined);
	});
	test('Input true returns true', () => {
		expect(reduceResult(true)).toEqual(true);
	});
});

describe('reduceSushiAPIResults', () => {
	test('Mock data set is reduced correctly', () => {
		const resultData = {
			name: 'Sushi Liquidity API',
			pairs: [
				{
					address: '0x1a1a1a1a1a1a1a1a1a1a1a1a1a1a1a1a1a1a1a1a',
					aprDay: 0.1,
					aprMonthly: 1.0,
					aprYear_with_lockup: 1.2534963140772,
					aprYear_without_lockup: 3.7604889422316,
					token0: {
						data: 'testdata',
					},
					token1: {
						data: 'testdata',
					},
				},
				{
					address: '0x2b2b2b2b2b2b2b2b2b2b2b2b2b2b2b2b2b2b2b2b',
					aprDay: 0,
					aprMonthly: NaN,
					aprYear_with_lockup: 1.2534963140772,
					aprYear_without_lockup: -3.7604889422316,
					token0: {
						data: 'testdata',
					},
					token1: {
						data: 'testdata',
					},
				},
			],
		};

		const expectedData = {
			'0x1a1a1a1a1a1a1a1a1a1a1a1a1a1a1a1a1a1a1a1a': {
				address: '0x1a1a1a1a1a1a1a1a1a1a1a1a1a1a1a1a1a1a1a1a',
				day: new BigNumber(0.001),
				week: new BigNumber(0.007),
				month: new BigNumber(0.01),
				year: new BigNumber(0.037604889422316),
			},
			'0x2b2b2b2b2b2b2b2b2b2b2b2b2b2b2b2b2b2b2b2b': {
				address: '0x2b2b2b2b2b2b2b2b2b2b2b2b2b2b2b2b2b2b2b2b',
				day: new BigNumber(0),
				week: new BigNumber(0),
				month: new BigNumber(NaN),
				year: new BigNumber(-0.037604889422316),
			},
		};
		// This data set contains the different possible scenarios (structure based on actual fetched data).
		expect(reduceSushiAPIResults(resultData)).toEqual(expectedData);
	});
});

describe('reduceXSushiROIResults', () => {
	test('Big number input is reduced correctly', () => {
		const expected = {
			day: new BigNumber(1),
			week: new BigNumber(7),
			month: new BigNumber(365).dividedBy(12),
			year: new BigNumber(365),
		};
		expect(reduceXSushiROIResults(new BigNumber(365))).toEqual(expected);
	});
	test('String input is reduced correctly', () => {
		const expected = {
			day: new BigNumber(1),
			week: new BigNumber(7),
			month: new BigNumber(365).dividedBy(12),
			year: new BigNumber(365),
		};
		expect(reduceXSushiROIResults('365')).toEqual(expected);
	});
	test('Number input is reduced correctly', () => {
		const expected = {
			day: new BigNumber(1),
			week: new BigNumber(7),
			month: new BigNumber(365).dividedBy(12),
			year: new BigNumber(365),
		};
		expect(reduceXSushiROIResults(365)).toEqual(expected);
	});
	test('Negative number input is reduced correctly', () => {
		const expected = {
			day: new BigNumber(-1),
			week: new BigNumber(-7),
			month: new BigNumber(-365).dividedBy(12),
			year: new BigNumber(-365),
		};
		expect(reduceXSushiROIResults(-365)).toEqual(expected);
	});
	test('NaN input is reduced correctly', () => {
		const expected = {
			day: new BigNumber(NaN),
			week: new BigNumber(NaN),
			month: new BigNumber(NaN),
			year: new BigNumber(NaN),
		};
		expect(reduceXSushiROIResults(NaN)).toEqual(expected);
	});
});

describe('reduceGrowthQueryConfig', () => {
	test('Block number input is reduced correctly', () => {
		const periods = [12345656, 12339178, 12300178, 12150678, 11381216];
		const expected = {
			periods,
			growthQueries: periods.map(growthQuery), // Growth data is dynamically fetched within reducer function
		};
		expect(reduceGrowthQueryConfig(12345678)).toEqual(expected);
	});
	test('Older block number input is reduced correctly', () => {
		const periods = [START_BLOCK, START_BLOCK, START_BLOCK, START_BLOCK, START_BLOCK];
		const expected = {
			periods,
			growthQueries: periods.map(growthQuery), // Growth data is dynamically fetched within reducer function
		};
		expect(reduceGrowthQueryConfig(1234567)).toEqual(expected);
	});
	test('Negative block number input is reduced correctly', () => {
		const periods = [START_BLOCK, START_BLOCK, START_BLOCK, START_BLOCK, START_BLOCK];
		const expected = {
			periods,
			growthQueries: periods.map(growthQuery), // Growth data is dynamically fetched within reducer function
		};
		expect(reduceGrowthQueryConfig(-12345678)).toEqual(expected);
	});
	test('NaN input is reduced correctly', () => {
		const expected = {
			periods: [],
			growthQueries: [],
		};
		expect(reduceGrowthQueryConfig(NaN)).toEqual(expected);
	});
	test('Undefined input is reduced correctly', () => {
		const expected = {
			periods: [],
			growthQueries: [],
		};
		expect(reduceGrowthQueryConfig(undefined)).toEqual(expected);
	});
});

describe('reduceGraphResult', () => {
	test('Mock data set is reduced correctly', () => {
		const graphResult = [
			// Token data
			{
				data: {
					pair: null,
					token: {
						derivedETH: '0.1',
						id: '0x1a1a1a1a1a1a1a1a1a1a1a1a1a1a1a1a1a1a1a1a',
						name: 'testToken0',
						symbol: 'TOKEN0',
					},
				},
			},
			// Nulled data set
			{
				data: {
					pair: null,
					token: null,
				},
			},
			// Pair data
			{
				data: {
					pair: {
						id: '0x2b2b2b2b2b2b2b2b2b2b2b2b2b2b2b2b2b2b2b2b',
						reserve0: '100',
						reserve1: '200',
						reserveETH: '300',
						token0: {
							derivedETH: '0.0120386246105526492246191975746454',
							id: '0x1a1a1a1a1a1a1a1a1a1a1a1a1a1a1a1a1a1a1a1a',
							name: 'testToken0',
							symbol: 'TOKEN0',
						},
						token1: {
							derivedETH: '0.0120386246105526492246191975746454',
							id: '0x3c3c3c3c3c3c3c3c3c3c3c3c3c3c3c3c3c3c3c3c',
							name: 'testToken1',
							symbol: 'TOKEN1',
						},
						totalSupply: '0.0000001',
					},
					token: null,
				},
			},
		];

		const prices = {
			'0x1a1a1a1a1a1a1a1a1a1a1a1a1a1a1a1a1a1a1a1a': {
				ethValue: new BigNumber(1000),
			},
			'0x3c3c3c3c3c3c3c3c3c3c3c3c3c3c3c3c3c3c3c3c': {
				ethValue: new BigNumber(2000),
			},
		};

		const expectedData = [
			{
				address: '0x1a1a1a1a1a1a1a1a1a1a1a1a1a1a1a1a1a1a1a1a',
				ethValue: new BigNumber(1e17),
				name: 'testToken0',
				type: 'token',
			},
			{
				address: '0x2b2b2b2b2b2b2b2b2b2b2b2b2b2b2b2b2b2b2b2b',
				ethValue: new BigNumber(5e12),
				name: 'testToken0/testToken1',
				type: 'pair',
			},
		];
		// This data set contains the different possible scenarios (structure based on actual fetched data).
		expect(reduceGraphResult(graphResult, prices)).toEqual(expectedData);
	});
});

describe('reduceCurveResult', () => {
	test('Mock data set is reduced correctly', () => {
		const cureveResults = [
			[
				{ virtual_price: 10 },
				{ virtual_price: 9 },
				{ virtual_price: 8 },
				{ virtual_price: 7 },
				{ virtual_price: 6 },
				{ virtual_price: 5 },
				{ virtual_price: 4 },
				{ virtual_price: 3 },
				{ virtual_price: 2 },
				{ virtual_price: 1 },
				{ virtual_price: 0 }, // Sum = 55
			],
			[
				{ virtual_price: 10 },
				{ virtual_price: 9 },
				{ virtual_price: 8 },
				{ virtual_price: 7 },
				{ virtual_price: 6 },
				{ virtual_price: 5 },
				{ virtual_price: 4 },
				{ virtual_price: 3 },
				{ virtual_price: 2 },
				{ virtual_price: 1 },
				{ virtual_price: 0 },
				{ virtual_price: 17 }, // Sum = 72
			],
			[{ virtual_price: -10 }], // Sum = -10
		];

		const contracts = [
			'0x1A1A1A1A1A1A1A1A1A1A1A1A1A1A1A1A1A1A1A1A',
			'0x2B2B2B2B2B2B2B2B2B2B2B2B2B2B2B2B2B2B2B2B',
			'0x3C3C3C3C3C3C3C3C3C3C3C3C3C3C3C3C3C3C3C3C',
		];

		const wbtcToken = {
			address: '0x2260fac5e5542a773aa44fbcfedf7c193bc2c599',
			ethValue: new BigNumber(40),
			name: 'Wrapped BTC',
			type: 'token',
		};

		const expected = [
			{
				address: '0x1a1a1a1a1a1a1a1a1a1a1a1a1a1a1a1a1a1a1a1a',
				ethValue: new BigNumber(2e-16), // 5e-18*40 = 2e-16
				virtualPrice: new BigNumber(5e-18), // (55/11)/1e18 = 5e-18
			},
			{
				address: '0x2b2b2b2b2b2b2b2b2b2b2b2b2b2b2b2b2b2b2b2b',
				ethValue: new BigNumber(2.4e-16), // 6e-18*40 = 2.4e-16
				virtualPrice: new BigNumber(6e-18), // (72/12)/1e18 = 6e-18
			},
			{
				address: '0x3c3c3c3c3c3c3c3c3c3c3c3c3c3c3c3c3c3c3c3c',
				ethValue: new BigNumber(-4e-16), // -1e-17*40 = -4e-15
				virtualPrice: new BigNumber(-1e-17), // (-10/1)/1e18 = -1e-17
			},
		];

		expect(reduceCurveResult(cureveResults, contracts, wbtcToken)).toEqual(expected);
	});
});

describe('reduceGrowth', () => {
	test('Mock data set is reduced correctly', () => {
		const graphResults = [
			{
				data: {
					vaults: [
						{
							id: '0x1a1a1a1a1a1a1a1a1a1a1a1a1a1a1a1a1a1a1a1a',
							pricePerFullShare: '2.5', // now
						},
						{
							id: '0x2b2b2b2b2b2b2b2b2b2b2b2b2b2b2b2b2b2b2b2b',
							pricePerFullShare: '3', // now
						},
						{
							id: '0xAf5A1DECfa95BAF63E0084a35c62592B774A2A87', // Special case
							pricePerFullShare: '1.05', // now -> stored as 1 since it is >= 1.05
						},
					],
				},
			},
			{
				data: {
					vaults: [
						{
							id: '0x1a1a1a1a1a1a1a1a1a1a1a1a1a1a1a1a1a1a1a1a',
							pricePerFullShare: '1', // day
						},
						{
							id: '0x2b2b2b2b2b2b2b2b2b2b2b2b2b2b2b2b2b2b2b2b',
							pricePerFullShare: '1.5', // day
						},
						{
							id: '0xAf5A1DECfa95BAF63E0084a35c62592B774A2A87', // Special case
							pricePerFullShare: '0.5', // day
						},
					],
				},
			},
			{
				data: {
					vaults: [
						{
							id: '0x1a1a1a1a1a1a1a1a1a1a1a1a1a1a1a1a1a1a1a1a',
							pricePerFullShare: '1.25', // week
						},
						{
							id: '0x2b2b2b2b2b2b2b2b2b2b2b2b2b2b2b2b2b2b2b2b',
							pricePerFullShare: '0.5', // week
						},
						{
							id: '0xAf5A1DECfa95BAF63E0084a35c62592B774A2A87', // Special case
							pricePerFullShare: '1.5', // week -> stored as 1 since it is >= 1.05
						},
					],
				},
			},
			{
				data: {
					vaults: [
						{
							id: '0x1a1a1a1a1a1a1a1a1a1a1a1a1a1a1a1a1a1a1a1a',
							pricePerFullShare: '2.5', // month
						},
						{
							id: '0x2b2b2b2b2b2b2b2b2b2b2b2b2b2b2b2b2b2b2b2b',
							pricePerFullShare: '1', // month
						},
						{
							id: '0xAf5A1DECfa95BAF63E0084a35c62592B774A2A87', // Special case
							pricePerFullShare: '1.001', // month
						},
					],
				},
			},
			{
				data: {
					vaults: [
						{
							id: '0x1a1a1a1a1a1a1a1a1a1a1a1a1a1a1a1a1a1a1a1a',
							pricePerFullShare: '1.25', // start
						},
						{
							id: '0x2b2b2b2b2b2b2b2b2b2b2b2b2b2b2b2b2b2b2b2b',
							pricePerFullShare: '0.7', // start
						},
						{
							id: '0xAf5A1DECfa95BAF63E0084a35c62592B774A2A87', // Special case
							pricePerFullShare: '-1', // start (negative case)
						},
					],
				},
			},
		];

		const periods = [11965778, 11959300, 11920300, 11770800, 11381216];

		const startDate = new Date('December 03, 2020 13:11:35 GMT-0500');

		const expected = {
			'0x1a1a1a1a1a1a1a1a1a1a1a1a1a1a1a1a1a1a1a1a': {
				day: new BigNumber(1.5), // (2.5/1)-1 = 1.5
				week: new BigNumber(1), // (2.5/1.25)-1 = 1
				month: new BigNumber(0), // (2.5/2.5)-1 = 0
				year: new BigNumber(1892160), // (2.5/1.25)-1 = 1 -> 1/1000 -> (1/1000)*365*24*60*60*60 = 1892160
			},
			'0x2b2b2b2b2b2b2b2b2b2b2b2b2b2b2b2b2b2b2b2b': {
				day: new BigNumber(1), // (3/1.5)-1 = 1
				week: new BigNumber(7), // (1*7) = 7
				month: new BigNumber(28), // (7*4) = 28
				year: new BigNumber(365.4), // (28*13.05) = 365.4
			},
			'0xAf5A1DECfa95BAF63E0084a35c62592B774A2A87': {
				day: new BigNumber(1), // (1/0.5)-1 = 1
				week: new BigNumber(7), // (1*7) = 7
				month: new BigNumber(1).dividedBy(1.001).minus(1), // (1/1.001)-1 = -0.000999000999000999
				year: new BigNumber(1).dividedBy(1.001).minus(1).multipliedBy(13.05), // (28*13.05) = -0.01303696303696303695
			},
		};

		// Sets current date to 1 second after the start date for the test run
		jest.spyOn(global.Date, 'now').mockImplementationOnce(() =>
			new Date('December 03, 2020 13:11:36 GMT-0500').valueOf(),
		);

		// The data set provided covers the different possible cases
		expect(reduceGrowth(graphResults, periods, startDate)).toEqual(expected);
	});
});

describe('reduceGeyserSchedule', () => {
	// Create store with mock token objects
	const mockStore = store;
	mockStore.contracts.tokens['0x798D1bE841a82a273720CE31c822C61a67a601C3'.toLowerCase()] = {
		address: '0x798D1bE841a82a273720CE31c822C61a67a601C3',
		data: 'Token0',
	};
	mockStore.contracts.tokens['0x3472A5A71965499acd81997a54BBA8D852C6E53d'.toLowerCase()] = {
		address: '0x3472A5A71965499acd81997a54BBA8D852C6E53d',
		data: 'Token1',
	};
	mockStore.contracts.tokens['0x1a1a1a1a1a1a1a1a1a1a1a1a1a1a1a1a1a1a1a1a'.toLowerCase()] = {
		address: '0x1a1a1a1a1a1a1a1a1a1a1a1a1a1a1a1a1a1a1a1a',
		data: 'Token2',
	};

	test('Mock data set is reduced correctly - No Special case', () => {
		const schedules = {
			'0x3472A5A71965499acd81997a54BBA8D852C6E53d': [
				// [initial, endAtSec, , startTime] -> startTime < timestamp < endAtSec
				['10', '1607019097', '604800', '1607019095'],
				['10', '1607019097', '86400', '1607019095'],
			],
		};
		const expected = [
			{
				day: {
					amount: new BigNumber(864000), // 20/(1607019097-1607019095) = 10 -> 10 * 60 * 60 * 24
					token: {
						address: '0x3472A5A71965499acd81997a54BBA8D852C6E53d',
						data: 'Token1',
					},
				},
				week: {
					amount: new BigNumber(6048000), // 20/(1607019097-1607019095) = 10 -> 10 * 60 * 60 * 24 * 7
					token: {
						address: '0x3472A5A71965499acd81997a54BBA8D852C6E53d',
						data: 'Token1',
					},
				},
				month: {
					amount: new BigNumber(25920000), // 20/(1607019097-1607019095) = 10 -> 10 * 60 * 60 * 24 * 30
					token: {
						address: '0x3472A5A71965499acd81997a54BBA8D852C6E53d',
						data: 'Token1',
					},
				},
				year: {
					amount: new BigNumber(315360000), // 20/(1607019097-1607019095) = 10 -> 10 * 60 * 60 * 24 * 365
					token: {
						address: '0x3472A5A71965499acd81997a54BBA8D852C6E53d',
						data: 'Token1',
					},
				},
			},
		];

		// Sets current date to mock timestamp (Timestamp: 1607019096)
		jest.spyOn(global.Date, 'now').mockImplementationOnce(() =>
			new Date('December 03, 2020 13:11:36 GMT-0500').valueOf(),
		);

		expect(reduceGeyserSchedule(schedules, mockStore)).toEqual(expected);
	});

	test('Mock data set is reduced correctly - Special case', () => {
		const schedules = {
			'0x798D1bE841a82a273720CE31c822C61a67a601C3': [
				// [initial, endAtSec, , startTime] -> startTime < timestamp < endAtSec
				[
					'202057195719116761014131368840160399203956123241542784248853484086980000000',
					'1607019097',
					'518400',
					'1607019095',
				],
				[
					'202057195719116761014131368840160399203956123241542784248853484086980000000',
					'1607019097',
					'604800',
					'1607019095',
				],
			],
		};
		const expected = [
			{
				day: {
					// 687311999999999.972835496795423584 - Done programatically to preserve BigNumber integrity
					amount: new BigNumber('202057195719116761014131368840160399203956123241542784248853484086980000000')
						.dividedBy(28948022309329048855892746252171976963317496166410141009864396001)
						.multipliedBy(60 * 60 * 24),
					token: {
						address: '0x798D1bE841a82a273720CE31c822C61a67a601C3',
						data: 'Token0',
					},
				},
				week: {
					// 4811183999999999.809848477567965088 - Done programatically to preserve BigNumber integrity
					amount: new BigNumber('202057195719116761014131368840160399203956123241542784248853484086980000000')
						.dividedBy(28948022309329048855892746252171976963317496166410141009864396001)
						.multipliedBy(60 * 60 * 24 * 7),
					token: {
						address: '0x798D1bE841a82a273720CE31c822C61a67a601C3',
						data: 'Token0',
					},
				},
				month: {
					// 20619359999999999.18506490386270752 - Done programatically to preserve BigNumber integrity
					amount: new BigNumber('202057195719116761014131368840160399203956123241542784248853484086980000000')
						.dividedBy(28948022309329048855892746252171976963317496166410141009864396001)
						.multipliedBy(60 * 60 * 24 * 30),
					token: {
						address: '0x798D1bE841a82a273720CE31c822C61a67a601C3',
						data: 'Token0',
					},
				},
				year: {
					// 250868879999999990.08495633032960816 - Done programatically to preserve BigNumber integrity
					amount: new BigNumber('202057195719116761014131368840160399203956123241542784248853484086980000000')
						.dividedBy(28948022309329048855892746252171976963317496166410141009864396001)
						.multipliedBy(60 * 60 * 24 * 365),
					token: {
						address: '0x798D1bE841a82a273720CE31c822C61a67a601C3',
						data: 'Token0',
					},
				},
			},
		];

		// Sets current date to mock timestamp (Timestamp: 1607019096)
		jest.spyOn(global.Date, 'now').mockImplementationOnce(() =>
			new Date('December 03, 2020 13:11:36 GMT-0500').valueOf(),
		);

		// The data set provided covers the different possible cases
		expect(reduceGeyserSchedule(schedules, mockStore)).toEqual(expected);
	});

	test('Mock data set is reduced correctly - timestamp < startTime', () => {
		const schedules = {
			'0x1a1a1a1a1a1a1a1a1a1a1a1a1a1a1a1a1a1a1a1a': [
				// [initial, endAtSec, , startTime] -> timestamp < startTime < endAtSec
				['10', '1607019099', '604800', '1607019097'],
				['10', '1607019099', '86400', '1607019097'],
			],
		};
		const expected = [
			{
				day: {
					amount: new BigNumber(0).dividedBy(0), // Locked = 0 and duration = 0
					token: {
						address: '0x1a1a1a1a1a1a1a1a1a1a1a1a1a1a1a1a1a1a1a1a',
						data: 'Token2',
					},
				},
				week: {
					amount: new BigNumber(0).dividedBy(0), // Locked = 0 and duration = 0
					token: {
						address: '0x1a1a1a1a1a1a1a1a1a1a1a1a1a1a1a1a1a1a1a1a',
						data: 'Token2',
					},
				},
				month: {
					amount: new BigNumber(0).dividedBy(0), // Locked = 0 and duration = 0
					token: {
						address: '0x1a1a1a1a1a1a1a1a1a1a1a1a1a1a1a1a1a1a1a1a',
						data: 'Token2',
					},
				},
				year: {
					amount: new BigNumber(20).dividedBy(3).multipliedBy(60 * 60 * 24 * 365), // periodAllTime.start = startTime
					token: {
						address: '0x1a1a1a1a1a1a1a1a1a1a1a1a1a1a1a1a1a1a1a1a',
						data: 'Token2',
					},
				},
			},
		];

		// Sets current date to mock timestamp (Timestamp: 1607019096)
		jest.spyOn(global.Date, 'now').mockImplementationOnce(() =>
			new Date('December 03, 2020 13:11:36 GMT-0500').valueOf(),
		);

		expect(reduceGeyserSchedule(schedules, mockStore)).toEqual(expected);
	});
});

describe('reduceContractConfig', () => {
	test('Mock data set is reduced correctly', () => {
		const configs = [
			{
				abi: [],
				contracts: ['0x6b3595068778dd592e39a122f4f5a5cf09c90fe2', '0x6def55d2e18486b9ddfaa075bc4e4ee0b28c1545'],
				fillers: {
					isFeatured: [false, false],
					isSuperSett: [true, true],
					position: [1, 2],
					symbol: ['token1', 'token2'],
				},
				methods: [
					{
						args: ['{connectedAddress}'],
						name: 'balanceOf',
					},
				],
				underlying: 'token',
			},
			{
				abi: [],
				contracts: ['0x36e2fcccc59e5747ff63a03ea2e5c0c2c14911e7', '0x64eda51d3ad40d56b9dfc5554e06f94e1dd786fd'],
				fillers: {
					isFeatured: [true, true],
					isSuperSett: [false, false],
					position: [3, 4],
					symbol: ['token3', 'token4'],
				},
				methods: [],
				underlying: 'token',
			},
		];

		const payload = { connectedAddress: '0x0z0z0z0z0z0z0z0z0z0z0z0z0z0z0z0z0z0z0z0z' };

		const expected = {
			batchCall: [
				{
					abi: [],
					addresses: [
						'0x6B3595068778DD592e39A122f4f5a5cF09C90fE2',
						'0x6dEf55d2e18486B9dDfaA075bc4e4EE0B28c1545',
					],
					allReadMethods: false,
					groupByNamespace: true,
					logging: false,
					namespace: 'namespace',
					readMethods: [
						{
							name: 'balanceOf',
							args: ['0x0z0z0z0z0z0z0z0z0z0z0z0z0z0z0z0z0z0z0z0z'],
						},
					],
				},
				{
					abi: [],
					addresses: [
						'0x36e2FCCCc59e5747Ff63a03ea2e5C0c2C14911e7',
						'0x64eda51d3Ad40D56b9dFc5554E06F94e1Dd786Fd',
					],
					allReadMethods: false,
					groupByNamespace: true,
					logging: false,
					namespace: 'namespace',
				},
			],
			defaults: {
				'0x6b3595068778dd592e39a122f4f5a5cf09c90fe2': {
					abi: [],
					address: '0x6b3595068778dd592e39a122f4f5a5cf09c90fe2',
					isFeatured: false,
					isSuperSett: true,
					methods: [
						{
							name: 'balanceOf',
							args: ['0x0z0z0z0z0z0z0z0z0z0z0z0z0z0z0z0z0z0z0z0z'],
						},
					],
					position: 1,
					symbol: 'token1',
					underlyingKey: 'token',
				},
				'0x6def55d2e18486b9ddfaa075bc4e4ee0b28c1545': {
					abi: [],
					address: '0x6def55d2e18486b9ddfaa075bc4e4ee0b28c1545',
					isFeatured: false,
					isSuperSett: true,
					methods: [
						{
							name: 'balanceOf',
							args: ['0x0z0z0z0z0z0z0z0z0z0z0z0z0z0z0z0z0z0z0z0z'],
						},
					],
					position: 2,
					symbol: 'token2',
					underlyingKey: 'token',
				},
				'0x36e2fcccc59e5747ff63a03ea2e5c0c2c14911e7': {
					abi: [],
					address: '0x36e2fcccc59e5747ff63a03ea2e5c0c2c14911e7',
					isFeatured: true,
					isSuperSett: false,
					methods: [],
					position: 3,
					symbol: 'token3',
					underlyingKey: 'token',
				},
				'0x64eda51d3ad40d56b9dfc5554e06f94e1dd786fd': {
					abi: [],
					address: '0x64eda51d3ad40d56b9dfc5554e06f94e1dd786fd',
					isFeatured: true,
					isSuperSett: false,
					methods: [],
					position: 4,
					symbol: 'token4',
					underlyingKey: 'token',
				},
			},
		};

		expect(reduceContractConfig(configs, payload)).toEqual(expected);
	});
});

describe('reduceMethodConfig', () => {
	test('Mock data set is reduced correctly', () => {
		const methods = [
			{
				args: ['{connectedAddress}'],
				name: 'balanceOf',
			},
			{
				name: 'getPricePerFullShare',
				args: ['{test}'],
			},
			{
				name: 'balance',
			},
		];

		const payload = { connectedAddress: '0x1a1a1a1a1a1a1a1a1a1a1a1a1a1a1a1a1a1a1a1a', test: 'test' };

		const expected = [
			{
				name: 'balanceOf',
				args: ['0x1a1a1a1a1a1a1a1a1a1a1a1a1a1a1a1a1a1a1a1a'],
			},
			{
				name: 'getPricePerFullShare',
				args: ['test'],
			},
			{
				name: 'balance',
			},
		];

		// The data set provided covers the different possible cases
		expect(reduceMethodConfig(methods, payload)).toEqual(expected);
	});
});
