import { NETWORK_IDS } from 'config/constants';
import { toRecord } from 'web3/config/token-config';
import { Deploy } from 'web3/interface/deploy';
import { ProtocolTokens } from 'web3/interface/protocol-token';
import { BadgerVault } from '../vaults/badger-vault';
import { Network as NetworkModel } from './network';
import deploy from '../../../config/deployments/arbitrum.json';
import { Currency } from 'config/enums/currency.enum';
import { Network } from '@badger-dao/sdk';

// TODO: Add Arbitrum gas estimation + link
export class Arbitrum extends NetworkModel {
	constructor() {
		super(
			'https://arbiscan.io/',
			'https://portal.arbitrum.one/',
			'Arbitrum',
			Network.Arbitrum,
			NETWORK_IDS.ARB,
			Currency.ETH,
			ARBITRUM_DEPLOY,
			arbitrumVaults,
		);
	}

	get settOrder(): string[] {
		return [
			this.deploy.sett_system.vaults['native.tricrypto'],
			this.deploy.sett_system.vaults['native.crvWbtcRen'],
			this.deploy.sett_system.vaults['native.swaprWethIbbtc'],
			this.deploy.sett_system.vaults['native.swaprWethBadger'],
			this.deploy.sett_system.vaults['native.swaprWethWbtc'],
			this.deploy.sett_system.vaults['native.swaprWethSwapr'],
			this.deploy.sett_system.vaults['native.sushiWethWbtc'],
			this.deploy.sett_system.vaults['native.sushiWethSushi'],
		];
	}
}

export const ARBITRUM_DEPLOY: Deploy = deploy;

export const arbitrumVaults: BadgerVault[] = [
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
	{
		depositToken: {
			address: ARBITRUM_DEPLOY.tokens['crv.tricrypto'],
			decimals: 18,
		},
		vaultToken: {
			address: ARBITRUM_DEPLOY.sett_system.vaults['native.tricryptoLight'],
			decimals: 18,
		},
	},
	{
		depositToken: {
			address: ARBITRUM_DEPLOY.tokens['swapr.WETH-SWAPR'],
			decimals: 18,
		},
		vaultToken: {
			address: ARBITRUM_DEPLOY.sett_system.vaults['native.swaprWethSwapr'],
			decimals: 18,
		},
	},
	{
		depositToken: {
			address: ARBITRUM_DEPLOY.tokens['swapr.WETH-WBTC'],
			decimals: 18,
		},
		vaultToken: {
			address: ARBITRUM_DEPLOY.sett_system.vaults['native.swaprWethWbtc'],
			decimals: 18,
		},
	},
	{
		depositToken: {
			address: ARBITRUM_DEPLOY.tokens['swapr.WETH-BADGER'],
			decimals: 18,
		},
		vaultToken: {
			address: ARBITRUM_DEPLOY.sett_system.vaults['native.swaprWethBadger'],
			decimals: 18,
		},
	},
	{
		depositToken: {
			address: ARBITRUM_DEPLOY.tokens['swapr.WETH-IBBTC'],
			decimals: 18,
		},
		vaultToken: {
			address: ARBITRUM_DEPLOY.sett_system.vaults['native.swaprWethIbbtc'],
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

const arbitrumTokens = arbitrumVaults
	.flatMap((vault) => [vault.depositToken, vault.vaultToken])
	.concat(arbitrumRewards);

export const arbitrumProtocolTokens: ProtocolTokens = toRecord(arbitrumTokens, 'address');
