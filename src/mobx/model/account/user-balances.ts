import { TokenBalance } from '../tokens/token-balance';

export interface UserBalances {
	[contract: string]: TokenBalance;
}
