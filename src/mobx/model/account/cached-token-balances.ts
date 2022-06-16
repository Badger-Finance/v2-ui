import { VaultCaps } from '../vaults/vault-cap copy';
import { TokenBalances } from './user-balances';

export interface CachedTokenBalances {
	key: string;
	tokens: TokenBalances;
	setts: TokenBalances;
	vaultCaps: VaultCaps;
	expiry: number;
}
