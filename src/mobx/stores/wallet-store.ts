import { extendObservable, action } from 'mobx';
import Web3 from 'web3'

import { Store } from 'mobx-router';
import { RootStore } from '../store';
import { PromiEvent } from 'web3-core';
import { Contract } from 'web3-eth-contract';
import { estimateAndSend } from '../utils/web3';


class WalletStore {

	public provider?: any;
	private store?: RootStore

	constructor(store: RootStore) {
		const provider = new Web3.providers.HttpProvider('https://mainnet.infura.io/v3/77a0f6647eb04f5ca1409bba62ae9128')
		this.store = store

		extendObservable(this, {
			provider
		});
	}

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