import UFragments from './abis/UFragments.json';
import UFragmentsPolicy from './abis/UFragmentsPolicy.json';
import MedianOracle from './abis/MedianOracle.json';
import Orchestrator from './abis/Orchestrator.json';

const { digg_system } = require('../deployments/mainnet.json');

export const digg = [
	{
		addresses: [digg_system.uFragments],
		abi: UFragments.abi,
		allReadMethods: true,
		groupByNamespace: true,
		logging: false,
		namespace: 'token',
	},
	{
		addresses: [digg_system.uFragmentsPolicy],
		abi: UFragmentsPolicy.abi,
		allReadMethods: true,
		groupByNamespace: true,
		logging: false,
		namespace: 'policy',
	},
	{
		addresses: [digg_system.marketMedianOracle],
		abi: MedianOracle.abi,
		groupByNamespace: true,
		namespace: 'oracle',
		readMethods: [
			{
				name: 'providerReports',
				args: [digg_system.centralizedOracle, 0],
			},
		],
	},
];

export const orchestrator = {
	contract: digg_system.orchestrator,
	abi: Orchestrator.abi,
};
