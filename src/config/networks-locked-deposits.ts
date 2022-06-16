import { NetworkLockedDepositsConfig } from '../mobx/model/locked-deposits/network-locked-deposits-config';
import { NETWORK_IDS } from './constants';
import fantom from './deployments/ftm.json';
import mainnet from './deployments/mainnet.json';

export const NETWORKS_LOCKED_DEPOSITS_CONFIG: NetworkLockedDepositsConfig = {
	[NETWORK_IDS.ETH]: [
		{
			vaultAddress: mainnet.sett_system.vaults['native.icvx'],
			strategyAddress: mainnet.sett_system.strategies['native.icvx'],
			underlyingTokenAddress: mainnet.tokens['cvx'],
			lockingContractAddress: mainnet.cvxLocker,
		},
	],
	[NETWORK_IDS.FTM]: [
		{
			vaultAddress: fantom.sett_system.vaults['native.veoxd'],
			strategyAddress: fantom.sett_system.strategies['native.veoxd'],
			underlyingTokenAddress: fantom.tokens['oxd'],
			lockingContractAddress: fantom.veoxdLocker,
		},
	],
};
