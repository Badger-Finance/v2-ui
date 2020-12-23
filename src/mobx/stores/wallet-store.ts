import { extendObservable, action } from 'mobx';
import Web3 from 'web3'

import { Store } from 'mobx-router';
import { RootStore } from '../store';
import { PromiEvent } from 'web3-core';
import { Contract } from 'web3-eth-contract';
import { estimateAndSend } from '../utils/web3';


class WalletStore {

	public provider?: any = new Web3.providers.HttpProvider('https://mainnet.infura.io/v3/77a0f6647eb04f5ca1409bba62ae9128')
	private store?: RootStore
	public currentBlock?: number;
	public gasPrices?: any;

	constructor(store: RootStore) {
		this.store = store

		extendObservable(this, {
			provider: this.provider,
			currentBlock: undefined,
			gasPrices: {}
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
		this.store?.contracts.fetchCollection()
	});

	sendMethod = action((address: string, methodName: string, inputs: any = [], abi: any, callback: (contract: PromiEvent<Contract>) => void) => {
		const web3 = new Web3(this.store!.wallet!.provider)
		const contract = new web3.eth.Contract(abi, address)

		const method = contract.methods[methodName](...inputs)

		estimateAndSend(web3, method, this.store!.wallet!.provider.selectedAddress, (transaction: PromiEvent<Contract>) => {
			callback(transaction)
		})

	});


}

export default WalletStore;