import { createChainBatchConfig, toSettConfig } from './config-utils';
import deploy from '../../config/deployments/mainnet.json';
import { BatchCallRequest } from 'web3/interface/batch-call-request';
import { EthDeploy } from 'web3/interface/deploy';
import { BadgerSett } from 'mobx/model/vaults/badger-sett';
import { toRecord } from './token-config';
import { ProtocolTokens } from 'web3/interface/protocol-token';
import { SettState } from '../../mobx/model/setts/sett-state';
import { SettMap } from '../../mobx/model/setts/sett-map';
import { BadgerToken } from '../../mobx/model/tokens/badger-token';

export const ETH_DEPLOY: EthDeploy = deploy;

const ethTokenDefinitions: BadgerToken[] = [
	{
		address: ETH_DEPLOY.digg_system.DROPT['DROPT-2'].longToken,
		decimals: 18,
	},
];

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
	{
		depositToken: {
			address: ETH_DEPLOY.tokens.digg,
			decimals: 9,
			symbol: 'DIGG',
		},
		vaultToken: {
			address: ETH_DEPLOY.sett_system.vaults['experimental.digg'],
			decimals: 18,
		},
	},
	{
		depositToken: {
			address: ETH_DEPLOY.tokens['curve.hBTC'],
			decimals: 18,
		},
		vaultToken: {
			address: ETH_DEPLOY.sett_system.vaults['native.hbtcCrv'],
			decimals: 18,
		},
	},
	{
		depositToken: {
			address: ETH_DEPLOY.tokens['curve.pBTC'],
			decimals: 18,
		},
		vaultToken: {
			address: ETH_DEPLOY.sett_system.vaults['native.pbtcCrv'],
			decimals: 18,
		},
	},
	{
		depositToken: {
			address: ETH_DEPLOY.tokens['curve.oBTC'],
			decimals: 18,
		},
		vaultToken: {
			address: ETH_DEPLOY.sett_system.vaults['native.obtcCrv'],
			decimals: 18,
		},
	},
	{
		depositToken: {
			address: ETH_DEPLOY.tokens['curve.bBTC'],
			decimals: 18,
		},
		vaultToken: {
			address: ETH_DEPLOY.sett_system.vaults['native.bbtcCrv'],
			decimals: 18,
		},
	},
	{
		depositToken: {
			address: ETH_DEPLOY.tokens['curve.tricrypto'],
			decimals: 18,
		},
		vaultToken: {
			address: ETH_DEPLOY.sett_system.vaults['native.tricryptoCrv'],
			decimals: 18,
		},
	},
	{
		depositToken: {
			address: ETH_DEPLOY.tokens['cvx'],
			decimals: 18,
		},
		vaultToken: {
			address: ETH_DEPLOY.sett_system.vaults['native.cvx'],
			decimals: 18,
		},
	},
	{
		depositToken: {
			address: ETH_DEPLOY.tokens['cvxCRV'],
			decimals: 18,
		},
		vaultToken: {
			address: ETH_DEPLOY.sett_system.vaults['native.cvxCrv'],
			decimals: 18,
		},
	},
];

const ethRewards: BadgerToken[] = [
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

export const ethSetts = toSettConfig(ethSettDefinitions);

const ethTokens = ethSetts
	.flatMap((sett) => [sett.depositToken, sett.vaultToken])
	.concat(ethRewards)
	.concat(ethTokenDefinitions);

export const ethProtocolTokens: ProtocolTokens = toRecord(ethTokens, 'address');

export const getEthereumBatchRequests = (setts: SettMap, userAddress: string): BatchCallRequest[] => {
	const tokenAddresses = Object.values(setts).map((sett) => sett.underlyingToken);
	const settAddresses = Object.values(setts).map((sett) => sett.vaultToken);
	const generalSetts = settAddresses.filter((sett) => setts[sett].state === SettState.Open);
	const guardedSetts = settAddresses.filter((sett) => setts[sett].state !== SettState.Open);
	const geyserAddresses = ethSetts.map((sett) => sett.geyser).filter((geyser): geyser is string => !!geyser);
	return createChainBatchConfig(tokenAddresses, generalSetts, guardedSetts, geyserAddresses, userAddress);
};

export const getNetworkBatchRequests = (setts: SettMap, userAddress: string): BatchCallRequest[] => {
	const tokenAddresses = Object.values(setts).map((sett) => sett.underlyingToken);
	const settAddresses = Object.values(setts).map((sett) => sett.vaultToken);
	const generalSetts = settAddresses.filter((sett) => setts[sett].state === SettState.Open);
	const guardedSetts = settAddresses.filter((sett) => setts[sett].state !== SettState.Open);
	return createChainBatchConfig(tokenAddresses, generalSetts, guardedSetts, [], userAddress);
};
