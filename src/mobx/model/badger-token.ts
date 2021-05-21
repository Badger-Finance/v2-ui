import { Contract } from './contract';

export interface BadgerToken extends Contract {
	decimals: number;
	name?: string;
	symbol?: string;
}

export const mockToken = (contract: string, decimals?: number): BadgerToken => ({
	address: contract,
	decimals: decimals || 18,
});
