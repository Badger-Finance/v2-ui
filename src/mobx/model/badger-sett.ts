import { BadgerToken } from './badger-token';

export interface BadgerSett {
	depositToken: BadgerToken;
	vaultToken: BadgerToken; // rename to settToken for API response
	geyser?: string;
}
