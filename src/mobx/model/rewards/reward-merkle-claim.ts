import { BigNumber } from "ethers";

export interface RewardMerkleClaim {
	index: string;
	cycle: string;
	boost: BigNumber;
	user: string;
	tokens: string[];
	cumulativeAmounts: string[];
	proof: string[];
	node: string;
}
