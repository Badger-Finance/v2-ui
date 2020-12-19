import { extendObservable, action } from 'mobx';
import Web3 from 'web3'
import BatchCall from "web3-batch-call";
import { batchConfig, getTokenAddresses, erc20Methods, contractMethods } from "../utils/web3"
import BigNumber from 'bignumber.js';
import { RootStore } from '../store';
import _, { Collection } from 'lodash';
import { reduceBatchResult, reduceCurveResult, reduceGraphResult } from '../utils/reducers';
import { curvePrice, graphQuery } from '../utils/helpers';
import { collections } from '../../config/constants';

const WBTC_ADDRESS = "0x2260fac5e5542a773aa44fbcfedf7c193bc2c599"
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

	public tokens?: any;	// inputs to vaults and geysers
	public vaults?: any;	// vaults contract data
	public geysers?: any; 	// geyser contract data

	constructor(store: RootStore) {
		this.store = store

		extendObservable(this, {
			vaults: undefined,
			tokens: undefined,
			geysers: undefined,
		});
	}

	fetchCollection = action(() => {
		// state and wallet are separate stores
		const { wallet, uiState } = this.store
		const { collection } = uiState

		// only fetch the active collection.
		if (!collection)
			return

		// grab respective config files
		const { vaults, geysers } = collection.contracts

		// create batch configs for vaults and geysers
		let batchContracts: any[] = _.map(collection.configs,
			(config: any, namespace: string) =>
				batchConfig(namespace,
					wallet,
					collection.contracts[namespace],
					contractMethods(config, wallet),
					config.abi)
		)

		// execute batch calls to web3 (infura most likely)
		batchCall.execute(batchContracts)
			.then((result: any) => {

				// sort result into hash {vaults:[], geysers:[]}
				let keyedResult = _.groupBy(result, 'namespace')

				// store vaults & geysers as hashes {contract_address: data}
				_.mapKeys(keyedResult, (value: any, key: string) => {
					if (key === "vaults")
						this.vaults = _.keyBy(reduceBatchResult(value), 'address')
					else
						this.geysers = _.keyBy(reduceBatchResult(value), 'address')
				})

				// clear empty data
				if (!("vaults" in keyedResult))
					this.vaults = {}
				if (!("geysers" in keyedResult))
					this.geysers = {}

				// fetch input/outputs information
				this.fetchTokens()

			})
			.catch((error: any) => console.log(error))

	});

	fetchTokens = action(() => {
		const { wallet, uiState } = this.store
		const { collection } = uiState

		// grab underlying and yielding token addresses as {address:, contract:}
		let tokenMappings: any = _.map(collection.configs, (config: any, namespace: string) => {
			if (namespace === undefined)
				return
			let addresses = namespace === "vaults" ? this.vaults : this.geysers
			let tokens = getTokenAddresses(addresses, config)
			return tokens
		})

		// reduce to {address:{address:,contract:}}
		tokenMappings = _.mergeWith(_.keyBy(_.flatten(tokenMappings), 'address'))

		//generate curve prices
		let curveMappings = _.keyBy(
			_.zip(collection.curveBtcPools.contracts, collection.curveBtcPools.symbols, collection.curveBtcPools.names)
				.map((token: any[]) => {
					return _.zipObject(['address', 'symbol', 'name'], token)
				})
			, 'address')
		tokenMappings = { ...tokenMappings, ...curveMappings }


		// set or update token list
		this.tokens = !this.tokens ? tokenMappings : _.mapValues(this.tokens, (value: any, address: string) => _.assign(value, tokenMappings[address]))

		// pull raw addresses
		let tokenAddresses = _.compact(
			_.map(
				tokenMappings,
				(token: any) => token.address).concat(WBTC_ADDRESS))

		// prepare curve query
		const curveBtcPrices = collection.curveBtcPools.contracts.map(
			(address: string, index: number) =>
				curvePrice(
					address,
					collection.curveBtcPools.prices[index]));

		// prepare graph query
		const graphQueries = tokenAddresses.map(
			(address: string) => graphQuery(address));

		// prepare web3 query
		let readBatches: Promise<any>[] = _.map(tokenMappings, (tokenMap: any) => {
			let ercMethods = erc20Methods(
				wallet,
				tokenMap,
				_.compact(
					_.concat(
						collection.contracts.vaults,
						collection.contracts.geysers)))

			return batchCall.execute([
				batchConfig('tokens', wallet, tokenAddresses, ercMethods, ERC20.abi, true)])
		});

		// execute promises
		Promise.all([...curveBtcPrices, ...readBatches, ...graphQueries])
			.then((result: any[]) => {
				let tokenContracts = _.keyBy(reduceBatchResult(result.slice(4, readBatches.length + 4)[0]), 'address')
				let tokenGraph = _.keyBy(_.compact(reduceGraphResult(result.slice(readBatches.length + 4))), 'address')
				let curveBtcPrices = _.keyBy(reduceCurveResult(result.slice(0, 3), collection.curveBtcPools.contracts, tokenGraph[WBTC_ADDRESS]), 'address')

				this.tokens = _.mapValues(
					this.tokens,
					(value: any, address: string) =>
						_.assign(
							value,
							tokenGraph[address],
							curveBtcPrices[address],
							tokenContracts[address]))
			})
	});



	batchDeposit = action((underlyingToken: string) => {
		const { wallet, uiState } = this.store
		const { collection } = uiState

		let vault = this.vaults[this.tokens[underlyingToken].contract]
		let geyser = this.geysers[this.tokens[vault.address].contract]


		// approve underlying
		// approve sett tokens
		// deposit remaining underlying
		// deposit remaining sett tokens


	});

	batchWithdraw = action((underlyingToken: string) => {
		const { wallet, uiState } = this.store
		const { collection } = uiState

		let vault = this.vaults[this.tokens[underlyingToken].contract]
		let geyser = this.geysers[this.tokens[vault.address].contract]


	});

	updateVaults = action((vaults: any) => {
		this.vaults = _.mapValues(
			this.vaults,
			(value: any, address: string) =>
				_.assign(
					value,
					vaults[address]))

	});
	updateGeysers = action((geysers: any) => {
		console.log(geysers)
		this.geysers = _.mapValues(
			this.geysers,
			(value: any, address: string) =>
				_.assign(
					value,
					geysers[address]))

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