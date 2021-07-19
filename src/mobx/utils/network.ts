import { NETWORK_IDS, NETWORK_LIST } from 'config/constants';
import deploy from '../../config/deployments/mainnet.json';
import bscDeploy from '../../config/deployments/bsc.json';
import { Network } from '../model/network/network';
import { BscNetwork } from '../model/network/bscNetwork';
import { EthNetwork } from '../model/network/ethNetwork';
import { DeployConfig } from '../model/system-config/deploy-config';

export const getNetwork = (network?: string): Network => {
	switch (network) {
		case NETWORK_LIST.BSC:
			return new BscNetwork();
		case NETWORK_LIST.ETH:
			return new EthNetwork();
		default:
			return new EthNetwork();
	}
};

export const getNetworkId = (network?: string): number => {
	switch (network) {
		case NETWORK_LIST.BSC:
			return 56;
		// case NETWORK_LIST.XDAI:
		// 	return 100;
		// case NETWORK_LIST.FTM:
		// 	return 250;
		// case NETWORK_LIST.MATIC:
		// 	return 137;
		default:
			return 1;
	}
};

export const getNetworkNameFromId = (network: number): string | undefined => {
	switch (network) {
		case NETWORK_IDS.BSC:
			return NETWORK_LIST.BSC;
		case NETWORK_IDS.ETH:
			return NETWORK_LIST.ETH;
		default:
			return undefined;
	}
};

export const getNetworkDeploy = (network?: string | undefined): DeployConfig => {
	switch (network) {
		case NETWORK_LIST.BSC:
			return bscDeploy;
		case NETWORK_LIST.ETH:
			return deploy;
		default:
			return {};
	}
};
