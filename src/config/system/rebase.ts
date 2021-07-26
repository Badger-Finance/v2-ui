import UFragments from './abis/UFragments.json';
import UFragmentsPolicy from './abis/UFragmentsPolicy.json';
import MedianOracle from './abis/MedianOracle.json';
import Orchestrator from './abis/Orchestrator.json';
import Dropt2Redemption from './abis/Dropt2Redemption.json';
import { digg_system } from '../deployments/mainnet.json';

import { AbiItem } from 'web3-utils';
import { NETWORK_LIST } from 'config/constants';
import { RebaseNetworkConfig } from '../../mobx/model/network/rebase-network-config';

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
					{
						addresses: [digg_system.DROPT['DROPT-2'].redemption],
						abi: Dropt2Redemption.abi as AbiItem[],
						groupByNamespace: true,
						namespace: 'dropt',
						readMethods: [
							{
								name: 'expirationTimestamp',
								args: [],
							},
							{
								name: 'getCurrentTime',
								args: [],
							},
							{
								name: 'expiryPrice',
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
