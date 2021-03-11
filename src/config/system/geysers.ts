import BadgerGeyser from './abis/BadgerGeyser.json';
import SushiGeyser from './abis/SushiGeyser.json';
import BadgerTree from './abis/BadgerTree.json';
import deploy from '../deployments/mainnet.json';
import { NETWORK_CONSTANTS, NETWORK_LIST } from '../constants';
import { GeyserNetworkConfig } from 'mobx/model';
import { AbiItem } from 'web3-utils';
import { getApi } from '../../mobx/utils/api';

export const getGeysers = (network: string | null): GeyserNetworkConfig => {
	switch (network) {
		default:
			return {
				geyserBatches: [
					{
						abi: BadgerGeyser.abi as AbiItem[],
						underlying: 'getStakingToken',

						methods: [
							{
								name: 'totalStakedFor',
								args: ['{connectedAddress}'],
							},
							{
								name: 'getUnlockSchedulesFor',
								args: [deploy.token],
							},
							{
								name: 'getUnlockSchedulesFor',
								args: [deploy.digg_system.uFragments],
							},
							{
								name: 'totalStaked',
							},
							{
								name: 'balance',
							},
							{
								name: 'getStakingToken',
							},
						],
						contracts: [
							deploy.geysers['native.badger'],
							deploy.geysers['native.renCrv'],
							deploy.geysers['native.sbtcCrv'],
							deploy.geysers['native.tbtcCrv'],
							deploy.geysers['native.uniBadgerWbtc'],
							deploy.geysers['harvest.renCrv'],
							deploy.geysers['native.uniDiggWbtc'],
						],
						fillers: {
							isFeatured: [false, false, false, false, true, true, true],
							isSuperSett: [false, false, false, false, false, true, false, false],
						},
					},
					{
						abi: SushiGeyser.abi as AbiItem[],
						underlying: 'getStakingToken',

						methods: [
							{
								name: 'totalStakedFor',
								args: ['{connectedAddress}'],
							},
							{
								name: 'getUnlockSchedulesFor',
								args: [deploy.token],
							},
							{
								name: 'getUnlockSchedulesFor',
								args: [deploy.digg_system.uFragments],
							},
							{
								name: 'totalStaked',
							},
							{
								name: 'balance',
							},
							{
								name: 'getStakingToken',
							},
						],
						contracts: [
							deploy.geysers['native.sushiDiggWbtc'].toLowerCase(),
							deploy.geysers['native.sushiWbtcEth'].toLowerCase(),
							deploy.geysers['native.sushiBadgerWbtc'].toLowerCase(),
						],
						fillers: {
							getStakingToken: [
								deploy.sett_system.vaults['native.sushiDiggWbtc'],
								deploy.sett_system.vaults['native.sushiWbtcEth'],
								deploy.sett_system.vaults['native.sushiBadgerWbtc'],
							],
							onsenId: ['103', '21', '73'],
						},
					},
				],
				rewards: {
					endpoint: `${getApi(NETWORK_LIST.ETH)}/v2/reward/tree`,
					network: 1,
					contract: '0x660802Fc641b154aBA66a62137e71f331B6d787A',
					abi: BadgerTree.abi as AbiItem[],
					tokens: [
						NETWORK_CONSTANTS[NETWORK_LIST.ETH].TOKENS.BADGER_ADDRESS.toLowerCase(), // $BADGER
						NETWORK_CONSTANTS[NETWORK_LIST.ETH].TOKENS.DIGG_ADDRESS.toLowerCase(), // $DIGG
						NETWORK_CONSTANTS[NETWORK_LIST.ETH].TOKENS.BBADGER_ADDRESS.toLowerCase(), // $bBadger
						NETWORK_CONSTANTS[NETWORK_LIST.ETH].TOKENS.BDIGG_ADDRESS.toLowerCase(), // $bDigg
						NETWORK_CONSTANTS[NETWORK_LIST.ETH].TOKENS.XSUSHI_ADDRESS.toLowerCase(), // $xSUSHI
						NETWORK_CONSTANTS[NETWORK_LIST.ETH].TOKENS.FARM_ADDRESS.toLowerCase(), // $FARM
						NETWORK_CONSTANTS[NETWORK_LIST.ETH].TOKENS.USDC_ADDRESS.toLowerCase(), // $USDC
					],
				},
			};
	}
};
