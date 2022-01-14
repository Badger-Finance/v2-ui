import { NETWORK_IDS } from 'config/constants';
import { toVaultConfig } from 'web3/config/config-utils';
import { Deploy } from 'web3/interface/deploy';
import { BadgerVault } from '../vaults/badger-vault';
import { Network as NetworkModel } from './network';
import deploy from '../../../config/deployments/mainnet.json';
import { toRecord } from 'web3/config/token-config';
import { ProtocolTokens } from 'web3/interface/protocol-token';
import { FLAGS } from 'config/environment';
import { Currency } from 'config/enums/currency.enum';
import { AdvisoryType } from '../vaults/advisory-type';
import { Network } from '@badger-dao/sdk';

export class Ethereum extends NetworkModel {
	constructor() {
		super(
			'https://etherscan.io',
			'https://www.gasnow.org/',
			'Ethereum',
			Network.Ethereum,
			NETWORK_IDS.ETH,
			Currency.ETH,
			ETH_DEPLOY,
			ethVaultDefinitions,
		);
	}
	get settOrder(): string[] {
		return [
			this.deploy.sett_system.vaults['native.ibbtcCrv'],
			this.deploy.sett_system.vaults['native.bveCVXCVX'],
			this.deploy.sett_system.vaults['native.icvx'],
			this.deploy.sett_system.vaults['native.mim-3crv'],
			this.deploy.sett_system.vaults['native.frax-3crv'],
			this.deploy.sett_system.vaults['native.digg'],
			this.deploy.sett_system.vaults['native.sushiibBTCwBTC'],
			this.deploy.sett_system.vaults['native.sushiBadgerWbtc'],
			this.deploy.sett_system.vaults['native.sushiDiggWbtc'],
			this.deploy.sett_system.vaults['native.imBtc'],
			this.deploy.sett_system.vaults['native.fPmBtcHBtc'],
			this.deploy.sett_system.vaults['native.cvxCrv'],
			this.deploy.sett_system.vaults['native.tricryptoCrv2'],
			this.deploy.sett_system.vaults['native.sbtcCrv'],
			this.deploy.sett_system.vaults['native.renCrv'],
			this.deploy.sett_system.vaults['native.tbtcCrv'],
			this.deploy.sett_system.vaults['native.hbtcCrv'],
			this.deploy.sett_system.vaults['native.pbtcCrv'],
			this.deploy.sett_system.vaults['native.obtcCrv'],
			this.deploy.sett_system.vaults['native.bbtcCrv'],
			this.deploy.sett_system.vaults['native.cvx'],
			this.deploy.sett_system.vaults['yearn.wBtc'],
			this.deploy.sett_system.vaults['native.sushiWbtcEth'],
			this.deploy.sett_system.vaults['native.uniBadgerWbtc'],
			this.deploy.sett_system.vaults['native.badger'],
			this.deploy.sett_system.vaults['harvest.renCrv'],
			this.deploy.sett_system.vaults['native.uniDiggWbtc'],
			this.deploy.sett_system.vaults['native.tricryptoCrv'],
			...(FLAGS.STABILIZATION_SETTS ? [this.deploy.sett_system.vaults['experimental.digg']] : []),
			...(FLAGS.RENBTC_SETT ? [this.deploy.sett_system.vaults['native.renBtc']] : []),
		];
	}
}

export const ETH_DEPLOY = deploy as Deploy;

const ethVaultDefinitions: BadgerVault[] = [
	{
		depositToken: {
			address: ETH_DEPLOY.tokens['curve.mim-3crv'],
			decimals: 18,
		},
		vaultToken: {
			address: ETH_DEPLOY.sett_system.vaults['native.mim-3crv'],
			decimals: 18,
		},
	},
	{
		depositToken: {
			address: ETH_DEPLOY.tokens['curve.frax-3crv'],
			decimals: 18,
		},
		vaultToken: {
			address: ETH_DEPLOY.sett_system.vaults['native.frax-3crv'],
			decimals: 18,
		},
	},
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
			name: 'bcrvrenBTC',
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
			address: ETH_DEPLOY.tokens['curve.tricrypto2'],
			decimals: 18,
		},
		vaultToken: {
			address: ETH_DEPLOY.sett_system.vaults['native.tricryptoCrv2'],
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
			address: ETH_DEPLOY.tokens['cvx'],
			decimals: 18,
		},
		vaultToken: {
			address: ETH_DEPLOY.sett_system.vaults['native.icvx'],
			decimals: 18,
		},
		vaultAdvisory: AdvisoryType.ConvexLock,
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
	{
		depositToken: {
			address: ETH_DEPLOY.tokens['renBTC'],
			decimals: 8,
		},
		vaultToken: {
			address: ETH_DEPLOY.sett_system.vaults['native.renBtc'],
			decimals: 18,
		},
	},
	{
		depositToken: {
			address: ETH_DEPLOY.tokens['imBtc'],
			decimals: 18,
		},
		vaultToken: {
			address: ETH_DEPLOY.sett_system.vaults['native.imBtc'],
			decimals: 18,
		},
	},
	{
		depositToken: {
			address: ETH_DEPLOY.tokens['fPmBtcHBtc'],
			decimals: 18,
		},
		vaultToken: {
			address: ETH_DEPLOY.sett_system.vaults['native.fPmBtcHBtc'],
			decimals: 18,
		},
	},
	{
		depositToken: {
			address: ETH_DEPLOY.tokens['bveCVXCVX'],
			decimals: 18,
		},
		vaultToken: {
			address: ETH_DEPLOY.sett_system.vaults['native.bveCVXCVX'],
			decimals: 18,
		},
	},
	{
		depositToken: {
			address: ETH_DEPLOY.tokens['curve.ibBTC'],
			decimals: 18,
		},
		vaultToken: {
			address: ETH_DEPLOY.sett_system.vaults['native.ibbtcCrv'],
			decimals: 18,
		},
	},
];

export const ethVaults = toVaultConfig(ethVaultDefinitions);

export const ethRewards = [
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
	{
		address: ETH_DEPLOY.tokens['DROPT-3'],
		decimals: 18,
	},
	{ name: 'ibBTC', decimals: 18, address: '0xc4E15973E6fF2A35cC804c2CF9D2a1b817a8b40F', symbol: 'ibBTC' },
	{
		name: 'sBTC',
		address: ETH_DEPLOY.tokens['sBTC'],
		decimals: 18,
		symbol: 'sBTC',
	},
];

const ethTokens = ethVaults.flatMap((vault) => [vault.depositToken, vault.vaultToken]).concat(ethRewards);

export const ethProtocolTokens: ProtocolTokens = toRecord(ethTokens, 'address');
