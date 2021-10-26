import { AbiItem } from 'web3-utils';
import { badgerHunt, digg_system, sett_system, token, airdrops } from '../deployments/mainnet.json';
import { abi as diggDistributorAbi } from './abis/DiggDistributor.json';
import { abi as diggAbi } from './abis/UFragments.json';
import { abi as erc20Abi } from './abis/ERC20.json';
import { abi as badgerHuntAbi } from './abis/BadgerHunt.json';
import { abi as bBadgerAirdropAbi } from './abis/bBadgerAidrop.json';
import { getApi } from 'mobx/utils/apiV2';
import { AirdropNetworkConfig } from '../../mobx/model/network/airdrop-network-config';
import { Network } from '@badger-dao/sdk';

export const getAirdrops = (network: Network): AirdropNetworkConfig[] => {
	switch (network) {
		case Network.Ethereum:
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
			];
		default:
			return [];
	}
};
