import { Contract } from './contract';

export interface BadgerToken extends Contract {
	decimals: number;
	name?: string;
	symbol?: string;
}

export const mockToken = (contract: string): BadgerToken => ({
	address: contract,
	decimals: 18,
});
