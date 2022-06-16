import { TokenBalance } from '../tokens/token-balance';
import { RewardMerkleClaim } from './reward-merkle-claim';

export interface BadgerTree {
	cycle: string;
	lastCycle: Date;
	timeSinceLastCycle: string;
	proof: RewardMerkleClaim | undefined;
	claims: TokenBalance[];
	amounts: TokenBalance[];
	claimableAmounts: string[];
}
