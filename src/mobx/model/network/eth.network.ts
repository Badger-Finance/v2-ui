import { NETWORK_IDS, NETWORK_LIST } from 'config/constants';
import { createChainBatchConfig, toSettConfig } from 'web3/config/config-utils';
import { BatchCallRequest } from 'web3/interface/batch-call-request';
import { Deploy } from 'web3/interface/deploy';
import { SettMap } from '../setts/sett-map';
import { GasPrices } from '../system-config/gas-prices';
import { BadgerSett } from '../vaults/badger-sett';
import { Network } from './network';
import deploy from '../../../config/deployments/mainnet.json';
import { toRecord } from 'web3/config/token-config';
import { ProtocolTokens } from 'web3/interface/protocol-token';
import { getApi } from 'mobx/utils/apiV2';

export class Ethereum extends Network {
	constructor() {
		super(
			'https://etherscan.io',
			'Ethereum',
			NETWORK_LIST.ETH,
			NETWORK_IDS.ETH,
			'ETH',
			ETH_DEPLOY,
			ethSettDefinitions,
		);
	}

	get settOrder(): string[] {
		return [
			this.deploy.sett_system.vaults['native.badger'],
			this.deploy.sett_system.vaults['yearn.wBtc'],
			this.deploy.sett_system.vaults['native.renCrv'],
			this.deploy.sett_system.vaults['native.sbtcCrv'],
			this.deploy.sett_system.vaults['native.tbtcCrv'],
			this.deploy.sett_system.vaults['native.digg'],
			this.deploy.sett_system.vaults['native.sushiDiggWbtc'],
			this.deploy.sett_system.vaults['native.sushiBadgerWbtc'],
			this.deploy.sett_system.vaults['native.sushiWbtcEth'],
			this.deploy.sett_system.vaults['native.uniDiggWbtc'],
			this.deploy.sett_system.vaults['native.uniBadgerWbtc'],
			this.deploy.sett_system.vaults['harvest.renCrv'],
		];
	}

	batchRequests(setts: SettMap, address: string): BatchCallRequest[] {
		const geyserAddresses = ethSetts.map((sett) => sett.geyser).filter((geyser): geyser is string => !!geyser);
		return createChainBatchConfig(geyserAddresses, address);
	}

	async updateGasPrices(): Promise<GasPrices> {
		const prices = await fetch(`${getApi()}/gas`);
		const result = await prices.json();
		return {
			rapid: result['rapid'].maxFeePerGas / 2,
			fast: result['fast'].maxFeePerGas / 2,
			standard: result['standard'].maxFeePerGas / 2,
			slow: result['slow'].maxFeePerGas / 2,
		};
	}
}

export const ETH_DEPLOY = deploy as Deploy;

const ethSettDefinitions: BadgerSett[] = [
	{
		depositToken: {
			address: ETH_DEPLOY.tokens['sushi.wBTC-DIGG'],
			decimals: 18,
		},
		vaultToken: {
			address: ETH_DEPLOY.sett_system.vaults['native.sushiDiggWbtc'],
			decimals: 18,
		},
		geyser: ETH_DEPLOY.geysers['native.sushiDiggWbtc'],
	},
	{
		depositToken: {
			address: ETH_DEPLOY.tokens['sushi.wBTC-BADGER'],
			decimals: 18,
		},
		vaultToken: {
			address: ETH_DEPLOY.sett_system.vaults['native.sushiBadgerWbtc'],
			decimals: 18,
		},
		geyser: ETH_DEPLOY.geysers['native.sushiBadgerWbtc'],
	},
	{
		depositToken: {
			address: ETH_DEPLOY.tokens['sushi.wBTC-WETH'],
			decimals: 18,
		},
		vaultToken: {
			address: ETH_DEPLOY.sett_system.vaults['native.sushiWbtcEth'],
			decimals: 18,
		},
		geyser: ETH_DEPLOY.geysers['native.sushiWbtcEth'],
	},
	{
		depositToken: {
			address: ETH_DEPLOY.tokens['uni.wBTC-BADGER'],
			decimals: 18,
		},
		vaultToken: {
			address: ETH_DEPLOY.sett_system.vaults['native.uniBadgerWbtc'],
			decimals: 18,
		},
		geyser: ETH_DEPLOY.geysers['native.uniBadgerWbtc'],
	},
	{
		depositToken: {
			address: ETH_DEPLOY.tokens['uni.wBTC-DIGG'],
			decimals: 18,
		},
		vaultToken: {
			address: ETH_DEPLOY.sett_system.vaults['native.uniDiggWbtc'],
			decimals: 18,
		},
		geyser: ETH_DEPLOY.geysers['native.uniDiggWbtc'],
	},
	{
		depositToken: {
			address: ETH_DEPLOY.tokens.badger,
			decimals: 18,
		},
		vaultToken: {
			address: ETH_DEPLOY.sett_system.vaults['native.badger'],
			decimals: 18,
		},
		geyser: ETH_DEPLOY.geysers['native.badger'],
	},
	{
		depositToken: {
			address: ETH_DEPLOY.tokens.digg,
			decimals: 9,
		},
		vaultToken: {
			address: ETH_DEPLOY.sett_system.vaults['native.digg'],
			decimals: 18,
		},
	},
	{
		depositToken: {
			address: ETH_DEPLOY.tokens.wBTC,
			decimals: 8,
		},
		vaultToken: {
			address: ETH_DEPLOY.sett_system.vaults['yearn.wBtc'],
			decimals: 8,
		},
		geyser: ETH_DEPLOY.geysers['yearn.wBtc'],
	},
	{
		depositToken: {
			address: ETH_DEPLOY.tokens['curve.renWBTC'],
			decimals: 18,
		},
		vaultToken: {
			address: ETH_DEPLOY.sett_system.vaults['native.renCrv'],
			decimals: 18,
		},
		geyser: ETH_DEPLOY.geysers['native.renCrv'],
	},
	{
		depositToken: {
			address: ETH_DEPLOY.tokens['curve.renWBTC'],
			decimals: 18,
		},
		vaultToken: {
			address: ETH_DEPLOY.sett_system.vaults['harvest.renCrv'],
			decimals: 18,
		},
		geyser: ETH_DEPLOY.geysers['harvest.renCrv'],
	},
	{
		depositToken: {
			address: ETH_DEPLOY.tokens['curve.tBTC-sBTC'],
			decimals: 18,
		},
		vaultToken: {
			address: ETH_DEPLOY.sett_system.vaults['native.tbtcCrv'],
			decimals: 18,
		},
		geyser: ETH_DEPLOY.geysers['native.tbtcCrv'],
	},
	{
		depositToken: {
			address: ETH_DEPLOY.tokens['curve.renWSBTC'],
			decimals: 18,
		},
		vaultToken: {
			address: ETH_DEPLOY.sett_system.vaults['native.sbtcCrv'],
			decimals: 18,
		},
		geyser: ETH_DEPLOY.geysers['native.sbtcCrv'],
	},
];

export const ethSetts = toSettConfig(ethSettDefinitions);

const ethRewards = [
	{
		address: ETH_DEPLOY.tokens['farm'],
		decimals: 18,
	},
	{
		address: ETH_DEPLOY.tokens['xsushi'],
		decimals: 18,
	},
	{
		address: ETH_DEPLOY.tokens['usdc'],
		decimals: 6,
	},
	{
		address: ETH_DEPLOY.tokens['defiDollar'],
		decimals: 18,
	},
];

const ethTokens = ethSetts.flatMap((sett) => [sett.depositToken, sett.vaultToken]).concat(ethRewards);

export const ethProtocolTokens: ProtocolTokens = toRecord(ethTokens, 'address');
