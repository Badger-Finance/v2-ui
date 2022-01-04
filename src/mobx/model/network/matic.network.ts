import { NETWORK_IDS } from 'config/constants';
import { toRecord } from 'web3/config/token-config';
import { Deploy } from 'web3/interface/deploy';
import { ProtocolTokens } from 'web3/interface/protocol-token';
import { BadgerVault } from '../vaults/badger-vault';
import { Network as NetworkModel } from './network';
import deploy from '../../../config/deployments/matic.json';
import { Currency } from 'config/enums/currency.enum';
import { Network } from '@badger-dao/sdk';

export class Polygon extends NetworkModel {
	constructor() {
		super(
			'https://polygonscan.com/',
			'https://polygonscan.com/gastracker',
			'Polygon',
			Network.Polygon,
			NETWORK_IDS.MATIC,
			Currency.MATIC,
			MATIC_DEPLOY,
			maticVaults,
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
}

export const MATIC_DEPLOY: Deploy = deploy;

export const maticVaults: BadgerVault[] = [
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

const maticTokens = maticVaults.flatMap((vault) => [vault.depositToken, vault.vaultToken]).concat(maticRewards);

export const maticProtocolTokens: ProtocolTokens = toRecord(maticTokens, 'address');
