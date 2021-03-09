import { AbiItem } from 'web3-utils';

import BadgerVault from './abis/Sett.json';
import BadgerSushiVault from './abis/SushiSett.json';
import DiggVault from './abis/DiggSett.json';
import deploy from '../deployments/mainnet.json';
import bscDeploy from '../deployments/bsc.json';
import { VaultBatch } from '../../mobx/model';

import { getNetwork } from '../../mobx/utils/helpers';

const network = getNetwork();

export var vaultBatches: VaultBatch[] = [];

switch (network) {
	case 'bsc':
		vaultBatches = [
			{
				abi: BadgerVault.abi as AbiItem[],
				underlying: 'token',
				contracts: [bscDeploy.sett_system.vaults['native.pancakeBnbBtcb']],
				fillers: {
					symbol: ['badger'],
					isFeatured: [false],
					position: [1],
					isSuperSett: [false],
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
		];
		break;
	default:
		vaultBatches = [
			{
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
			{
				abi: BadgerSushiVault.abi as AbiItem[],
				underlying: 'token',
				contracts: [
					deploy.sett_system.vaults['native.sushiWbtcEth'],
					deploy.sett_system.vaults['native.sushiBadgerWbtc'],
					deploy.sett_system.vaults['native.sushiDiggWbtc'],
				],
				fillers: {
					isFeatured: [false, true],
					position: [5, 4, 3],
					symbolPrefix: ['sushi', 'sushi', 'sushi'],
					onsenId: ['103', '21', '73'],
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
			{
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
		];
		break;
}
