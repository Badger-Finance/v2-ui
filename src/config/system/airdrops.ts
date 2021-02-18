import { AbiItem } from 'web3-utils';
import { badgerHunt, digg_system, sett_system, token } from '../deployments/mainnet.json';
import { abi as diggDistributorAbi } from './abis/DiggDistributor.json';
import { abi as diggAbi } from './abis/UFragments.json';
import { abi as erc20Abi } from './abis/ERC20.json';
import { abi as badgerHuntAbi } from './abis/BadgerHunt.json';
import { abi as bBadgerAirdropAbi } from './abis/bBadgerAidrop.json';
import { AirdropsConfig } from '../../mobx/model';

export const airdropEndpoint = 'https://fzqm8i0owc.execute-api.us-east-1.amazonaws.com/prod/hunt';

const nativeBadger = sett_system.vaults['native.badger'];

export const airdropsConfig: AirdropsConfig = {
	// BADGER
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
	[nativeBadger]: {
		tokenAbi: erc20Abi as AbiItem[],
		tokenContract: nativeBadger,
		// TODO: Add new airdrop contract
		airdropContract: '0xD17C7effa924B55951E0F6d555b3a3ea34451179',
		airdropAbi: bBadgerAirdropAbi as AbiItem[],
	},
};
