import { CachedUserBalances } from './cached-user-balances';

export interface UserBalanceCache {
	[key: string]: CachedUserBalances;
}
