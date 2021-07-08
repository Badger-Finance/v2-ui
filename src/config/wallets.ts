import { StateAndHelpers, WalletCheckModal } from 'bnc-onboard/dist/src/interfaces';
import { getNetworkNameFromId } from 'mobx/utils/network';
import {
	CONTACT_EMAIL,
	APP_NAME,
	PORTIS_APP_ID,
	NETWORK_CONSTANTS,
	NETWORK_LIST,
	NETWORK_IDS,
	RPC_WALLETS,
} from './constants';

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

export const getOnboardWallets = (network?: string): WalletProviderInfo[] => {
	if (!network) {
		return [];
	}
	switch (network) {
		case NETWORK_LIST.BSC:
			return [{ walletName: 'metamask' }];
		default:
			return [
				{ walletName: 'metamask' },
				{ walletName: 'coinbase' },
				// Removed due to handling through walletConnect
				//{ walletName: "trust", rpcUrl: RPC_URL },
				{
					walletName: 'ledger',
					rpcUrl: NETWORK_CONSTANTS[NETWORK_LIST.ETH].RPC_URL,
				},
				{
					walletName: 'walletConnect',
					rpc: {
						['1']: NETWORK_CONSTANTS[NETWORK_LIST.ETH].RPC_URL,
						[NETWORK_IDS.BSC.toString()]: NETWORK_CONSTANTS[NETWORK_LIST.BSC].RPC_URL,
					},
				},
				{ walletName: 'walletLink', rpcUrl: NETWORK_CONSTANTS[NETWORK_LIST.ETH].RPC_URL, appName: APP_NAME },
				{
					walletName: 'portis',
					apiKey: PORTIS_APP_ID,
					label: 'Portis',
				},
				{
					walletName: 'trezor',
					appUrl: NETWORK_CONSTANTS[NETWORK_LIST.ETH].APP_URL,
					email: CONTACT_EMAIL,
					rpcUrl: NETWORK_CONSTANTS[NETWORK_LIST.ETH].RPC_URL,
				},
				{
					walletName: 'lattice',
					rpcUrl: NETWORK_CONSTANTS[NETWORK_LIST.ETH].RPC_URL,
					appName: APP_NAME,
				},
				{ walletName: 'authereum' },
				{ walletName: 'opera' },
				{ walletName: 'operaTouch' },
				{ walletName: 'torus' },
				{ walletName: 'status' },
				{ walletName: 'meetone' },
				{ walletName: 'hyperpay' },
				{ walletName: 'atoken' },
			];
	}
};

const supportedNetwork = () => {
	return async (stateAndHelpers: StateAndHelpers): Promise<WalletCheckModal | undefined> => {
		const { network, appNetworkId } = stateAndHelpers;
		const networkName = getNetworkNameFromId(network ?? appNetworkId);
		if (!networkName || !Object.values(NETWORK_LIST).includes(networkName as NETWORK_LIST)) {
			const networkMembers = Object.values(NETWORK_LIST).map((key) => ' '.concat(key.toUpperCase()));
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
