import { NETWORK_IDS, NETWORK_LIST } from 'config/constants';
import { toRecord } from 'web3/config/token-config';
import { Deploy } from 'web3/interface/deploy';
import { ProtocolTokens } from 'web3/interface/protocol-token';
import { GasPrices } from '../system-config/gas-prices';
import { BadgerSett } from '../vaults/badger-sett';
import { Network } from './network';
import deploy from '../../../config/deployments/matic.json';

export class Polygon extends Network {
	constructor() {
		super(
			'https://polygonscan.com/',
			'Polygon',
			NETWORK_LIST.MATIC,
			NETWORK_IDS.MATIC,
			'MATIC',
			MATIC_DEPLOY,
			maticSetts,
		);
	}
	get settOrder(): string[] {
		return [this.deploy.sett_system.vaults['BSLP-IBBTC-WBTC'], this.deploy.sett_system.vaults['BQLP-BADGER-USDC']];
	}

	async updateGasPrices(): Promise<GasPrices> {
		return { rapid: 20, fast: 10, standard: 5, slow: 2 };
	}
}

export const MATIC_DEPLOY: Deploy = deploy;

export const maticSetts: BadgerSett[] = [
	{
		depositToken: {
			address: MATIC_DEPLOY.tokens['SLP-IBBTC-WBTC'],
			decimals: 18,
		},
		vaultToken: {
			address: MATIC_DEPLOY.sett_system.vaults['BSLP-IBBTC-WBTC'],
			decimals: 18,
		},
	},
	{
		depositToken: {
			address: MATIC_DEPLOY.tokens['QLP-BADGER-USDC'],
			decimals: 18,
		},
		vaultToken: {
			address: MATIC_DEPLOY.sett_system.vaults['BQLP-BADGER-USDC'],
			decimals: 18,
		},
	},
];

const maticTokens = maticSetts.flatMap((sett) => [sett.depositToken, sett.vaultToken]);

export const maticProtocolTokens: ProtocolTokens = toRecord(maticTokens, 'address');
