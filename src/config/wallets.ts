import { getNetworkConfig, NetworkConfig } from '@badger-dao/sdk';
import { NETWORK_IDS, PORTIS_APP_ID } from './constants';
import { supportedNetworks } from './networks.config';
import rpc from './rpc.config';
import WalletConnectProvider from '@walletconnect/web3-provider';
import Portis from '@portis/web3';
import CoinbaseWalletSDK from '@coinbase/wallet-sdk';
import { CHAIN_DATA_LIST } from 'web3modal';

export function isSupportedNetwork(chainId?: number): boolean {
	if (!chainId) {
		return true;
	}
	try {
		// verify sdk support for given chain
		const config = getNetworkConfig(chainId);
		return new Set(supportedNetworks.map((network) => network.id)).has(config.chainId);
	} catch {
		return false;
	}
}

export function getWeb3ModalProviders(config: NetworkConfig) {
	// wallet connect / portis network names are different from ours, and they throw an error if they don't match
	const network = Object.values(CHAIN_DATA_LIST).find((network) => network.chainId === config.chainId)?.network;
	const networkRPC = rpc[config.network];
	return {
		walletconnect: {
			package: WalletConnectProvider,
			options: {
				rpc: {
					[NETWORK_IDS.ETH]: networkRPC,
					[NETWORK_IDS.BSC]: networkRPC,
					[NETWORK_IDS.ARB]: networkRPC,
					[NETWORK_IDS.FTM]: networkRPC,
					[NETWORK_IDS.MATIC]: networkRPC,
				},
				network,
			},
		},
		coinbasewallet: {
			package: CoinbaseWalletSDK,
			options: {
				appName: 'BadgerDAO',
				rpc: networkRPC,
			},
		},
		portis: {
			package: Portis,
			options: {
				id: PORTIS_APP_ID,
				network,
			},
		},
	};
}
