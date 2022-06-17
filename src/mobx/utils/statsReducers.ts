import { RewardTree } from '@badger-dao/sdk';
import { BigNumber } from 'ethers/lib/ethers';
import { TokenBalance } from 'mobx/model/tokens/token-balance';
import store from 'mobx/stores/RootStore';

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

export const reduceClaims = (proof: RewardTree, claimedRewards: TreeClaimData, claims?: boolean): TokenBalance[] => {
	if (!proof.cumulativeAmounts) {
		return [];
	}
	const { rewards, vaults } = store;
	const claimableTokens = proof.cumulativeAmounts.length;
	const tokenClaims = [];

	const amounts = claimedRewards[1];
	for (let i = 0; i < claimableTokens; i++) {
		const token = proof.tokens[i];
		const claimToken = vaults.getToken(token);
		if (!claimToken) {
			continue;
		}
		const claimed = BigNumber.from(amounts[i]);
		const earned = BigNumber.from(proof.cumulativeAmounts[i]);
		const amount = earned.sub(claimed).gt(0) ? earned.sub(claimed) : BigNumber.from(0);
		let claimable;
		if (claims) {
			claimable = rewards.balanceFromProof(token, amount.toString());
		} else {
			claimable = new TokenBalance(claimToken, amount, 0);
		}

		tokenClaims.push(claimable);
	}

	return tokenClaims;
};
