import { StateAndHelpers, WalletCheckModal } from 'bnc-onboard/dist/src/interfaces';
import { Network } from 'mobx/model/network/network';
import { CONTACT_EMAIL, APP_NAME, PORTIS_APP_ID, NETWORK_LIST, NETWORK_IDS, RPC_WALLETS } from './constants';

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

export const getOnboardWallets = (chain: Network): WalletProviderInfo[] => {
	const rpc = chain.rpc;
	switch (chain.symbol) {
		case NETWORK_LIST.BSC:
			return [{ walletName: 'metamask' }];
		default:
			return [
				{ walletName: 'metamask' },
				{ walletName: 'coinbase' },
				{
					walletName: 'ledger',
					rpcUrl: rpc,
				},
				{
					walletName: 'walletConnect',
					rpc: {
						['1']: rpc,
						[NETWORK_IDS.BSC.toString()]: rpc,
					},
				},
				{ walletName: 'walletLink', rpcUrl: rpc, appName: APP_NAME },
				{
					walletName: 'portis',
					apiKey: PORTIS_APP_ID,
					label: 'Portis',
				},
				{
					walletName: 'trezor',
					appUrl: 'https://app.badger.finance/',
					email: CONTACT_EMAIL,
					rpcUrl: rpc,
				},
				{
					walletName: 'lattice',
					rpcUrl: rpc,
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
		const chain = Network.networkFromId(network ?? appNetworkId);
		if (!chain || !chain.symbol || !Object.values(NETWORK_LIST).includes(chain.symbol as NETWORK_LIST)) {
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
