import { extendObservable, action } from 'mobx';
import Web3 from 'web3';
import Onboard from 'bnc-onboard';

import { Store } from 'mobx-router';
import { RootStore } from '../store';
import { PromiEvent } from 'web3-core';
import { Contract } from 'web3-eth-contract';
import { estimateAndSend } from '../utils/web3';
import BigNumber from 'bignumber.js';


class WalletStore {

	private walletChecks = [
		{ checkName: 'derivationPath' },
		{ checkName: 'accounts' },
		{ checkName: 'connect' },
		{ checkName: 'network' },
	  ]
	
	private INFURA_KEY = "77a0f6647eb04f5ca1409bba62ae9128"
	private APP_URL = "https://app.badger.finance/"
	private CONTACT_EMAIL = "hello@badger.finance"
	private RPC_URL = "https://mainnet.infura.io/v3/77a0f6647eb04f5ca1409bba62ae9128"
	private APP_NAME = "badgerDAO"

	private wallets = [
	{ walletName: "metamask"},
	{ walletName: 'coinbase' },
	{ walletName: "trust", rpcUrl: this.RPC_URL },
	{
		walletName: "walletConnect",
		infuraKey: this.INFURA_KEY
	},
	{ walletName: "dapper"}, 
	{
		walletName: 'trezor',
		appUrl: this.APP_URL,
		email: this.CONTACT_EMAIL,
		rpcUrl: this.RPC_URL
	},
	{
		walletName: 'ledger',
		rpcUrl: this.RPC_URL
	},
	{
		walletName: 'lattice',
		rpcUrl: this.RPC_URL,
		appName: this.APP_NAME
	},
	{ walletName: "authereum" },
	{ walletName: "opera" },
	{ walletName: "operaTouch" },
	{ walletName: "torus" },
	{ walletName: "status" },
	{ walletName: "unilogin" },
	{ walletName: "walletLink", rpcUrl: this.RPC_URL, appName: this.APP_NAME },
	{ walletName: "imToken", rpcUrl: this.RPC_URL },
	{ walletName: "meetone" },
	{ walletName: "mykey", rpcUrl: this.RPC_URL },
	{ walletName: "huobiwallet", rpcUrl: this.RPC_URL },
	{ walletName: "hyperpay" },
	{ walletName: "wallet.io", rpcUrl: this.RPC_URL },
	{ walletName: "atoken" }
	]

	private initializationOptions: any = {
		dappId: 'af74a87b-cd08-4f45-83ff-ade6b3859a07',
		networkId: 1,
		darkMode: true,
		subscriptions: {
		  address: (address: any) => {
			  this.setAddress(address);
		  }, 
		// TOOD: Add check for mainnet and display a warning if not connected
		//   network: Function,
		// TODO:  Add balance refresh on change
		//   balance: Function,
		//   wallet: Function
		},
		walletSelect: {
		  heading: 'Select wallet to connect to badgerDAO',
		//   description: String,
		//   explanation: String,
		  wallets: this.wallets
		},
		walletCheck: this.walletChecks
		}
	
	public onboard: any = Onboard(this.initializationOptions);
	public provider?: any = new Web3.providers.HttpProvider('https://mainnet.infura.io/v3/77a0f6647eb04f5ca1409bba62ae9128')
	public connectedAddress: string = '';
	private store?: RootStore
	public currentBlock?: number;
	public ethBalance?: BigNumber;
	public gasPrices?: any;

	constructor(store: RootStore) {
		this.store = store

		extendObservable(this, {
			connectedAddress: this.connectedAddress,
			provider: this.provider,
			currentBlock: undefined,
			gasPrices: {},
			ethBalance: new BigNumber(0),
		});

		this.getCurrentBlock()
		this.getGasPrice()

		setInterval(() => {
			this.getGasPrice()
			this.getCurrentBlock()
		}
			, 13000)
	}

	walletReset = action(() => {
		try {
			this.setProvider(new Web3.providers.HttpProvider('https://mainnet.infura.io/v3/77a0f6647eb04f5ca1409bba62ae9128'));
			this.setAddress('');
		} catch (err) {
			console.log(err)
		}
	});

	connect = action((wsOnboard:any) => {
		let walletState = wsOnboard.getState();
		this.setProvider(walletState.wallet.provider)
		this.connectedAddress = walletState.wallet.provider.selectedAddress;
		this.onboard = wsOnboard;
	})

	getCurrentBlock = action(() => {
		let web3 = new Web3(this.provider)
		web3.eth.getBlockNumber().then((value: number) => {
			this.currentBlock = value - 50
		})
		!!this.provider.selectedAddress && web3.eth.getBalance(this.provider.selectedAddress).then((value: string) => {
			this.ethBalance = new BigNumber(value)
		})
	});

	getGasPrice = action(() => {
		fetch("https://gasprice.poa.network/")
			.then((result: any) => result.json())
			.then((price: any) => {
				this.gasPrices = price
			})
	});

	setProvider = action((provider: any) => {
		this.provider = provider;
		let web3 = new Web3(this.provider)
		this.getCurrentBlock()

	});

	setAddress = action((address: any) => {
		this.connectedAddress = address;
	});



}

export default WalletStore;