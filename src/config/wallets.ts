import { StateAndHelpers, WalletCheckModal } from 'bnc-onboard/dist/src/interfaces';
import { Network } from 'mobx/model/network/network';
import { CONTACT_EMAIL, APP_NAME, PORTIS_APP_ID, NETWORK_IDS, RPC_WALLETS } from './constants';
import { ChainNetwork } from './enums/chain-network.enum';

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
		case ChainNetwork.BinanceSmartChain:
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
			];
	}
};

const supportedNetwork = () => {
	return async (stateAndHelpers: StateAndHelpers): Promise<WalletCheckModal | undefined> => {
		const { network, appNetworkId } = stateAndHelpers;
		const chain = Network.networkFromId(network ?? appNetworkId);
		if (!chain || !chain.symbol || !Object.values(ChainNetwork).includes(chain.symbol as ChainNetwork)) {
			const networkMembers = Object.values(ChainNetwork).map((key) => ' '.concat(key.toUpperCase()));
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
