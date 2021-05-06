import '@testing-library/jest-dom';
import { cleanup } from '@testing-library/react';
import BigNumber from 'bignumber.js';
import {
	reduceBatchResult,
	reduceContractConfig,
	reduceCurveResult,
	reduceGraphResult,
	reduceMethodConfig,
	reduceResult,
} from '../../mobx/reducers/contractReducers';

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
				address: '0x1A1A1A1A1A1A1A1A1A1A1A1A1A1A1A1A1A1A1A1A',
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
	test('Input "0x1a1a1a1a1a1a1a1a1a1a1a1a1a1a1a1a1a1a1a1a" returns "0x1a1a1a1a1a1a1a1a1a1a1a1a1a1a1a1a1a1a1a1a"', () => {
		expect(reduceResult('0x1a1a1a1a1a1a1a1a1a1a1a1a1a1a1a1a1a1a1a1a')).toEqual(
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
				address: '0x1A1A1A1A1A1A1A1A1A1A1A1A1A1A1A1A1A1A1A1A',
				ethValue: new BigNumber(2e-16), // 5e-18*40 = 2e-16
				virtualPrice: new BigNumber(5e-18), // (55/11)/1e18 = 5e-18
			},
			{
				address: '0x2B2B2B2B2B2B2B2B2B2B2B2B2B2B2B2B2B2B2B2B',
				ethValue: new BigNumber(2.4e-16), // 6e-18*40 = 2.4e-16
				virtualPrice: new BigNumber(6e-18), // (72/12)/1e18 = 6e-18
			},
			{
				address: '0x3C3C3C3C3C3C3C3C3C3C3C3C3C3C3C3C3C3C3C3C',
				ethValue: new BigNumber(-4e-16), // -1e-17*40 = -4e-15
				virtualPrice: new BigNumber(-1e-17), // (-10/1)/1e18 = -1e-17
			},
		];

		expect(reduceCurveResult(cureveResults, contracts, wbtcToken)).toEqual(expected);
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
