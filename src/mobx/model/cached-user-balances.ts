import { UserBalances } from './user-balances';

export interface CachedUserBalances {
	key: string;
	tokens: UserBalances;
	setts: UserBalances;
	geysers: UserBalances;
	expiry: number;
}
