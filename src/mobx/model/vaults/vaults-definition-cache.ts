import { BadgerVault } from './badger-vault';

export type VaultsDefinitions = Map<string, BadgerVault>;

export interface VaultsDefinitionCache {
	[chain: string]: VaultsDefinitions | undefined | null;
}
