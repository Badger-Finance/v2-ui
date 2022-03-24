import { TokenBalance } from '../tokens/token-balance';

export interface ClaimMap {
	[address: string]: TokenBalance;
}
