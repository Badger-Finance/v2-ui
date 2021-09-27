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
import { getGasPrices } from 'mobx/utils/apiV2';

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
			// TODO: Enable API based notifications - current stop gap implementation
			'Abitrum infrastructure is currently experiencing outages. TVL and Badger Boost displays are effected.',
			'https://docs.badger.com/badger-finance/arbitrum/faqs',
		);
	}

	async updateGasPrices(): Promise<GasPrices | null> {
		const gasPrices = await getGasPrices(ChainNetwork.Arbitrum);
		return gasPrices;
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
	{
		depositToken: {
			address: ARBITRUM_DEPLOY.tokens['crv.wbtcRen'],
			decimals: 18,
		},
		vaultToken: {
			address: ARBITRUM_DEPLOY.sett_system.vaults['native.crvWbtcRen'],
			decimals: 18,
		},
	},
	{
		depositToken: {
			address: ARBITRUM_DEPLOY.tokens['crv.tricrypto'],
			decimals: 18,
		},
		vaultToken: {
			address: ARBITRUM_DEPLOY.sett_system.vaults['native.tricrypto'],
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
	{
		address: ARBITRUM_DEPLOY.sett_system.vaults['native.sushiWethSushi'],
		decimals: 18,
	},
	{
		address: ARBITRUM_DEPLOY.tokens['crv'],
		decimals: 18,
	},
];

const arbitrumTokens = arbitrumSetts.flatMap((sett) => [sett.depositToken, sett.vaultToken]).concat(arbitrumRewards);

export const arbitrumProtocolTokens: ProtocolTokens = toRecord(arbitrumTokens, 'address');
