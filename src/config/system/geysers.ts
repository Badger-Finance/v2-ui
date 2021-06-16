import BadgerGeyser from './abis/BadgerGeyser.json';
import SushiGeyser from './abis/SushiGeyser.json';
import deploy from '../deployments/mainnet.json';
import { NETWORK_LIST } from '../constants';
import { GeyserNetworkConfig } from 'mobx/model';
import { AbiItem } from 'web3-utils';

export const getGeysers = (network?: string): GeyserNetworkConfig => {
	switch (network) {
		case NETWORK_LIST.ETH:
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
							deploy.geysers['yearn.wBtc'],
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
							deploy.geysers['native.sushiDiggWbtc'],
							deploy.geysers['native.sushiWbtcEth'],
							deploy.geysers['native.sushiBadgerWbtc'],
						],
						fillers: {
							getStakingToken: [
								deploy.sett_system.vaults['native.sushiDiggWbtc'],
								deploy.sett_system.vaults['native.sushiWbtcEth'],
								deploy.sett_system.vaults['native.sushiBadgerWbtc'],
							],
						},
					},
				],
			};
		default:
			return {};
	}
};
