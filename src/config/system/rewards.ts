import { NETWORK_LIST } from '../constants';
import { RewardNetworkConfig } from 'mobx/model';
import BadgerTree from './abis/BadgerTree.json';
import { AbiItem } from 'web3-utils';
import { getApi } from '../../mobx/utils/apiV2';
import { badgerTree, tokens, sett_system } from '../deployments/mainnet.json';

export const getRewards = (network?: string): RewardNetworkConfig | undefined => {
	switch (network) {
		case NETWORK_LIST.ETH:
			return {
				endpoint: `${getApi()}/reward/tree`,
				network: 1,
				contract: badgerTree,
				abi: BadgerTree.abi as AbiItem[],
				tokens: [
					tokens.badger, // $BADGER
					tokens.digg, // $DIGG
					sett_system.vaults['native.badger'], // $bBadger
					sett_system.vaults['native.digg'], // $bDigg
					tokens.xsushi, // $xSUSHI
					tokens.farm, // $FARM
					tokens.usdc, // $USDC
				],
			};
		default:
			return undefined;
	}
};
