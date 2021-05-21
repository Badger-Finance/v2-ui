import { TokenBalance } from './token-balance';

export interface UserBalances {
	[contract: string]: TokenBalance;
}
