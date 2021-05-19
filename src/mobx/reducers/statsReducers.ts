import BigNumber from 'bignumber.js';
import { RewardMerkleClaim, TreeClaimData, UserClaimData } from '../model';

export const reduceTimeSinceLastCycle = (time: number): string => {
	const timestamp = time * 1000;
	const timeSinceLastCycle = Math.abs(Date.now() - timestamp);
	return (
		Math.floor(timeSinceLastCycle / (60 * 60 * 1000)) +
		'h ' +
		Math.round(((timeSinceLastCycle % 86400000) % 3600000) / 60000) +
		'm'
	);
};

export const reduceClaims = (proof: RewardMerkleClaim, claimedRewards: TreeClaimData): UserClaimData[] => {
	if (!proof.cumulativeAmounts) {
		return [];
	}

	const claimableTokens = proof.cumulativeAmounts.length;
	const tokenClaims = [];

	const amounts = claimedRewards[1];
	for (let i = 0; i < claimableTokens; i++) {
		const token = proof.tokens[i];
		const claimed = amounts[i];
		const earned = new BigNumber(proof.cumulativeAmounts[i]);
		const amount = earned.minus(claimed);
		tokenClaims.push({ token, amount });
	}

	return tokenClaims;
};
