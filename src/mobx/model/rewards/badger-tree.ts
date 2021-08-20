import BigNumber from 'bignumber.js';
import { RewardMerkleClaim } from './reward-merkle-claim';
import { TokenBalance } from '../tokens/token-balance';

export interface BadgerTree {
	cycle: string;
	timeSinceLastCycle: string;
	sharesPerFragment: BigNumber | undefined;
	proof: RewardMerkleClaim | undefined;
	claims: TokenBalance[];
	amounts: TokenBalance[];
	claimableAmounts: string[];
}
