import UFragments from './abis/UFragments.json';
import UFragmentsPolicy from './abis/UFragmentsPolicy.json';
import MedianOracle from './abis/MedianOracle.json';
import Orchestrator from './abis/Orchestrator.json';
import { digg_system } from '../deployments/mainnet.json';
import { RebaseNetworkConfig } from '../../mobx/model';

import { AbiItem } from 'web3-utils';
import { NETWORK_LIST } from 'config/constants';

export const getRebase = (network: string | null): RebaseNetworkConfig | undefined => {
	switch (network) {
		case NETWORK_LIST.BSC:
			return undefined;
		default:
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
						addresses: [digg_system.marketMedianOracle],
						abi: MedianOracle.abi as AbiItem[],
						groupByNamespace: true,
						namespace: 'oracle',
						readMethods: [
							{
								name: 'providerReports',
								args: [digg_system.centralizedOracle, 0],
							},
						],
					},
				],
				orchestrator: {
					contract: digg_system.orchestrator,
					abi: Orchestrator.abi as AbiItem[],
				},
			};
	}
};

// export const digg = [
// 	{
// 		addresses: [digg_system.uFragments],
// 		abi: UFragments.abi,
// 		allReadMethods: true,
// 		groupByNamespace: true,
// 		logging: false,
// 		namespace: 'token',
// 	},
// 	{
// 		addresses: [digg_system.uFragmentsPolicy],
// 		abi: UFragmentsPolicy.abi,
// 		allReadMethods: true,
// 		groupByNamespace: true,
// 		logging: false,
// 		namespace: 'policy',
// 	},
// 	{
// 		addresses: [digg_system.marketMedianOracle],
// 		abi: MedianOracle.abi,
// 		groupByNamespace: true,
// 		namespace: 'oracle',
// 		readMethods: [
// 			{
// 				name: 'providerReports',
// 				args: [digg_system.centralizedOracle, 0],
// 			},
// 		],
// 	},
// ];

// export const orchestrator = {
// 	contract: digg_system.orchestrator,
// 	abi: Orchestrator.abi,
// };
