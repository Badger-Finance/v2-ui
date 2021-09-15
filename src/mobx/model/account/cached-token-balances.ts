import { TokenBalances } from './user-balances';
import { VaultCaps } from '../vaults/vault-cap copy';

export interface CachedTokenBalances {
	key: string;
	tokens: TokenBalances;
	setts: TokenBalances;
	geysers: TokenBalances;
	vaultCaps: VaultCaps;
	expiry: number;
}