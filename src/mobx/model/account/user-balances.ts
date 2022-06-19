import { TokenBalance } from '../tokens/token-balance';

export interface TokenBalances {
	[contract: string]: TokenBalance;
}
