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
		return [
			this.deploy.sett_system.vaults['BSLP-IBBTC-WBTC'],
			this.deploy.sett_system.vaults['BQLP-WBTC-USDC'],
			this.deploy.sett_system.vaults['BATRICRYPTO'],
			this.deploy.sett_system.vaults['BCRV-WBTC-RENBTC'],
		];
	}

	async updateGasPrices(): Promise<GasPrices> {
		const prices = await fetch('https://gasstation-mainnet.matic.network/');
		const result = await prices.json();
		return {
			rapid: result['fastest'],
			fast: result['fast'],
			standard: result['standard'],
			slow: result['safeLow'],
		};
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

const maticTokens = maticSetts.flatMap((sett) => [sett.depositToken, sett.vaultToken]);

export const maticProtocolTokens: ProtocolTokens = toRecord(maticTokens, 'address');
