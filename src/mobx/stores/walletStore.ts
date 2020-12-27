import { extendObservable, action } from 'mobx';
import Web3 from 'web3'

import { Store } from 'mobx-router';
import { RootStore } from '../store';
import { PromiEvent } from 'web3-core';
import { Contract } from 'web3-eth-contract';
import { estimateAndSend } from '../utils/web3';
import BigNumber from 'bignumber.js';


class WalletStore {

	public provider?: any = new Web3.providers.HttpProvider('https://mainnet.infura.io/v3/77a0f6647eb04f5ca1409bba62ae9128')
	private store?: RootStore
	public currentBlock?: number;
	public ethBalance?: BigNumber;
	public gasPrices?: any;

	constructor(store: RootStore) {
		this.store = store

		extendObservable(this, {
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



}

export default WalletStore;