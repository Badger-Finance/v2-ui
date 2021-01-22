import deploy from '../deployments/mainnet.json';
import BadgerHunt from './abis/BadgerHunt.json';
import UFragments from './abis/UFragments.json';
import UFragmentsPolicy from './abis/UFragmentsPolicy.json';
import MedianOracle from './abis/MedianOracle.json';
import Orchestrator from './abis/Orchestrator.json';
import DiggDistributor from './abis/DiggDistributor.json';

export const rewards = {
	endpoint: 'https://fzqm8i0owc.execute-api.us-east-1.amazonaws.com/prod/hunt',
	contract: deploy.digg_system.diggDistributor,
	abi: DiggDistributor.abi,
	tokens: [deploy.digg_system.uFragments],
};

export const token = {
	contract: deploy.digg_system.uFragments,
	abi: UFragments.abi,
};

export const digg = [
	{
		addresses: [deploy.digg_system.uFragments],
		abi: UFragments.abi,
		allReadMethods: true,
		groupByNamespace: true,
		logging: false,
		namespace: 'token',
	},
	{
		addresses: [deploy.digg_system.uFragmentsPolicy],
		abi: UFragmentsPolicy.abi,
		allReadMethods: true,
		groupByNamespace: true,
		logging: false,
		namespace: 'policy',
	},
	{
		addresses: [deploy.digg_system.marketMedianOracle],
		abi: MedianOracle.abi,
		groupByNamespace: true,
		namespace: 'oracle',
		readMethods: [
			{
				name: 'providerReports',
				args: [deploy.digg_system.centralizedOracle, 0],
			},
		],
	},
];

export const orchestrator = {
	contract: deploy.digg_system.orchestrator,
	abi: Orchestrator.abi,
};
// export const digg = [
// 	{
// 		addresses: ['0xd46ba6d942050d489dbd938a2c909a5d5039a161'],
// 		abi: UFragments.abi,
// 		allReadMethods: true,
// 		groupByNamespace: true,
// 		logging: false,
// 		namespace: 'token',
// 	},
// 	{
// 		addresses: ['0x1b228a749077b8e307c5856ce62ef35d96dca2ea'],
// 		abi: UFragmentsPolicy.abi,
// 		allReadMethods: true,
// 		groupByNamespace: true,
// 		logging: false,
// 		namespace: 'policy',
// 	},
// 	{
// 		addresses: ['0x99c9775e076fdf99388c029550155032ba2d8914'],
// 		abi: MedianOracle.abi,
// 		groupByNamespace: true,
// 		namespace: 'oracle',
// 		readMethods: [
// 			{
// 				name: 'providerReports',
// 				args: ['0xfc4b1Ce32ed7310028DCC0d94C7B3D96dCd880e0', 0],
// 			},
// 		],
// 	},
// ];

// export const orchestrator = {
// 	contract: '0x6fb00a180781e75f87e2b690af0196baa77c7e7c',
// 	abi: Orchestrator.abi,
// };
