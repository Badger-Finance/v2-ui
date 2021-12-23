import { TokenBalance } from '../tokens/token-balance';

export interface TokenBalances {
	[contract: string]: TokenBalance;
}

export interface BalancesRequestAddresses {
	tokenAddresses: string[];
	generalVaultAddresses: string[];
	guardedVaultAddresses: string[];
	deprecatedVaultAddresses: string[];
	userAddress: string;
}

export interface ExtractedBalances {
	tokenBalances: TokenBalances;
	settBalances: TokenBalances;
}

export interface GuestListInformation {
	guestLists: string[];
	guestListLookup: Record<string, string>;
}
