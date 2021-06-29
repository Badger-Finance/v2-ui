import { TokenBalance } from './token-balance';

export interface VaultCap {
	vaultCap: TokenBalance;
	totalVaultCap: TokenBalance;
	userCap: TokenBalance;
	totalUserCap: TokenBalance;
	asset: string;
}
