import { BigNumber } from 'ethers';
import { TokenBalance } from 'mobx/model/tokens/token-balance';
import store from 'mobx/RootStore';
import { getToken } from 'web3/config/token-config';
import { RewardMerkleClaim } from '../model/rewards/reward-merkle-claim';
import { TreeClaimData } from '../model/rewards/tree-claim-data';

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
		const claimed = BigNumber.from(amounts[i]);
		const earned = BigNumber.from(proof.cumulativeAmounts[i]);
		const amount = earned.sub(claimed);
		let claimable;
		if (claims) {
			claimable = rewards.balanceFromProof(token, amount.toString());
		} else {
			claimable = new TokenBalance(claimToken, amount, BigNumber.from(0));
		}

		tokenClaims.push(claimable);
	}

	return tokenClaims;
};
