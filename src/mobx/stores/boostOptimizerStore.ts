import BigNumber from 'bignumber.js';

import deploy from '../../config/deployments/mainnet.json';
import { RootStore } from '../store';

// linear interpolation
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

const leaderboard = [
	3,
	3,
	3,
	2.99,
	2.99,
	2.99,
	2.99,
	2.99,
	2.98,
	2.98,
	2.98,
	2.98,
	2.98,
	2.97,
	2.97,
	2.97,
	2.97,
	2.97,
	2.96,
	2.96,
	2.96,
	2.96,
	2.96,
	2.95,
	2.95,
	2.95,
	2.95,
	2.95,
	2.94,
	2.94,
	2.94,
	2.94,
	2.94,
	2.93,
	2.93,
	2.93,
	2.93,
	2.93,
	2.92,
	2.92,
	2.92,
	2.92,
	2.92,
	2.91,
	2.91,
	2.91,
	2.91,
	2.91,
	2.9,
	2.9,
	2.9,
	2.9,
	2.9,
	2.89,
	2.89,
	2.89,
	2.89,
	2.89,
	2.88,
	2.88,
	2.88,
	2.88,
	2.88,
	2.87,
	2.87,
	2.87,
	2.87,
	2.87,
	2.86,
	2.86,
	2.86,
	2.86,
	2.86,
	2.85,
	2.85,
	2.85,
	2.85,
	2.85,
	2.84,
	2.84,
	2.84,
	2.84,
	2.84,
	2.83,
	2.83,
	2.83,
	2.83,
	2.83,
	2.82,
	2.82,
	2.82,
	2.82,
	2.82,
	2.81,
	2.81,
	2.81,
	2.81,
	2.81,
	2.8,
	2.8,
	2.8,
	2.8,
	2.8,
	2.79,
	2.79,
	2.79,
	2.79,
	2.79,
	2.78,
	2.78,
	2.78,
	2.78,
	2.78,
	2.77,
	2.77,
	2.77,
	2.77,
	2.77,
	2.76,
	2.76,
	2.76,
	2.76,
	2.76,
	2.75,
	2.75,
	2.75,
	2.75,
	2.75,
	2.74,
	2.74,
	2.74,
	2.74,
	2.74,
	2.73,
	2.73,
	2.73,
	2.73,
	2.73,
	2.72,
	2.72,
	2.72,
	2.72,
	2.72,
	2.71,
	2.71,
	2.71,
	2.71,
	2.71,
	2.7,
	2.7,
	2.7,
	2.7,
	2.7,
	2.69,
	2.69,
	2.69,
	2.69,
	2.69,
	2.68,
	2.68,
	2.68,
	2.68,
	2.68,
	2.67,
	2.67,
	2.67,
	2.67,
	2.67,
	2.66,
	2.66,
	2.66,
	2.66,
	2.66,
	2.65,
	2.65,
	2.65,
	2.65,
	2.65,
	2.64,
	2.64,
	2.64,
	2.64,
	2.64,
	2.63,
	2.63,
	2.63,
	2.63,
	2.63,
	2.62,
	2.62,
	2.62,
	2.62,
	2.62,
	2.61,
	2.61,
	2.61,
	2.61,
	2.61,
	2.6,
	2.6,
	2.6,
	2.6,
	2.6,
	2.59,
	2.59,
	2.59,
	2.59,
	2.59,
	2.58,
	2.58,
	2.58,
	2.58,
	2.58,
	2.57,
	2.57,
	2.57,
	2.57,
	2.57,
	2.56,
	2.56,
	2.56,
	2.56,
	2.56,
	2.55,
	2.55,
	2.55,
	2.55,
	2.55,
	2.54,
	2.54,
	2.54,
	2.54,
	2.54,
	2.53,
	2.53,
	2.53,
	2.53,
	2.53,
	2.52,
	2.52,
	2.52,
	2.52,
	2.52,
	2.51,
	2.51,
	2.51,
	2.51,
	2.51,
	2.5,
	2.5,
	2.5,
	2.5,
	2.5,
	2.49,
	2.49,
	2.49,
	2.49,
	2.49,
	2.48,
	2.48,
	2.48,
	2.48,
	2.48,
	2.47,
	2.47,
	2.47,
	2.47,
	2.47,
	2.46,
	2.46,
	2.46,
	2.46,
	2.46,
	2.45,
	2.45,
	2.45,
	2.45,
	2.45,
	2.44,
	2.44,
	2.44,
	2.44,
	2.44,
	2.43,
	2.43,
	2.43,
	2.43,
	2.43,
	2.42,
	2.42,
	2.42,
	2.42,
	2.42,
	2.41,
	2.41,
	2.41,
	2.41,
	2.41,
	2.4,
	2.4,
	2.4,
	2.4,
	2.4,
	2.39,
	2.39,
	2.39,
	2.39,
	2.39,
	2.38,
	2.38,
	2.38,
	2.38,
	2.38,
	2.37,
	2.37,
	2.37,
	2.37,
	2.37,
	2.36,
	2.36,
	2.36,
	2.36,
	2.36,
	2.35,
	2.35,
	2.35,
	2.35,
	2.35,
	2.34,
	2.34,
	2.34,
	2.34,
	2.34,
	2.33,
	2.33,
	2.33,
	2.33,
	2.33,
	2.32,
	2.32,
	2.32,
	2.32,
	2.32,
	2.31,
	2.31,
	2.31,
	2.31,
	2.31,
	2.3,
	2.3,
	2.3,
	2.3,
	2.3,
	2.29,
	2.29,
	2.29,
	2.29,
	2.29,
	2.28,
	2.28,
	2.28,
	2.28,
	2.28,
	2.27,
	2.27,
	2.27,
	2.27,
	2.27,
	2.26,
	2.26,
	2.26,
	2.26,
	2.26,
	2.25,
	2.25,
	2.25,
	2.25,
	2.25,
	2.24,
	2.24,
	2.24,
	2.24,
	2.24,
	2.23,
	2.23,
	2.23,
	2.23,
	2.23,
	2.22,
	2.22,
	2.22,
	2.22,
	2.22,
	2.21,
	2.21,
	2.21,
	2.21,
	2.21,
	2.2,
	2.2,
	2.2,
	2.2,
	2.2,
	2.19,
	2.19,
	2.19,
	2.19,
	2.19,
	2.18,
	2.18,
	2.18,
	2.18,
	2.18,
	2.17,
	2.17,
	2.17,
	2.17,
	2.17,
	2.16,
	2.16,
	2.16,
	2.16,
	2.16,
	2.15,
	2.15,
	2.15,
	2.15,
	2.15,
	2.14,
	2.14,
	2.14,
	2.14,
	2.14,
	2.13,
	2.13,
	2.13,
	2.13,
	2.13,
	2.12,
	2.12,
	2.12,
	2.12,
	2.12,
	2.11,
	2.11,
	2.11,
	2.11,
	2.11,
	2.1,
	2.1,
	2.1,
	2.1,
	2.1,
	2.09,
	2.09,
	2.09,
	2.09,
	2.09,
	2.08,
	2.08,
	2.08,
	2.08,
	2.08,
	2.07,
	2.07,
	2.07,
	2.07,
	2.07,
	2.06,
	2.06,
	2.06,
	2.06,
	2.06,
	2.05,
	2.05,
	2.05,
	2.05,
	2.05,
	2.04,
	2.04,
	2.04,
	2.04,
	2.04,
	2.03,
	2.03,
	2.03,
	2.03,
	2.03,
	2.02,
	2.02,
	2.02,
	2.02,
	2.02,
	2.01,
	2.01,
	2.01,
	2.01,
	2.01,
	2,
	2,
	2,
	2,
	2,
	1.99,
	1.99,
	1.99,
	1.99,
	1.99,
	1.98,
	1.98,
	1.98,
	1.98,
	1.98,
	1.97,
	1.97,
	1.97,
	1.97,
	1.97,
	1.96,
	1.96,
	1.96,
	1.96,
	1.96,
	1.95,
	1.95,
	1.95,
	1.95,
	1.95,
	1.94,
	1.94,
	1.94,
	1.94,
	1.94,
	1.93,
	1.93,
	1.93,
	1.93,
	1.93,
	1.92,
	1.92,
	1.92,
	1.92,
	1.92,
	1.91,
	1.91,
	1.91,
	1.91,
	1.91,
	1.9,
	1.9,
	1.9,
	1.9,
	1.9,
	1.89,
	1.89,
	1.89,
	1.89,
	1.89,
	1.88,
	1.88,
	1.88,
	1.88,
	1.88,
	1.87,
	1.87,
	1.87,
	1.87,
	1.87,
	1.86,
	1.86,
	1.86,
	1.86,
	1.86,
	1.85,
	1.85,
	1.85,
	1.85,
	1.85,
	1.84,
	1.84,
	1.84,
	1.84,
	1.84,
	1.83,
	1.83,
	1.83,
	1.83,
	1.83,
	1.82,
	1.82,
	1.82,
	1.82,
	1.82,
	1.81,
	1.81,
	1.81,
	1.81,
	1.81,
	1.8,
	1.8,
	1.8,
	1.8,
	1.8,
	1.79,
	1.79,
	1.79,
	1.79,
	1.79,
	1.78,
	1.78,
	1.78,
	1.78,
	1.78,
	1.77,
	1.77,
	1.77,
	1.77,
	1.77,
	1.76,
	1.76,
	1.76,
	1.76,
	1.76,
	1.75,
	1.75,
	1.75,
	1.75,
	1.75,
	1.74,
	1.74,
	1.74,
	1.74,
	1.74,
	1.73,
	1.73,
	1.73,
	1.73,
	1.73,
	1.72,
	1.72,
	1.72,
	1.72,
	1.72,
	1.71,
	1.71,
	1.71,
	1.71,
	1.71,
	1.7,
	1.7,
	1.7,
	1.7,
	1.7,
	1.69,
	1.69,
	1.69,
	1.69,
	1.69,
	1.68,
	1.68,
	1.68,
	1.68,
	1.68,
	1.67,
	1.67,
	1.67,
	1.67,
	1.67,
	1.66,
	1.66,
	1.66,
	1.66,
	1.66,
	1.65,
	1.65,
	1.65,
	1.65,
	1.65,
	1.64,
	1.64,
	1.64,
	1.64,
	1.64,
	1.63,
	1.63,
	1.63,
	1.63,
	1.63,
	1.62,
	1.62,
	1.62,
	1.62,
	1.62,
	1.61,
	1.61,
	1.61,
	1.61,
	1.61,
	1.6,
	1.6,
	1.6,
	1.6,
	1.6,
	1.59,
	1.59,
	1.59,
	1.59,
	1.59,
	1.58,
	1.58,
	1.58,
	1.58,
	1.58,
	1.57,
	1.57,
	1.57,
	1.57,
	1.57,
	1.56,
	1.56,
	1.56,
	1.56,
	1.56,
	1.55,
	1.55,
	1.55,
	1.55,
	1.55,
	1.54,
	1.54,
	1.54,
	1.54,
	1.54,
	1.53,
	1.53,
	1.53,
	1.53,
	1.53,
	1.52,
	1.52,
	1.52,
	1.52,
	1.52,
	1.51,
	1.51,
	1.51,
	1.51,
	1.51,
	1.5,
	1.5,
	1.5,
	1.5,
	1.5,
	1.49,
	1.49,
	1.49,
	1.49,
	1.49,
	1.48,
	1.48,
	1.48,
	1.48,
	1.48,
	1.47,
	1.47,
	1.47,
	1.47,
	1.47,
	1.46,
	1.46,
	1.46,
	1.46,
	1.46,
	1.45,
	1.45,
	1.45,
	1.45,
	1.45,
	1.44,
	1.44,
	1.44,
	1.44,
	1.44,
	1.43,
	1.43,
	1.43,
	1.43,
	1.43,
	1.42,
	1.42,
	1.42,
	1.42,
	1.42,
	1.41,
	1.41,
	1.41,
	1.41,
	1.41,
	1.4,
	1.4,
	1.4,
	1.4,
	1.4,
	1.39,
	1.39,
	1.39,
	1.39,
	1.39,
	1.38,
	1.38,
	1.38,
	1.38,
	1.38,
	1.37,
	1.37,
	1.37,
	1.37,
	1.37,
	1.36,
	1.36,
	1.36,
	1.36,
	1.36,
	1.35,
	1.35,
	1.35,
	1.35,
	1.35,
	1.34,
	1.34,
	1.34,
	1.34,
	1.34,
	1.33,
	1.33,
	1.33,
	1.33,
	1.33,
	1.32,
	1.32,
	1.32,
	1.32,
	1.32,
	1.31,
	1.31,
	1.31,
	1.31,
	1.31,
	1.3,
	1.3,
	1.3,
	1.3,
	1.3,
	1.29,
	1.29,
	1.29,
	1.29,
	1.29,
	1.28,
	1.28,
	1.28,
	1.28,
	1.28,
	1.27,
	1.27,
	1.27,
	1.27,
	1.27,
	1.26,
	1.26,
	1.26,
	1.26,
	1.26,
	1.25,
	1.25,
	1.25,
	1.25,
	1.25,
	1.24,
	1.24,
	1.24,
	1.24,
	1.24,
	1.23,
	1.23,
	1.23,
	1.23,
	1.23,
	1.22,
	1.22,
	1.22,
	1.22,
	1.22,
	1.21,
	1.21,
	1.21,
	1.21,
	1.21,
	1.2,
	1.2,
	1.2,
	1.2,
	1.2,
	1.19,
	1.19,
	1.19,
	1.19,
	1.19,
	1.18,
	1.18,
	1.18,
	1.18,
	1.18,
	1.17,
	1.17,
	1.17,
	1.17,
	1.17,
	1.16,
	1.16,
	1.16,
	1.16,
	1.16,
	1.15,
	1.15,
	1.15,
	1.15,
	1.15,
	1.14,
	1.14,
	1.14,
	1.14,
	1.14,
	1.13,
	1.13,
	1.13,
	1.13,
	1.13,
	1.12,
	1.12,
	1.12,
	1.12,
	1.12,
	1.11,
	1.11,
	1.11,
	1.11,
	1.11,
	1.1,
	1.1,
	1.1,
	1.1,
	1.1,
	1.09,
	1.09,
	1.09,
	1.09,
	1.09,
	1.08,
	1.08,
	1.08,
	1.08,
	1.08,
	1.07,
	1.07,
	1.07,
	1.07,
	1.07,
	1.06,
	1.06,
	1.06,
	1.06,
	1.06,
	1.05,
	1.05,
	1.05,
	1.05,
	1.05,
	1.04,
	1.04,
	1.04,
	1.04,
	1.04,
	1.03,
	1.03,
	1.03,
	1.03,
	1.03,
	1.02,
	1.02,
	1.02,
	1.02,
	1.02,
	1.01,
	1.01,
	1.01,
	1.01,
	1.01,
	1,
	1,
];

export class BoostOptimizerStore {
	constructor(private store: RootStore) {
		this.store = store;
	}

	get nativeHoldings(): BigNumber | undefined {
		if (!this.store.user.accountDetails || !this.store.prices.exchangeRates) return;

		let holdings = new BigNumber(0);
		const userAccountDetails = this.store.user.accountDetails.multipliers;
		const settTokens = Object.keys(userAccountDetails);

		for (const settToken of settTokens) {
			const settPrice = this.store.prices.getPrice(settToken);
			const settBalance = this.store.user.settBalances[settToken]?.balance;

			if (settPrice && settBalance) {
				holdings = holdings.plus(settBalance.multipliedBy(settPrice));
			}
		}

		// return holdings.multipliedBy(this.store.prices.exchangeRates.usd);
		return new BigNumber(1000);
	}

	get nonNativeHoldings(): BigNumber | undefined {
		const { exchangeRates } = this.store.prices;
		const badgerBalance = this.store.user.tokenBalances[deploy.tokens.badger];
		const diggBalance = this.store.user.tokenBalances[deploy.tokens.digg];

		if (!badgerBalance || !diggBalance || !exchangeRates) return;

		// const badgerPrice = this.store.prices.getPrice(deploy.tokens.badger);
		// const badgerHoldings = badgerBalance.balance.multipliedBy(badgerPrice);
		// const diggPrice = this.store.prices.getPrice(deploy.tokens.digg);
		// const diggBalanceHoldings = diggBalance.balance.multipliedBy(diggPrice);

		// return badgerHoldings.plus(diggBalanceHoldings).multipliedBy(exchangeRates.usd);
		return new BigNumber(5000);
	}

	calculateLeaderBoardSlot(boost: number): number {
		for (let index = 0; index < leaderboard.length; index++) {
			if (boost > leaderboard[index]) {
				return index;
			}
		}

		return leaderboard.length - 1;
	}

	calculateBoostRatio(native: string, nonNative: string): number {
		const boostRatio = new BigNumber(native).dividedBy(nonNative);

		// handle 0/0 and x/0 division
		if (boostRatio.isNaN() || !boostRatio.isFinite()) {
			return 1;
		}

		const leaderboardSlot = this.calculateLeaderBoardSlot(boostRatio.toNumber());
		const leaderboardRankLerp = 1 - leaderboardSlot / leaderboard.length;
		return Math.min(lerp(1, 3, leaderboardRankLerp), 3);
	}

	calculateNativeToMatchBoost(desiredBoost: number): BigNumber | undefined {
		if (!this.nonNativeHoldings) return;

		if (this.nonNativeHoldings.eq(0)) {
			return new BigNumber(0);
		}

		let positionToOvertake = leaderboard.length - 1;
		const invertedLeaderBoard = leaderboard.sort((a, b) => a - b);

		for (let index = 0; index < invertedLeaderBoard.length; index++) {
			if (invertedLeaderBoard[index] >= desiredBoost) {
				positionToOvertake = index;
				break;
			}
		}

		const amountToGetToPosition = invertedLeaderBoard[positionToOvertake] - desiredBoost;
		return this.nonNativeHoldings.multipliedBy(amountToGetToPosition);
	}
}
