import '@testing-library/jest-dom';
import { reduceTimeSinceLastCycle, reduceClaims } from '../../mobx/reducers/statsReducers';
import MockDate from 'mockdate';
import BigNumber from 'bignumber.js';
import { RewardMerkleClaim, TreeClaimData, UserClaimData } from 'mobx/model';

describe('getPercentageChange', () => {
	beforeEach(() => {
		MockDate.set('January 01, 2021 12:00:00 GMT-0500'); // Fri Jan 01 2021 12:00:00 GMT-0500 (Eastern Standard Time)
	});
	afterEach(() => {
		MockDate.reset();
	});
	test.each([
		[1609520401, '0h 0m'], // Fri Jan 01 2021 12:00:01 GMT-0500 (Eastern Standard Time)
		[1609520340, '0h 1m'], // Fri Jan 01 2021 11:59:00 GMT-0500 (Eastern Standard Time)
		[1609520460, '0h 1m'], // Fri Jan 01 2021 12:01:00 GMT-0500 (Eastern Standard Time)
		[1609524000, '1h 0m'], // Fri Jan 01 2021 13:00:00 GMT-0500 (Eastern Standard Time)
		[1609516800, '1h 0m'], // Fri Jan 01 2021 11:00:00 GMT-0500 (Eastern Standard Time)
		[1609434000, '24h 0m'], // Thu Dec 31 2020 12:00:00 GMT-0500 (Eastern Standard Time)
		[1609515000, '1h 30m'], // Fri Jan 01 2021 10:30:00 GMT-0500 (Eastern Standard Time)
		[1577898000, '8784h 0m'], // Wed Jan 01 2020 12:00:00 GMT-0500 (Eastern Standard Time)
		[1609520400, '0h 0m'], // Fri Jan 01 2021 12:00:00 GMT-0500 (Eastern Standard Time)
		[-1609520340, '894177h 59m'], // Fri Jan 01 2021 11:59:00 GMT-0500 (Eastern Standard Time) (negative)
	])('reduceTimeSinceLastCycle(%f) returns %s', (time, expected) => {
		expect(reduceTimeSinceLastCycle(time)).toBe(expected);
	});
});

describe('reduceClaims', () => {
	test('Claims with normal values are reduced correctly', () => {
		const proof: RewardMerkleClaim = {
			index: '',
			cycle: '',
			boost: new BigNumber(1),
			user: '1',
			tokens: ['token1', 'token2'],
			cumulativeAmounts: ['100', '200'],
			proof: ['', ''],
			node: '',
		};
		const claimedRewards: TreeClaimData = [
			['0x111', '0x222'],
			[new BigNumber(1), new BigNumber(2)],
		];
		const expected: UserClaimData[] = [
			{ amount: new BigNumber(99), token: 'token1' },
			{ amount: new BigNumber(198), token: 'token2' },
		];
		expect(reduceClaims(proof, claimedRewards)).toEqual(expected);
	});
	test('Claims with same claimed and earned values are reduced correctly', () => {
		const proof: RewardMerkleClaim = {
			index: '',
			cycle: '',
			boost: new BigNumber(1),
			user: '1',
			tokens: ['token1', 'token2'],
			cumulativeAmounts: ['100', '200'],
			proof: ['', ''],
			node: '',
		};
		const claimedRewards: TreeClaimData = [
			['0x111', '0x222'],
			[new BigNumber(100), new BigNumber(200)],
		];
		const expected: UserClaimData[] = [
			{ amount: new BigNumber(0), token: 'token1' },
			{ amount: new BigNumber(0), token: 'token2' },
		];
		expect(reduceClaims(proof, claimedRewards)).toEqual(expected);
	});
	test('Claims with negative claimed values are reduced correctly', () => {
		const proof: RewardMerkleClaim = {
			index: '',
			cycle: '',
			boost: new BigNumber(1),
			user: '1',
			tokens: ['token1', 'token2'],
			cumulativeAmounts: ['100', '200'],
			proof: ['', ''],
			node: '',
		};
		const claimedRewards: TreeClaimData = [
			['0x111', '0x222'],
			[new BigNumber(-1), new BigNumber(-2)],
		];
		const expected: UserClaimData[] = [
			{ amount: new BigNumber(101), token: 'token1' },
			{ amount: new BigNumber(202), token: 'token2' },
		];
		expect(reduceClaims(proof, claimedRewards)).toEqual(expected);
	});
	test('Claims with empty earned values are reduced correctly', () => {
		const proof: RewardMerkleClaim = {
			index: '',
			cycle: '',
			boost: new BigNumber(1),
			user: '1',
			tokens: ['token1', 'token2'],
			cumulativeAmounts: ['', ''],
			proof: ['', ''],
			node: '',
		};
		const claimedRewards: TreeClaimData = [
			['0x111', '0x222'],
			[new BigNumber(1), new BigNumber(2)],
		];
		const expected: UserClaimData[] = [
			{ amount: new BigNumber(NaN), token: 'token1' },
			{ amount: new BigNumber(NaN), token: 'token2' },
		];
		expect(reduceClaims(proof, claimedRewards)).toEqual(expected);
	});
	test('Claims with NaN claimed values are reduced correctly', () => {
		const proof: RewardMerkleClaim = {
			index: '',
			cycle: '',
			boost: new BigNumber(1),
			user: '1',
			tokens: ['token1', 'token2'],
			cumulativeAmounts: ['100', '200'],
			proof: ['', ''],
			node: '',
		};
		const claimedRewards: TreeClaimData = [
			['0x111', '0x222'],
			[new BigNumber(NaN), new BigNumber(NaN)],
		];
		const expected: UserClaimData[] = [
			{ amount: new BigNumber(NaN), token: 'token1' },
			{ amount: new BigNumber(NaN), token: 'token2' },
		];
		expect(reduceClaims(proof, claimedRewards)).toEqual(expected);
	});
	test('Claims with different array sizes are reduced correctly 1', () => {
		const proof: RewardMerkleClaim = {
			index: '',
			cycle: '',
			boost: new BigNumber(1),
			user: '1',
			tokens: ['token1', 'token2', 'token3'],
			cumulativeAmounts: ['100', '200', '300'],
			proof: ['', ''],
			node: '',
		};
		const claimedRewards: TreeClaimData = [
			['0x111', '0x222'],
			[new BigNumber(1), new BigNumber(2)],
		];
		const expected: UserClaimData[] = [
			{ amount: new BigNumber(99), token: 'token1' },
			{ amount: new BigNumber(198), token: 'token2' },
			{ amount: new BigNumber(NaN), token: 'token3' },
		];
		expect(reduceClaims(proof, claimedRewards)).toEqual(expected);
	});
	test('Claims with different array sizes are reduced correctly 2', () => {
		const proof: RewardMerkleClaim = {
			index: '',
			cycle: '',
			boost: new BigNumber(1),
			user: '1',
			tokens: ['token1', 'token2'],
			cumulativeAmounts: ['100', '200'],
			proof: ['', ''],
			node: '',
		};
		const claimedRewards: TreeClaimData = [
			['0x111', '0x222', '0x333'],
			[new BigNumber(1), new BigNumber(2), new BigNumber(3)],
		];
		const expected: UserClaimData[] = [
			{ amount: new BigNumber(99), token: 'token1' },
			{ amount: new BigNumber(198), token: 'token2' },
		];
		expect(reduceClaims(proof, claimedRewards)).toEqual(expected);
	});
});
