import { CachedTokenBalances } from './cached-token-balances';

export interface UserBalanceCache {
  [key: string]: CachedTokenBalances;
}
