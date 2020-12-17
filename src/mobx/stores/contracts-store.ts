import { extendObservable, action } from 'mobx';
import Web3 from 'web3'
import BatchCall from "web3-batch-call";
import { batchConfig, getTokenAddresses, walletMethods, erc20Methods } from "../utils/web3"
import BigNumber from 'bignumber.js';
import { RootStore } from '../store';
import _ from 'lodash';
import { reduceBatchResult, reduceGraphResult } from '../utils/reducers';
import { graphQuery } from '../utils/helpers';
import { collections } from '../../config/constants';

// const MAX_UINT256 = new BigNumber(2)
// 	.pow(256)
// 	.minus(1)
// 	.toFixed(0);

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


class ContractsStore {
	private store!: RootStore;

	public tokens?: any;
	public vaults?: any;
	public geysers?: any;

	constructor(store: RootStore) {
		this.store = store

		extendObservable(this, {
			vaults: undefined,
			tokens: undefined,
			geysers: undefined,
		});
	}

	fetchCollection = action(() => {
		const { wallet, uiState } = this.store
		const { collection } = uiState

		if (!collection)
			return

		const { vaults, geysers } = collection.contracts


		// currently supports vaults & geysers ]
		let batchContracts: any[] = []
		_.mapKeys(collection.configs, (config: any, namespace: string) => {
			let methods = walletMethods(config.walletMethods, wallet)

			batchContracts.push(batchConfig(namespace, wallet, collection.contracts[namespace], methods, config.abi))
		})

		console.log(batchContracts, 'batchContracts')

		batchCall.execute(batchContracts)
			.then((result: any) => {
				let keyedResult = _.groupBy(result, 'namespace')

				_.mapKeys(keyedResult, (value: any, key: string) => {
					if (key === "vaults")
						this.vaults = _.keyBy(reduceBatchResult(value), 'address')
					else
						this.geysers = _.keyBy(reduceBatchResult(value), 'address')
				})

				if (!("vaults" in keyedResult))
					this.vaults = {}
				if (!("geysers" in keyedResult))
					this.geysers = {}

				console.log(this.vaults, this.geysers, keyedResult)

				this.fetchTokens()
			})
			.catch((error: any) => console.log(error))

	});

	fetchTokens = action(() => {
		const { wallet, uiState } = this.store
		const { collection } = uiState

		let tokenMappings: any[] = []
		_.mapKeys(collection.configs, (config: any, namespace: string) => {
			console.log(namespace, config)
			let addresses = namespace === "vaults" ? this.vaults : this.geysers
			let tokens = getTokenAddresses(addresses, config)
			tokenMappings = _.concat(tokenMappings, tokens)
		})

		this.tokens = _.keyBy(_.mergeWith(tokenMappings, 'address'), 'address')
		let tokenAddresses = _.compact(tokenMappings.map((token: any) => token.address))

		let graphQueries = tokenAddresses.map((address: string) => graphQuery(address)); //TODO: make 1 query

		// Prepare batch call
		let allowances: any[] = []
		let readMethods: any[] = []
		erc20Methods(wallet, this.vaults, allowances, readMethods);

		console.log(tokenAddresses)

		const tokenBatch: Promise<any> = batchCall.execute([batchConfig('tokens', wallet, tokenAddresses, readMethods, ERC20.abi, true)])

		Promise.all([tokenBatch, ...graphQueries])
			.then((result: any[]) => {

				let tokenContracts = _.keyBy(reduceBatchResult(result.shift()), 'address')
				let tokenGraph = _.keyBy(_.compact(reduceGraphResult(result)), 'address')

				this.tokens = _.mapValues(this.tokens, (value: any, address: string) => _.assign(value, tokenContracts[address], tokenGraph[address]))

				// console.log(this.tokens, tokenContracts, tokenGraph)
			})
	});



	// increaseAllowance = action(() => {
	// 	const underlying = this.vault[this.collection.config.config.underlying]

	// 	if (!underlying)
	// 		return

	// 	const underlyingAsset = this.assets[underlying]

	// 	const web3 = new Web3(this.store!.wallet!.provider)
	// 	const underlyingContract = new web3.eth.Contract(ERC20.abi, underlying)
	// 	const method = underlyingContract.methods.approve(this.vault.address, underlyingAsset.totalSupply)

	// 	estimateAndSend(web3, method, this.store!.wallet!.provider.selectedAddress, (transaction: PromiEvent<Contract>) => {
	// 		transaction
	// 			.on('transactionHash', (hash: string) => {
	// 				this.errorMessage = hash
	// 			}).on('receipt', (reciept: any) => {
	// 				this.errorMessage = "Allowance increased."
	// 			}).catch((error: any) => this.errorMessage = error.message)

	// 	})
	// });

}

export default ContractsStore;