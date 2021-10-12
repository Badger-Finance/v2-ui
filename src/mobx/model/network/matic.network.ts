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
import { getGasPrices } from 'mobx/utils/apiV2';

export class Polygon extends Network {
	constructor() {
		super(
			'https://polygonscan.com/',
			'https://polygonscan.com/gastracker',
			'Polygon',
			ChainNetwork.Matic,
			NETWORK_IDS.MATIC,
			Currency.MATIC,
			MATIC_DEPLOY,
			maticSetts,
			'Rewards have been temporarily disabled for maintenance. All funds are secure.',
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

	async updateGasPrices(): Promise<GasPrices | null> {
		const gasPrices = await getGasPrices(ChainNetwork.Matic);
		return gasPrices;
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
	{
		address: MATIC_DEPLOY.tokens['BADGER'],
		decimals: 18,
	},
	{
		address: MATIC_DEPLOY.tokens['SUSHI'],
		decimals: 18,
	},
];

const maticTokens = maticSetts.flatMap((sett) => [sett.depositToken, sett.vaultToken]).concat(maticRewards);

export const maticProtocolTokens: ProtocolTokens = toRecord(maticTokens, 'address');
