import BigNumber from 'bignumber.js';
import { TokenBalance } from 'mobx/model/token-balance';
import store from 'mobx/store';
import { getToken } from 'web3/config/token-config';
import { RewardMerkleClaim, TreeClaimData } from '../model';

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

export const reduceClaims = (
	proof: RewardMerkleClaim,
	claimedRewards: TreeClaimData,
	claims?: boolean,
): TokenBalance[] => {
	if (!proof.cumulativeAmounts) {
		return [];
	}

	const { rewards } = store;
	const claimableTokens = proof.cumulativeAmounts.length;
	const tokenClaims = [];

	const amounts = claimedRewards[1];
	for (let i = 0; i < claimableTokens; i++) {
		const token = proof.tokens[i];
		const claimToken = getToken(token);
		if (!claimToken) {
			continue;
		}
		const claimed = new BigNumber(amounts[i]);
		const earned = new BigNumber(proof.cumulativeAmounts[i]);
		const amount = earned.minus(claimed);
		let claimable;
		if (claims) {
			claimable = rewards.balanceFromProof(token, amount.toFixed());
		} else {
			claimable = new TokenBalance(claimToken, amount, new BigNumber(0));
		}

		tokenClaims.push(claimable);
	}

	return tokenClaims;
};
