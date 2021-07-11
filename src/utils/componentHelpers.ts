import { LeaderboardRank } from '../mobx/model';
import { LEADERBOARD_RANKS } from '../config/constants';
import { isWithinRange } from '../mobx/utils/helpers';

export const debounce = (n: number, fn: (...params: any[]) => any, immediate = false): any => {
	let timer: any = undefined;
	return function (this: any, ...args: any[]) {
		if (timer === undefined && immediate) {
			fn.apply(this, args);
		}
		clearTimeout(timer);
		timer = setTimeout(() => fn.apply(this, args), n);
		return timer;
	};
};

export const shortenAddress = (address: string): string => {
	if (!address) return '';
	return address.slice(0, 6) + '...' + address.slice(address.length - 6, address.length);
};

/**
 * Calculates the percentage of a given point within a range
 */
export const percentageBetweenRange = (point: number, upperLimit: number, lowerLimit: number): number => {
	return ((point - lowerLimit) / (upperLimit - lowerLimit)) * 100;
};

export const getRankFromBoost = (currentBoost: number): LeaderboardRank => {
	return LEADERBOARD_RANKS[getRankNumberFromBoost(currentBoost)];
};

export const getRankNumberFromBoost = (currentBoost: number): number => {
	if (currentBoost < LEADERBOARD_RANKS[LEADERBOARD_RANKS.length - 1].boostRangeStart) {
		return LEADERBOARD_RANKS.length - 1;
	}

	// ranks are in descending order
	for (let index = LEADERBOARD_RANKS.length - 1; index >= 0; index--) {
		const currentBadgerLevel = LEADERBOARD_RANKS[index];
		const nextBadgerLevel = LEADERBOARD_RANKS[index - 1];

		// boost has reached last level
		if (!nextBadgerLevel) {
			return index;
		}

		if (isWithinRange(currentBoost, currentBadgerLevel.boostRangeStart, currentBadgerLevel.boostRangeEnd)) {
			return index;
		}
	}

	// first level as default
	return LEADERBOARD_RANKS.length - 1;
};
