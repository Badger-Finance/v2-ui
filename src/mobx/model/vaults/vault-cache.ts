import { VaultMap } from './vault-map';

export interface VaultCache {
	[chain: string]: VaultMap | undefined | null;
}
