import { NETWORK_IDS } from 'config/constants';
import { toRecord } from 'web3/config/token-config';
import { Deploy } from 'web3/interface/deploy';
import { ProtocolTokens } from 'web3/interface/protocol-token';
import { GasPrices } from '../system-config/gas-prices';
import { BadgerSett } from '../vaults/badger-sett';
import { Network } from './network';
import deploy from '../../../config/deployments/arbitrum.json';
import { ChainNetwork } from 'config/enums/chain-network.enum';
import { Currency } from 'config/enums/currency.enum';

// TODO: Add Arbitrum gas estimation + link
export class Arbitrum extends Network {
	constructor() {
		super(
			'https://arbiscan.io/',
			'https://portal.arbitrum.one/',
			'Arbitrum',
			ChainNetwork.Arbitrum,
			NETWORK_IDS.ARB,
			Currency.ETH,
			ARBITRUM_DEPLOY,
			arbitrumSetts,
		);
	}

	async updateGasPrices(): Promise<GasPrices> {
		const gasPrice = 2;
		return {
			rapid: gasPrice,
			fast: gasPrice,
			standard: gasPrice,
			slow: gasPrice,
		};
	}
}

export const ARBITRUM_DEPLOY: Deploy = deploy;

export const arbitrumSetts: BadgerSett[] = [
	{
		depositToken: {
			address: ARBITRUM_DEPLOY.tokens['sushi.WETH-SUSHI'],
			decimals: 18,
		},
		vaultToken: {
			address: ARBITRUM_DEPLOY.sett_system.vaults['native.sushiWethSushi'],
			decimals: 18,
		},
	},
	{
		depositToken: {
			address: ARBITRUM_DEPLOY.tokens['sushi.WETH-WBTC'],
			decimals: 18,
		},
		vaultToken: {
			address: ARBITRUM_DEPLOY.sett_system.vaults['native.sushiWethWbtc'],
			decimals: 18,
		},
	},
];

export const arbitrumRewards = [
	{
		address: ARBITRUM_DEPLOY.tokens['badger'],
		decimals: 18,
	},
	{
		address: ARBITRUM_DEPLOY.tokens['sushi'],
		decimals: 18,
	},
];

const arbitrumTokens = arbitrumSetts.flatMap((sett) => [sett.depositToken, sett.vaultToken]).concat(arbitrumRewards);

export const arbitrumProtocolTokens: ProtocolTokens = toRecord(arbitrumTokens, 'address');
