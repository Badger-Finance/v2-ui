import {
	CONTACT_EMAIL,
	APP_NAME,
	PORTIS_APP_ID,
	NETWORK_CONSTANTS,
	NETWORK_LIST,
	NETWORK_IDS,
	WC_BRIDGE,
} from './constants';

export const getOnboardWallets = (network: string) => {
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
					bridge: WC_BRIDGE,
				},
				{ walletName: 'walletLink', rpcUrl: NETWORK_CONSTANTS[NETWORK_LIST.ETH].RPC_URL, appName: APP_NAME },
				{ walletName: 'dapper' },
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
				{ walletName: 'unilogin' },
				{ walletName: 'imToken', rpcUrl: NETWORK_CONSTANTS[NETWORK_LIST.ETH].RPC_URL },
				{ walletName: 'meetone' },
				{ walletName: 'mykey', rpcUrl: NETWORK_CONSTANTS[NETWORK_LIST.ETH].RPC_URL },
				{ walletName: 'huobiwallet', rpcUrl: NETWORK_CONSTANTS[NETWORK_LIST.ETH].RPC_URL },
				{ walletName: 'hyperpay' },
				{ walletName: 'wallet.io', rpcUrl: NETWORK_CONSTANTS[NETWORK_LIST.ETH].RPC_URL },
				{ walletName: 'atoken' },
			];
	}
};

export const onboardWalletCheck = [
	{ checkName: 'derivationPath' },
	{ checkName: 'accounts' },
	{ checkName: 'connect' },
];
