import { NETWORK_CONSTANTS, NETWORK_LIST } from '../constants';
import { RewardNetworkConfig } from 'mobx/model';
import BadgerTree from './abis/BadgerTree.json';
import { AbiItem } from 'web3-utils';
import { getApi } from '../../mobx/utils/api';

export const getRewards = (network: string): RewardNetworkConfig | undefined => {
	switch (network) {
		case NETWORK_LIST.BSC:
			return undefined;
		default:
			return {
				endpoint: `${getApi(NETWORK_LIST.ETH)}/v2/reward/tree`,
				network: 1,
				contract: '0x660802Fc641b154aBA66a62137e71f331B6d787A',
				abi: BadgerTree.abi as AbiItem[],
				tokens: [
					NETWORK_CONSTANTS[NETWORK_LIST.ETH].TOKENS.BADGER_ADDRESS, // $BADGER
					NETWORK_CONSTANTS[NETWORK_LIST.ETH].TOKENS.DIGG_ADDRESS, // $DIGG
					NETWORK_CONSTANTS[NETWORK_LIST.ETH].TOKENS.BBADGER_ADDRESS, // $bBadger
					NETWORK_CONSTANTS[NETWORK_LIST.ETH].TOKENS.BDIGG_ADDRESS, // $bDigg
					NETWORK_CONSTANTS[NETWORK_LIST.ETH].TOKENS.XSUSHI_ADDRESS, // $xSUSHI
					NETWORK_CONSTANTS[NETWORK_LIST.ETH].TOKENS.FARM_ADDRESS, // $FARM
					NETWORK_CONSTANTS[NETWORK_LIST.ETH].TOKENS.USDC_ADDRESS, // $USDC
				],
			};
	}
};
