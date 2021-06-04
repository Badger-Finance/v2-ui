import '@testing-library/jest-dom';
import { reduceTimeSinceLastCycle, reduceClaims } from '../../mobx/reducers/statsReducers';
import MockDate from 'mockdate';
import BigNumber from 'bignumber.js';
import { RewardMerkleClaim, TreeClaimData } from 'mobx/model';
import { TokenBalance } from 'mobx/model/token-balance';
import { ETH_DEPLOY } from 'web3/config/eth-config';
import store from 'mobx/store';

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
	const badger = ETH_DEPLOY.tokens.badger;
	const digg = ETH_DEPLOY.tokens.digg;
	const wbtc = ETH_DEPLOY.tokens.wBTC;

	test('Claims with normal values are reduced correctly', () => {
		const proof: RewardMerkleClaim = {
			index: '',
			cycle: '',
			boost: new BigNumber(1),
			user: '1',
			tokens: [badger, digg],
			cumulativeAmounts: ['100', '200'],
			proof: ['', ''],
			node: '',
		};
		const claimedRewards: TreeClaimData = [
			['0x111', '0x222'],
			['1', '2'],
		];
		const expected: TokenBalance[] = [
			store.rewards.balanceFromProof(badger, '99'),
			store.rewards.balanceFromProof(digg, '198'),
		];
		expect(reduceClaims(proof, claimedRewards)).toEqual(expected);
	});
	test('Claims with same claimed and earned values are reduced correctly', () => {
		const proof: RewardMerkleClaim = {
			index: '',
			cycle: '',
			boost: new BigNumber(1),
			user: '1',
			tokens: [badger, digg],
			cumulativeAmounts: ['100', '200'],
			proof: ['', ''],
			node: '',
		};
		const claimedRewards: TreeClaimData = [
			['0x111', '0x222'],
			['100', '200'],
		];
		const expected: TokenBalance[] = [
			store.rewards.balanceFromProof(badger, '0'),
			store.rewards.balanceFromProof(digg, '0'),
		];
		expect(reduceClaims(proof, claimedRewards)).toEqual(expected);
	});
	test('Claims with negative claimed values are reduced correctly', () => {
		const proof: RewardMerkleClaim = {
			index: '',
			cycle: '',
			boost: new BigNumber(1),
			user: '1',
			tokens: [badger, digg],
			cumulativeAmounts: ['100', '200'],
			proof: ['', ''],
			node: '',
		};
		const claimedRewards: TreeClaimData = [
			['0x111', '0x222'],
			['-1', '-2'],
		];
		const expected: TokenBalance[] = [
			store.rewards.balanceFromProof(badger, '101'),
			store.rewards.balanceFromProof(digg, '202'),
		];
		expect(reduceClaims(proof, claimedRewards)).toEqual(expected);
	});
	test('Claims with empty earned values are reduced correctly', () => {
		const proof: RewardMerkleClaim = {
			index: '',
			cycle: '',
			boost: new BigNumber(1),
			user: '1',
			tokens: [badger, digg],
			cumulativeAmounts: ['', ''],
			proof: ['', ''],
			node: '',
		};
		const claimedRewards: TreeClaimData = [
			['0x111', '0x222'],
			['1', '2'],
		];
		const expected: TokenBalance[] = [
			store.rewards.balanceFromProof(badger, 'NaN'),
			store.rewards.balanceFromProof(digg, 'NaN'),
		];
		expect(reduceClaims(proof, claimedRewards)).toEqual(expected);
	});
	test('Claims with NaN claimed values are reduced correctly', () => {
		const proof: RewardMerkleClaim = {
			index: '',
			cycle: '',
			boost: new BigNumber(1),
			user: '1',
			tokens: [badger, digg],
			cumulativeAmounts: ['100', '200'],
			proof: ['', ''],
			node: '',
		};
		const claimedRewards: TreeClaimData = [
			['0x111', '0x222'],
			['NaN', 'NaN'],
		];
		const expected: TokenBalance[] = [
			store.rewards.balanceFromProof(badger, 'NaN'),
			store.rewards.balanceFromProof(digg, 'NaN'),
		];
		expect(reduceClaims(proof, claimedRewards)).toEqual(expected);
	});
	test('Claims with different array sizes are reduced correctly 1', () => {
		const proof: RewardMerkleClaim = {
			index: '',
			cycle: '',
			boost: new BigNumber(1),
			user: '1',
			tokens: [badger, digg, wbtc],
			cumulativeAmounts: ['100', '200', '300'],
			proof: ['', ''],
			node: '',
		};
		const claimedRewards: TreeClaimData = [
			['0x111', '0x222'],
			['1', '2'],
		];
		const expected: TokenBalance[] = [
			store.rewards.balanceFromProof(badger, '99'),
			store.rewards.balanceFromProof(digg, '198'),
			store.rewards.balanceFromProof(wbtc, 'NaN'),
		];
		expect(reduceClaims(proof, claimedRewards)).toEqual(expected);
	});
	test('Claims with different array sizes are reduced correctly 2', () => {
		const proof: RewardMerkleClaim = {
			index: '',
			cycle: '',
			boost: new BigNumber(1),
			user: '1',
			tokens: [badger, digg],
			cumulativeAmounts: ['100', '200'],
			proof: ['', ''],
			node: '',
		};
		const claimedRewards: TreeClaimData = [
			['0x111', '0x222', '0x333'],
			['1', '2', '3'],
		];
		const expected: TokenBalance[] = [
			store.rewards.balanceFromProof(badger, '99'),
			store.rewards.balanceFromProof(digg, '198'),
		];
		expect(reduceClaims(proof, claimedRewards)).toEqual(expected);
	});
});
