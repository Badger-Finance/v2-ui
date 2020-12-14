import { extendObservable, action } from 'mobx';
import Web3 from 'web3'
import { OpenSeaPort, Network } from 'opensea-js'
import { OpenSeaAsset, OrderSide } from 'opensea-js/lib/types';
import { TimerSharp } from '@material-ui/icons';
import BatchCall from "web3-batch-call";
import { collections } from '../../config/constants';
import { reduceVaults } from './reducers';
import _ from 'lodash'
import { estimateAndSend } from "./web3"
import BigNumber from 'bignumber.js';
import { PromiEvent } from 'web3-core';
import { Contract } from 'web3-eth-contract';


const MAX_UINT256 = new BigNumber(2)
	.pow(256)
	.minus(1)
	.toFixed(0);

const ERC20 = require("../../config/abis/ERC20.json")

const infuraProvider = new Web3.providers.HttpProvider('https://mainnet.infura.io/v3/77a0f6647eb04f5ca1409bba62ae9128')
const options = {
	web3: new Web3(infuraProvider),
	etherscan: {
		apiKey: "NXSHKK6D53D3R9I17SR49VX8VITQY7UC6P",
		delayTime: 300
	},
}

const batchCall = new BatchCall(options);


class AppStore {
	public title?: string;
	public user?: any;
	public collection?: any;
	public vault?: any;
	public assets?: any;
	public provider?: any;
	public errorMessage?: String;


	constructor() {
		const provider = new Web3.providers.HttpProvider('https://mainnet.infura.io/v3/77a0f6647eb04f5ca1409bba62ae9128')

		extendObservable(this, {
			title: 'Common Yield',
			user: undefined,
			collection: undefined,
			vault: undefined,
			assets: {},
			provider: undefined,
			errorMessage: undefined,
		});
	}

	setTitle = action((title: string | undefined) => {
		this.title = title;
	});

	setProvider = action((provider: any) => {
		this.provider = provider;
		!!this.collection && this.fetchCollection(this.collection.config.id)
		this.fetchBalancesAndAllowances();
	});
	refresh = action(() => {
		this.setProvider(this.provider)
	});


	fetchCollection = action((collection: string, callback?: () => any) => {

		let theCollection = collections.find((c) => c.id == collection)

		let addressMethods = !!theCollection!.addressMethods && !!this.provider &&
			theCollection!.addressMethods!.map((method: string) => {
				return {
					name: method,
					args: [
						this.provider.selectedAddress
					]
				}
			});

		const contracts = [
			{
				namespace: "vaults",
				abi: theCollection!.abi,
				addresses: theCollection!.vaults,
				allReadMethods: true,
				groupByNamespace: true,
				logging: false,

			} as any
		];
		if (!!addressMethods)
			contracts[0].readMethods = addressMethods

		batchCall.execute(contracts)
			.then((result: any) => {
				const vaults = reduceVaults(result)

				let config = (!!this.collection && this.collection.config.id == theCollection!.id) ? this.collection.config : theCollection
				this.collection = { vaults, config }

				this.fetchBalancesAndAllowances(callback)

			})
			.catch((error: any) => console.log(error))

	});

	fetchBalancesAndAllowances = action((callback?: () => any) => {

		let addresses = this.collection.vaults.map((vault: any) => [vault[this.collection.config.config.underlying!], vault[this.collection.config.config.yielding!]]);
		addresses = _.uniq(_.flatten(addresses))

		const allowances = this.collection.vaults.map((vault: any) => {
			return {
				name: "allowance",
				args: [
					!!this.provider ? this.provider.selectedAddress : '0x0000000000000000000000000000000000000000',
					vault.address,
				]
			}
		});

		const balances = [
			{
				namespace: "balances",
				abi: ERC20.abi,
				addresses,
				allReadMethods: true,
				groupByNamespace: true,
				logging: false,
				readMethods: [{
					name: "balanceOf",
					args: [
						!!this.provider ? this.provider.selectedAddress : '0x0000000000000000000000000000000000000000'
					]
				},
				...allowances]
			}
		];

		batchCall.execute(balances)
			.then((result: any) => {
				console.log(result)
				const bals = reduceVaults(result)

				this.assets = _.keyBy(bals, 'address')

				!!callback && callback()

			}).catch((error: any) => this.errorMessage = error.message)


	});

	fetchVault = action((collection: string, id: string) => {
		console.log("fetching")
		if (!this.collection)
			this.fetchCollection(collection, () => {
				this.vault = this.collection.vaults.find((v: any) => v.address == id)
			})
		else
			this.vault = this.collection.vaults.find((v: any) => v.address == id)

	});

	callMethod = action((address: string, methodName: string, inputs: any = [], abi: any, callback: (contract: PromiEvent<Contract>) => void) => {
		const web3 = new Web3(this.provider)
		const contract = new web3.eth.Contract(abi, address)

		const method = contract.methods[methodName](...inputs)

		estimateAndSend(web3, method, this.provider.selectedAddress, (transaction: PromiEvent<Contract>) => {
			callback(transaction)
		})

	});

	increaseAllowance = action(() => {
		const underlying = this.vault[this.collection.config.config.underlying]

		if (!underlying)
			return

		const underlyingAsset = this.assets[underlying]

		const web3 = new Web3(this.provider)
		const underlyingContract = new web3.eth.Contract(ERC20.abi, underlying)
		const method = underlyingContract.methods.approve(this.vault.address, underlyingAsset.totalSupply)

		estimateAndSend(web3, method, this.provider.selectedAddress, (transaction: PromiEvent<Contract>) => {
			transaction
				.on('transactionHash', (hash: string) => {
					this.errorMessage = hash
				}).on('receipt', (reciept: any) => {
					this.errorMessage = "Allowance increased."
				}).catch((error: any) => this.errorMessage = error.message)

		})
	});

	// UI
	addFilter = action((filter: string) => {
		this.collection.config.config.table.push(filter)
	});
	removeFilter = action((filter: string) => {
		this.collection.config.config.table = this.collection.config.config.table.filter((item: string) => item != filter)
	});
	addAction = action((method: string) => {
		this.collection.config.config.actions.push(method)
	});
	removeAction = action((method: string) => {
		this.collection.config.config.actions = this.collection.config.config.actions.filter((item: string) => item != method)
	});




}

export default AppStore;