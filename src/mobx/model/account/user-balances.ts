import { TokenBalance } from '../tokens/token-balance';

export interface TokenBalances {
	[contract: string]: TokenBalance;
}

export interface BalancesRequestAddresses {
	tokenAddresses: string[];
	generalSettAddresses: string[];
	guardedSettAddresses: string[];
	deprecatedSettAddresses: string[];
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
