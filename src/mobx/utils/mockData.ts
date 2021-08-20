import { SettState } from '../model/setts/sett-state';
import { Sett } from '../model/setts/sett';

export const testYearnVaultApiResponse: Sett = {
	name: 'Test Yearn Vault',
	asset: 'TEST',
	vaultToken: '0x50b20a12Acb15a413FE76FB82f9E524D3b0E8a69',
	underlyingToken: '0xEd2a8Ab49DcbCb8C27650cC8D5229Cefcad52e2a',
	ppfs: 1,
	experimental: true,
	value: 150538.70217373536,
	apr: 20,
	boostable: false,
	hasBouncer: true,
	balance: 100,
	tokens: [
		{
			name: 'Yearn Finance Test Token',
			address: '0xEd2a8Ab49DcbCb8C27650cC8D5229Cefcad52e2a',
			symbol: 'TEST',
			decimals: 18,
			balance: 1.2517765860627381,
			value: 74096.41145881165,
		},
	],
	sources: [
		{
			name: 'Yearn Test Fees',
			apy: 30.317345943834848,
			apr: 30.317345943834848,
			performance: {
				oneDay: 23.073893311001424,
				threeDay: 30.317345943834848,
				sevenDay: 34.36788052934882,
				thirtyDay: 58.477799920203815,
			},
			boostable: false,
			harvestable: false,
			minApr: 30.317345943834848,
			maxApr: 30.317345943834848,
		},
	],
	state: SettState.Open,
};
