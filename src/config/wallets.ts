import { Network, NetworkConfig } from '@badger-dao/sdk';
import { StateAndHelpers, WalletCheckModal } from 'bnc-onboard/dist/src/interfaces';
import { Network as NetworkModel } from 'mobx/model/network/network';
import { CONTACT_EMAIL, APP_NAME, PORTIS_APP_ID, NETWORK_IDS, RPC_WALLETS } from './constants';
import rpc from './rpc.config';

export interface WalletProviderInfo {
	walletName: string;
	rpcUrl?: string;
	bridge?: string;
	apiKey?: string;
	label?: string;
	rpc?: { [networkId: string]: string };
	appName?: string;
	appUrl?: string;
	email?: string;
}

export const isRpcWallet = (walletName: string | null): boolean => {
	if (!walletName) return false;
	return RPC_WALLETS[walletName] ?? false;
};

export const getOnboardWallets = (config: NetworkConfig): WalletProviderInfo[] => {
	const networkRPC = rpc[config.network];
	switch (config.network) {
		case Network.BinanceSmartChain:
			return [{ walletName: 'metamask' }];
		default:
			return [
				{ walletName: 'metamask' },
				{ walletName: 'coinbase' },
				{
					walletName: 'ledger',
					rpcUrl: networkRPC,
				},
				{
					walletName: 'walletConnect',
					rpc: {
						['1']: networkRPC,
						[NETWORK_IDS.BSC.toString()]: networkRPC,
					},
				},
				{ walletName: 'walletLink', rpcUrl: networkRPC, appName: APP_NAME },
				{
					walletName: 'portis',
					apiKey: PORTIS_APP_ID,
					label: 'Portis',
				},
				{
					walletName: 'trezor',
					appUrl: 'https://app.badger.finance/',
					email: CONTACT_EMAIL,
					rpcUrl: networkRPC,
				},
			];
	}
};

const supportedNetwork = () => {
	return async (stateAndHelpers: StateAndHelpers): Promise<WalletCheckModal | undefined> => {
		const { network, appNetworkId } = stateAndHelpers;
		const chain = NetworkModel.networkFromId(network ?? appNetworkId);
		if (!chain || !chain.symbol || !Object.values(Network).includes(chain.symbol as Network)) {
			const networkMembers = Object.values(Network).map((key) => ' '.concat(key.toUpperCase()));
			return {
				heading: `Unsupported Network`,
				description: `Switch your network to one of the supported networks:${networkMembers}`,
				eventCode: 'network',
			};
		}
	};
};

export const onboardWalletCheck = [
	supportedNetwork(),
	{ checkName: 'derivationPath' },
	{ checkName: 'accounts' },
	{ checkName: 'connect' },
];
