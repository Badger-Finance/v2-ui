import { AbiItem } from 'web3-utils';
import { badgerHunt, digg_system, sett_system, token, airdrops, tokens } from '../deployments/mainnet.json';
import { abi as diggDistributorAbi } from './abis/DiggDistributor.json';
import { abi as diggAbi } from './abis/UFragments.json';
import { abi as erc20Abi } from './abis/ERC20.json';
import { abi as badgerHuntAbi } from './abis/BadgerHunt.json';
import { abi as bBadgerAirdropAbi } from './abis/bBadgerAidrop.json';
import { AirdropNetworkConfig } from '../../mobx/model';
import { getApi } from 'mobx/utils/apiV2';
import { NETWORK_LIST } from '../constants';

export const getAirdrops = (network?: string): AirdropNetworkConfig[] => {
	switch (network) {
		case NETWORK_LIST.ETH:
			return [
				{
					active: false,
					endpoint: ``,
					token: token,
					tokenAbi: erc20Abi as AbiItem[],
					airdropContract: badgerHunt,
					airdropAbi: badgerHuntAbi as AbiItem[],
				},
				{
					active: false,
					endpoint: ``,
					tokenAbi: diggAbi as AbiItem[],
					token: digg_system.uFragments,
					airdropContract: digg_system.diggDistributor,
					airdropAbi: diggDistributorAbi as AbiItem[],
				},
				{
					active: true,
					endpoint: `${getApi()}/reward/gitcoin`,
					tokenAbi: erc20Abi as AbiItem[],
					token: sett_system.vaults['native.badger'],
					airdropContract: airdrops.gitcoinRound8,
					airdropAbi: bBadgerAirdropAbi as AbiItem[],
				},
				{
					active: false,
					// TODO: Update the correct endpoint
					endpoint: '',
					tokenAbi: erc20Abi as AbiItem[],
					token: tokens['DROPT-1'],
					// TODO: Update with correct ABI and contract
					airdropContract: airdrops.gitcoinRound8,
					airdropAbi: bBadgerAirdropAbi as AbiItem[],
				},
			];
		default:
			return [];
	}
};
