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
