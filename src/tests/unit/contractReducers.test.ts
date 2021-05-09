import '@testing-library/jest-dom';
import { cleanup } from '@testing-library/react';
import BigNumber from 'bignumber.js';
import { reduceBatchResult, reduceResult } from '../../mobx/reducers/contractReducers';

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
