import { extendObservable, action } from 'mobx';
import Web3 from 'web3';
import Onboard from 'bnc-onboard';

import { Store } from 'mobx-router';
import { RootStore } from '../store';
import { PromiEvent } from 'web3-core';
import { Contract } from 'web3-eth-contract';
import { estimateAndSend } from '../utils/web3';
import BigNumber from 'bignumber.js';
import { onboardWallets, onboardWalletCheck } from '../../config/wallets';



class WalletStore {

	private store?: RootStore


	public onboard: any;
	public provider?: any = new Web3.providers.HttpProvider('https://mainnet.infura.io/v3/77a0f6647eb04f5ca1409bba62ae9128')
	public connectedAddress: string = '';
	public currentBlock?: number;
	public ethBalance?: BigNumber;
	public gasPrices?: any;

	constructor(store: RootStore) {
		this.store = store

		const onboardOptions: any = {
			dappId: 'af74a87b-cd08-4f45-83ff-ade6b3859a07',
			networkId: 1,
			darkMode: true,
			subscriptions: {
				address: this.setAddress,
			},
			walletSelect: {
				heading: 'Connect to BadgerDAO',
				description: 'Deposit & Earn on your Bitcoin',
				wallets: onboardWallets
			},
			walletCheck: onboardWalletCheck
		}

		extendObservable(this, {
			connectedAddress: this.connectedAddress,
			provider: this.provider,
			currentBlock: undefined,
			gasPrices: {},
			ethBalance: new BigNumber(0),
			onboard: Onboard(onboardOptions)
		});

		this.getCurrentBlock()
		this.getGasPrice()

		setInterval(() => {
			this.getGasPrice()
			this.getCurrentBlock()
		}, 13000)
	}

	walletReset = action(() => {
		try {
			this.setProvider(new Web3.providers.HttpProvider('https://mainnet.infura.io/v3/77a0f6647eb04f5ca1409bba62ae9128'));
			this.setAddress('');
		} catch (err) {
			console.log(err)
		}
	});

	connect = action((wsOnboard: any) => {
		let walletState = wsOnboard.getState();
		console.log("Connecting: ", walletState)
		this.setProvider(walletState.wallet.provider)
		console.log('Connected: ', this.provider)
		this.connectedAddress = walletState.address;
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