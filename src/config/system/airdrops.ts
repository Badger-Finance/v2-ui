import { AbiItem } from 'web3-utils';
import { badgerHunt, digg_system, sett_system, token, airdrops } from '../deployments/mainnet.json';
import { abi as diggDistributorAbi } from './abis/DiggDistributor.json';
import { abi as diggAbi } from './abis/UFragments.json';
import { abi as erc20Abi } from './abis/ERC20.json';
import { abi as badgerHuntAbi } from './abis/BadgerHunt.json';
import { abi as bBadgerAirdropAbi } from './abis/bBadgerAidrop.json';
import { AirdropNetworkConfig } from '../../mobx/model';
import { getApi } from 'mobx/utils/apiV2';
import { NETWORK_LIST } from '../constants';

export const getAirdrops = (network?: string | undefined): AirdropNetworkConfig | undefined => {
	switch (network) {
		case NETWORK_LIST.ETH:
			return {
				airdropEndpoint: `${getApi()}/reward`,
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
						airdropContract: airdrops.gitcoinRound8,
						airdropAbi: bBadgerAirdropAbi as AbiItem[],
					},
				},
			};
		default:
			return undefined;
	}
};
