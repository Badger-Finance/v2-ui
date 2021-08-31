import { NETWORK_IDS } from 'config/constants';
import { toRecord } from 'web3/config/token-config';
import { Deploy } from 'web3/interface/deploy';
import { ProtocolTokens } from 'web3/interface/protocol-token';
import { GasPrices } from '../system-config/gas-prices';
import { BadgerSett } from '../vaults/badger-sett';
import { Network } from './network';
import deploy from '../../../config/deployments/matic.json';
import { ChainNetwork } from 'config/enums/chain-network.enum';
import { Currency } from 'config/enums/currency.enum';

export class Polygon extends Network {
	constructor() {
		super(
			'https://polygonscan.com/',
			'Polygon',
			ChainNetwork.Matic,
			NETWORK_IDS.MATIC,
			Currency.MATIC,
			MATIC_DEPLOY,
			maticSetts,
		);
	}
	get settOrder(): string[] {
		return [
			this.deploy.sett_system.vaults['BSLP-IBBTC-WBTC'],
			this.deploy.sett_system.vaults['BQLP-WBTC-USDC'],
			this.deploy.sett_system.vaults['BATRICRYPTO'],
			this.deploy.sett_system.vaults['BCRV-WBTC-RENBTC'],
		];
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
			address: MATIC_DEPLOY.tokens['QLP-WBTC-USDC'],
			decimals: 18,
		},
		vaultToken: {
			address: MATIC_DEPLOY.sett_system.vaults['BQLP-WBTC-USDC'],
			decimals: 18,
		},
	},
	{
		depositToken: {
			address: MATIC_DEPLOY.tokens['ATRICRYPTO'],
			decimals: 18,
		},
		vaultToken: {
			address: MATIC_DEPLOY.sett_system.vaults['BATRICRYPTO'],
			decimals: 18,
		},
	},
	{
		depositToken: {
			address: MATIC_DEPLOY.tokens['CRV-WBTC-RENBTC'],
			decimals: 18,
		},
		vaultToken: {
			address: MATIC_DEPLOY.sett_system.vaults['BCRV-WBTC-RENBTC'],
			decimals: 18,
		},
	},
];

export const maticRewards = [
	{
		address: MATIC_DEPLOY.tokens['CRV'],
		decimals: 18,
	},
];

const maticTokens = maticSetts.flatMap((sett) => [sett.depositToken, sett.vaultToken]).concat(maticRewards);

export const maticProtocolTokens: ProtocolTokens = toRecord(maticTokens, 'address');
