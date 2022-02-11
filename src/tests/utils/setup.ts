import { BadgerAPI } from '@badger-dao/sdk';

export function setupMockAPI(): void {
	jest.spyOn(BadgerAPI.prototype, 'loadPrices').mockImplementation();
	jest.spyOn(BadgerAPI.prototype, 'loadVaults').mockImplementation();
	jest.spyOn(BadgerAPI.prototype, 'loadVault').mockImplementation();
	jest.spyOn(BadgerAPI.prototype, 'loadAccount').mockImplementation();
	jest.spyOn(BadgerAPI.prototype, 'loadTokens').mockImplementation();
	jest.spyOn(BadgerAPI.prototype, 'loadProof').mockImplementation();
	jest.spyOn(BadgerAPI.prototype, 'loadGasPrices').mockImplementation();
	jest.spyOn(BadgerAPI.prototype, 'loadProtocolMetrics').mockImplementation();
	/*  eslint-disable-next-line @typescript-eslint/no-unused-vars */
	jest.spyOn(BadgerAPI.prototype, 'loadProtocolSummary').mockImplementation(async (_currency) => ({
		totalValue: 1_000_000_000,
		setts: [],
	}));
}
