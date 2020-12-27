import {
	INFURA_KEY, APP_URL,
	CONTACT_EMAIL,
	RPC_URL,
	APP_NAME
} from "./constants";

export const onboardWallets = [
	{ walletName: "metamask" },
	{ walletName: 'coinbase' },
	{ walletName: "trust", rpcUrl: RPC_URL },
	{
		walletName: "walletConnect",
		infuraKey: INFURA_KEY
	},
	{ walletName: "dapper" },
	{
		walletName: 'trezor',
		appUrl: APP_URL,
		email: CONTACT_EMAIL,
		rpcUrl: RPC_URL
	},
	{
		walletName: 'ledger',
		rpcUrl: RPC_URL
	},
	{
		walletName: 'lattice',
		rpcUrl: RPC_URL,
		appName: APP_NAME
	},
	{ walletName: "authereum" },
	{ walletName: "opera" },
	{ walletName: "operaTouch" },
	{ walletName: "torus" },
	{ walletName: "status" },
	{ walletName: "unilogin" },
	{ walletName: "walletLink", rpcUrl: RPC_URL, appName: APP_NAME },
	{ walletName: "imToken", rpcUrl: RPC_URL },
	{ walletName: "meetone" },
	{ walletName: "mykey", rpcUrl: RPC_URL },
	{ walletName: "huobiwallet", rpcUrl: RPC_URL },
	{ walletName: "hyperpay" },
	{ walletName: "wallet.io", rpcUrl: RPC_URL },
	{ walletName: "atoken" }
]

export const onboardWalletCheck = [
	{ checkName: 'derivationPath' },
	{ checkName: 'accounts' },
	{ checkName: 'connect' },
	{ checkName: 'network' },
]