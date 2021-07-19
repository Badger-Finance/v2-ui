import { UserBalances } from './user-balances';
import { VaultCaps } from '../vaults/vault-cap copy';

export interface CachedUserBalances {
	key: string;
	tokens: UserBalances;
	setts: UserBalances;
	geysers: UserBalances;
	vaultCaps: VaultCaps;
	expiry: number;
}
