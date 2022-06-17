import { MerkleProof } from '@badger-dao/sdk';

import { TokenBalance } from '../tokens/token-balance';

export interface BadgerTree {
	cycle: string;
	lastCycle: Date;
	timeSinceLastCycle: string;
	proof?: MerkleProof;
	claims: TokenBalance[];
	amounts: TokenBalance[];
	claimableAmounts: string[];
}
