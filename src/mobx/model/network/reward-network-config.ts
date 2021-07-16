import { AbiItem } from 'web3-utils';

export type RewardNetworkConfig = {
	endpoint: string;
	network: number;
	contract: string;
	abi: AbiItem[];
	tokens: string[];
};
