import UFragments from './abis/UFragments.json';
import UFragmentsPolicy from './abis/UFragmentsPolicy.json';
import MedianOracle from './abis/MedianOracle.json';
import Orchestrator from './abis/Orchestrator.json';
import DroptRedemption from './abis/DroptRedemption.json';
import { digg_system } from '../deployments/mainnet.json';

import { AbiItem } from 'web3-utils';
import { NETWORK_LIST } from 'config/constants';
import { RebaseNetworkConfig } from '../../mobx/model/network/rebase-network-config';

export const getRebase = (network: string): RebaseNetworkConfig | undefined => {
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
					// TODO: Determine better way to handle multiple reports
					{
						addresses: [digg_system.marketMedianOracle],
						abi: MedianOracle.abi as AbiItem[],
						groupByNamespace: true,
						namespace: 'oracle',
						readMethods: [
							{
								name: 'providerReports',
								args: [digg_system.newCentralizedOracle, 0],
							},
						],
					},
					{
						addresses: [digg_system.marketMedianOracle],
						abi: MedianOracle.abi as AbiItem[],
						groupByNamespace: true,
						namespace: 'oracle',
						readMethods: [
							{
								name: 'providerReports',
								args: [digg_system.newCentralizedOracle, 1],
							},
						],
					},
					{
						addresses: [digg_system.DROPT['DROPT-2'].redemption],
						abi: DroptRedemption.abi as AbiItem[],
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
					{
						addresses: [digg_system.DROPT['DROPT-3'].redemption],
						abi: DroptRedemption.abi as AbiItem[],
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
			return undefined;
	}
};

const LONG_TOKEN_MAP = {
	[digg_system.DROPT['DROPT-1'].redemption]: digg_system.DROPT['DROPT-1'].longToken,
	[digg_system.DROPT['DROPT-2'].redemption]: digg_system.DROPT['DROPT-2'].longToken,
	[digg_system.DROPT['DROPT-3'].redemption]: digg_system.DROPT['DROPT-3'].longToken,
};

export const redemptionToLongToken = (contract: string): string => {
	return LONG_TOKEN_MAP[contract];
};
