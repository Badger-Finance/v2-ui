import { createChainBatchConfig, toSettConfig } from './config-utils';
import deploy from '../../config/deployments/mainnet.json';
import { BatchCallRequest } from 'web3/interface/batch-call-request';
import { Deploy } from 'web3/interface/deploy';
import { BadgerSett } from 'mobx/model/badger-sett';
import { toRecord } from './token-config';
import { ProtocolTokens } from 'web3/interface/protocol-token';

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
	},
	{
		depositToken: {
			address: ETH_DEPLOY.tokens['sushi.ibBTC-wBTC'],
			decimals: 18,
		},
		vaultToken: {
			address: ETH_DEPLOY.sett_system.vaults['native.sushiibBTCwBTC'],
			decimals: 18,
		},
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

const ethTokens = ethSetts.flatMap((sett) => [sett.depositToken, sett.vaultToken]);
export const ethProtocolTokens: ProtocolTokens = toRecord(ethTokens, 'address');

export const getEthereumBatchRequests = (userAddress: string): BatchCallRequest[] => {
	const tokenAddresses = ethSetts.map((sett) => sett.depositToken.address);
	const settAddresses = ethSetts.map((sett) => sett.vaultToken.address);
	const geyserAddresses = ethSetts.map((sett) => sett.geyser).filter((geyser): geyser is string => !!geyser);
	return createChainBatchConfig(tokenAddresses, settAddresses, geyserAddresses, userAddress);
};
