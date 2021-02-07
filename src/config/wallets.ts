import { APP_URL, CONTACT_EMAIL, RPC_URL, APP_NAME, PORTIS_APP_ID } from './constants';

export const onboardWallets = [
	{ walletName: 'metamask' },
	{ walletName: 'coinbase' },
	// Removed due to handling through walletConnect
	//{ walletName: "trust", rpcUrl: RPC_URL },
	{
		walletName: 'ledger',
		rpcUrl: RPC_URL,
	},
	{
		walletName: 'walletConnect',
		rpc: { ['1']: RPC_URL },
	},
	{ walletName: 'walletLink', rpcUrl: RPC_URL, appName: APP_NAME },
	{ walletName: 'dapper' },
	{
		walletName: 'portis',
		apiKey: PORTIS_APP_ID,
		label: 'Portis',
	},
	{
		walletName: 'trezor',
		appUrl: APP_URL,
		email: CONTACT_EMAIL,
		rpcUrl: RPC_URL,
	},
	{
		walletName: 'lattice',
		rpcUrl: RPC_URL,
		appName: APP_NAME,
	},
	{ walletName: 'authereum' },
	{ walletName: 'opera' },
	{ walletName: 'operaTouch' },
	{ walletName: 'torus' },
	{ walletName: 'status' },
	{ walletName: 'unilogin' },
	{ walletName: 'imToken', rpcUrl: RPC_URL },
	{ walletName: 'meetone' },
	{ walletName: 'mykey', rpcUrl: RPC_URL },
	{ walletName: 'huobiwallet', rpcUrl: RPC_URL },
	{ walletName: 'hyperpay' },
	{ walletName: 'wallet.io', rpcUrl: RPC_URL },
	{ walletName: 'atoken' },
];

export const onboardWalletCheck = [
	{ checkName: 'derivationPath' },
	{ checkName: 'accounts' },
	{ checkName: 'connect' },
	{ checkName: 'network' },
];
