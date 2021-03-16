import { AbiItem } from 'web3-utils';
import { badgerHunt, digg_system, sett_system, token } from '../deployments/mainnet.json';
import { abi as diggDistributorAbi } from './abis/DiggDistributor.json';
import { abi as diggAbi } from './abis/UFragments.json';
import { abi as erc20Abi } from './abis/ERC20.json';
import { abi as badgerHuntAbi } from './abis/BadgerHunt.json';
import { abi as bBadgerAirdropAbi } from './abis/bBadgerAidrop.json';
import { AirdropsConfig, AirdropNetworkConfig } from '../../mobx/model';
import { getApi } from 'mobx/utils/api';
import { NETWORK_LIST } from '../constants';

export const getAirdrops = (network: string | undefined): AirdropNetworkConfig | undefined => {
	switch (network) {
		case NETWORK_LIST.BSC:
			return undefined;
		default:
			return {
				airdropEndpoint: `${getApi(network)}/v2/reward`,
				airdropsConfig: {
					[token]: {
						tokenAbi: erc20Abi as AbiItem[],
						tokenContract: token,
						airdropContract: badgerHunt,
						airdropAbi: badgerHuntAbi as AbiItem[],
					},
					// DIGG
					[digg_system.uFragments]: {
						tokenAbi: diggAbi as AbiItem[],
						tokenContract: digg_system.uFragments,
						airdropContract: digg_system.diggDistributor,
						airdropAbi: diggDistributorAbi as AbiItem[],
					},
					// // bBADGER
					[sett_system.vaults['native.badger']]: {
						tokenAbi: erc20Abi as AbiItem[],
						tokenContract: sett_system.vaults['native.badger'],
						airdropContract: '0xD17C7effa924B55951E0F6d555b3a3ea34451179',
						airdropAbi: bBadgerAirdropAbi as AbiItem[],
					},
				},
			};
	}
};

// export const airdropEndpoint = `${
// 	process.env.NODE_ENV !== 'production'
// 		? 'https://laiv44udi0.execute-api.us-west-1.amazonaws.com/staging'
// 		: 'https://2k2ccquid1.execute-api.us-west-1.amazonaws.com/prod'
// }/v2/reward`;

// export const airdropsConfig: AirdropsConfig = {
// 	// BADGER
// 	[token]: {
// 		tokenAbi: erc20Abi as AbiItem[],
// 		tokenContract: token,
// 		airdropContract: badgerHunt,
// 		airdropAbi: badgerHuntAbi as AbiItem[],
// 	},
// 	// DIGG
// 	[digg_system.uFragments]: {
// 		tokenAbi: diggAbi as AbiItem[],
// 		tokenContract: digg_system.uFragments,
// 		airdropContract: digg_system.diggDistributor,
// 		airdropAbi: diggDistributorAbi as AbiItem[],
// 	},
// 	// // bBADGER
// 	[sett_system.vaults['native.badger']]: {
// 		tokenAbi: erc20Abi as AbiItem[],
// 		tokenContract: sett_system.vaults['native.badger'],
// 		airdropContract: '0xD17C7effa924B55951E0F6d555b3a3ea34451179',
// 		airdropAbi: bBadgerAirdropAbi as AbiItem[],
// 	},
// };
