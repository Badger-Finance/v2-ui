import UFragments from './abis/UFragments.json';
import UFragmentsPolicy from './abis/UFragmentsPolicy.json';
import ChainlinkPricefeed from './abis/ChainlinkPricefeed.json';
import Orchestrator from './abis/Orchestrator.json';
import { digg_system } from '../deployments/mainnet.json';
import { RebaseNetworkConfig } from '../../mobx/model';

import { AbiItem } from 'web3-utils';
import { NETWORK_LIST } from 'config/constants';

export const getRebase = (network?: string | null): RebaseNetworkConfig | undefined => {
	switch (network) {
		case NETWORK_LIST.ETH:
			return {
				digg: [
					{
						addresses: [digg_system.uFragments],
						abi: UFragments.abi as AbiItem[],
						allReadMethods: true,
						groupByNamespace: true,
						logging: false,
						namespace: 'token',
					},
					{
						addresses: [digg_system.uFragmentsPolicy],
						abi: UFragmentsPolicy.abi as AbiItem[],
						allReadMethods: true,
						groupByNamespace: true,
						logging: false,
						namespace: 'policy',
					},
					{
						addresses: [digg_system.chainlinkPriceFeed],
						abi: ChainlinkPricefeed.abi as AbiItem[],
						groupByNamespace: true,
						namespace: 'oracle',
						readMethods: [
							{
								name: 'latestAnswer',
								args: [],
							},
							{
								name: 'latestTimestamp',
								args: [],
							},
						],
					},
				],
				orchestrator: {
					contract: digg_system.orchestrator,
					abi: Orchestrator.abi as AbiItem[],
				},
			};
		default:
			undefined;
	}
};
