import { BadgerVault } from './badger-vault';

export interface VaultsDefinitionCache {
	[chain: string]: Record<string, BadgerVault> | undefined | null;
}
