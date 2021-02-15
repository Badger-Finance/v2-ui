const { digg_system, sett_system, token, badgerHunt } = require('../deployments/mainnet.json');
const { abi: diggDistributorAbi } = require('./abis/DiggDistributor.json');
const { abi: diggAbi } = require('./abis/UFragments.json');
const { abi: erc20Abi } = require('./abis/ERC20.json');
const { abi: badgerHuntAbi } = require('./abis/BadgerHunt.json');

export const airdropEndpoint = 'https://fzqm8i0owc.execute-api.us-east-1.amazonaws.com/prod/hunt';

export const airdropsConfig = {
	// BADGER
	[token]: {
		tokenAbi: erc20Abi,
		tokenContract: token,
		airdropContract: badgerHunt,
		airdropAbi: badgerHuntAbi,
	},
	// DIGG
	[digg_system.uFragments]: {
		tokenAbi: diggAbi,
		tokenContract: digg_system.uFragments,
		airdropContract: digg_system.diggDistributor,
		airdropAbi: diggDistributorAbi,
	},
	// bBADGER
	[sett_system.vaults['native.badger']]: {
		tokenAbi: erc20Abi,
		tokenContract: sett_system.vaults['native.badger'],
		// TODO: Add new airdrop contract
		airdropContract: '',
		airdropAbi: '',
	},
};

const tokens = [token, digg_system.uFragments, sett_system.vaults['native.badger']];
