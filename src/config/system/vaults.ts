import { AbiItem } from 'web3-utils';

import BadgerVault from './abis/Sett.json';
import YearnWrapper from './abis/YearnWrapper.json';
import BadgerSushiVault from './abis/SushiSett.json';
import DiggVault from './abis/DiggSett.json';
import deploy from '../deployments/mainnet.json';
import bscDeploy from '../deployments/bsc.json';
import { VaultNetworkConfig } from 'mobx/model';
import { NETWORK_LIST } from '../../config/constants';

export const getVaults = (network?: string | null): VaultNetworkConfig => {
	switch (network) {
		case NETWORK_LIST.BSC:
			return {
				pancakeswap: {
					abi: BadgerVault.abi as AbiItem[],
					underlying: 'token',
					contracts: [
						bscDeploy.sett_system.vaults['native.pancakeBnbBtcb'],
						bscDeploy.sett_system.vaults['native.bBadgerBtcb'],
						bscDeploy.sett_system.vaults['native.bDiggBtcb'],
					],
					fillers: {
						symbol: ['bnbBtcb', 'bBadgerBtcb', 'bDiggBtcb'],
						isFeatured: [false, false, false],
						position: [1, 2, 3],
						isSuperSett: [false, false, false],
						withdrawAll: [true, true, true],
					},
					methods: [
						{
							name: 'balanceOf',
							args: ['{connectedAddress}'],
						},
						{
							name: 'getPricePerFullShare',
						},
						{
							name: 'balance',
						},
						{
							name: 'symbol',
						},
						{
							name: 'decimals',
						},
						{
							name: 'token',
						},
						{
							name: 'totalSupply',
						},
					],
				},
				yearn: {
					abi: YearnWrapper.abi as AbiItem[],
					underlying: 'token',
					contracts: [bscDeploy.sett_system.vaults['yearn.wBtc']],
					fillers: {
						symbol: ['TEST'],
						isFeatured: [false],
						position: [1],
						isSuperSett: [false],
						// withdrawAll = false means there is no withdrawAll() function on the contract and must be handled differently
						withdrawAll: [false],
					},
					methods: [
						{
							name: 'balanceOf',
							args: ['{connectedAddress}'],
						},
						{
							name: 'balance',
						},
						{
							name: 'symbol',
						},
						{
							name: 'decimals',
						},
						{
							name: 'token',
						},
						{
							name: 'totalSupply',
						},
					],
				},
			};
		case NETWORK_LIST.ETH:
			return {
				uniswap: {
					abi: BadgerVault.abi as AbiItem[],
					underlying: 'token',
					contracts: [
						deploy.sett_system.vaults['native.badger'],
						deploy.sett_system.vaults['native.renCrv'],
						deploy.sett_system.vaults['native.sbtcCrv'],
						deploy.sett_system.vaults['native.tbtcCrv'],
						deploy.sett_system.vaults['native.uniBadgerWbtc'],
						deploy.sett_system.vaults['harvest.renCrv'],
						deploy.sett_system.vaults['native.uniDiggWbtc'],
					],
					fillers: {
						symbol: ['badger', 'renCrv', 'sbtcCrv', 'tbtcCrv', 'uniBadgerWbtc', 'renCrv', 'uniDiggWbtc'],
						isFeatured: [false, false, false, false, true, true, true],
						position: [2, 11, 10, 9, 7, 8, 6],
						isSuperSett: [false, false, false, false, false, true, false, false, false],
					},
					methods: [
						{
							name: 'balanceOf',
							args: ['{connectedAddress}'],
						},
						{
							name: 'getPricePerFullShare',
						},
						{
							name: 'balance',
						},
						{
							name: 'symbol',
						},
						{
							name: 'decimals',
						},
						{
							name: 'token',
						},
						{
							name: 'totalSupply',
						},
					],
				},
				sushiswap: {
					abi: BadgerSushiVault.abi as AbiItem[],
					underlying: 'token',
					contracts: [
						deploy.sett_system.vaults['native.sushiWbtcEth'],
						deploy.sett_system.vaults['native.sushiBadgerWbtc'],
						deploy.sett_system.vaults['native.sushiDiggWbtc'],
						deploy.sett_system.vaults['native.sushiibBTCwBTC'],
					],
					fillers: {
						isFeatured: [false, true, true],
						position: [5, 4, 3, 6],
						symbolPrefix: ['sushi', 'sushi', 'sushi', 'sushi'],
						pairContract: [
							deploy.tokens['sushi.wBTC-WETH'],
							deploy.tokens['sushi.wBTC-BADGER'],
							deploy.tokens['sushi.wBTC-DIGG'],
							deploy.tokens['sushi.ibBTC-wBTC'],
						],
					},
					methods: [
						{
							name: 'balanceOf',
							args: ['{connectedAddress}'],
						},
						{
							name: 'getPricePerFullShare',
						},
						{
							name: 'balance',
						},
						{
							name: 'symbol',
						},
						{
							name: 'decimals',
						},
						{
							name: 'token',
						},
						{
							name: 'totalSupply',
						},
					],
					growthEndpoints: [
						'https://api.thegraph.com/subgraphs/name/sushiswap/master-chef',
						'https://apy.sushiswap.fi/xsushi',
						'https://apy.sushiswap.fi/?pairs=',
					],
				},
				digg: {
					abi: DiggVault.abi as AbiItem[],
					underlying: 'token',
					contracts: [deploy.sett_system.vaults['native.digg']],
					fillers: {
						isFeatured: [true],
						position: [1],
						symbolPrefix: [''],
					},
					methods: [
						{
							name: 'balanceOf',
							args: ['{connectedAddress}'],
						},
						{
							name: 'getPricePerFullShare',
						},
						{
							name: 'balance',
						},
						{
							name: 'symbol',
						},
						{
							name: 'decimals',
						},
						{
							name: 'totalSupply',
						},
						{
							name: 'token',
						},
					],
				},
				yearn: {
					abi: YearnWrapper.abi as AbiItem[],
					underlying: 'token',
					contracts: [deploy.sett_system.vaults['yearn.wBtc']],
					fillers: {
						symbol: ['byvWBTC'],
						isFeatured: [false],
						position: [1],
						isSuperSett: [false],
						// withdrawAll = false means there is no withdrawAll() function on the contract and must be handled differently
						withdrawAll: [false],
					},
					methods: [
						{
							name: 'balanceOf',
							args: ['{connectedAddress}'],
						},
						{
							name: 'balance',
						},
						{
							name: 'symbol',
						},
						{
							name: 'decimals',
						},
						{
							name: 'token',
						},
						{
							name: 'totalSupply',
						},
					],
				},
			};
		default:
			return {};
	}
};
