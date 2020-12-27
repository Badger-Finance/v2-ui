import { extendObservable, action, observe } from 'mobx';
import Web3 from 'web3'
import BatchCall from "web3-batch-call";
import { batchConfig, getTokenAddresses, erc20Methods, contractMethods, estimateAndSend } from "../utils/web3"
import BigNumber from 'bignumber.js';
import { RootStore } from '../store';
import _, { Collection } from 'lodash';
import { reduceBatchResult, reduceCurveResult, reduceGeyserSchedule, reduceGraphResult, reduceGrowth } from '../reducers/contractReducers';
import { jsonQuery, graphQuery, growthQuery, secondsToBlocks, inCurrency } from '../utils/helpers';
import { collections } from '../../config/constants';
import { PromiEvent } from 'web3-core';
import { Contract } from 'web3-eth-contract';
import async from 'async';
import { reduceClaims } from '../reducers/statsReducers';

const WBTC_ADDRESS = "0x2260fac5e5542a773aa44fbcfedf7c193bc2c599"
const ERC20 = require("../../config/abis/ERC20.json")
const START_BLOCK = 11381216
const EMPTY_DATA = '0x'
const MIN_ETH_BALANCE = new BigNumber(0.01 * 1e18);

const infuraProvider = new Web3.providers.HttpProvider('https://mainnet.infura.io/v3/77a0f6647eb04f5ca1409bba62ae9128')
const options = {
	web3: new Web3(infuraProvider),
	etherscan: {
		apiKey: "NXSHKK6D53D3R9I17SR49VX8VITQY7UC6P",
		delayTime: 300
	},
}

let batchCall = new BatchCall(options);

class ContractsStore {
	private store!: RootStore;

	public tokens?: any;	// inputs to vaults and geysers
	public vaults?: any;	// vaults contract data
	public geysers?: any; 	// geyser contract data

	public badgerTree?: any; 	// geyser contract data

	constructor(store: RootStore) {
		this.store = store

		extendObservable(this, {
			vaults: undefined,
			tokens: undefined,
			geysers: undefined,
			badgerTree: undefined
		});

		observe(this as any, "tokens", (change: any) => {
			if (!!change.oldValue) {
				this.calculateGrowth()
				this.calculateGeyserRewards()
				// console.log(
				// 	_.map(this.geysers, (geyser: any) => (geyser.day / 1).toString()).join(','),
				// 	_.map(this.tokens, (geyser: any) => (geyser.ethValue / 1).toString()).join(','),
				// )
			}
		})
		observe(this.store.wallet as any, "provider", (change: any) => {
			const newOptions = {
				web3: new Web3(this.store.wallet.provider),
				etherscan: {
					apiKey: "NXSHKK6D53D3R9I17SR49VX8VITQY7UC6P",
					delayTime: 300
				},
			}
			batchCall = new BatchCall(newOptions);

			this.fetchSettRewards()
			this.fetchCollection()
		})
		observe(this.store.wallet as any, "connectedAddress", (change: any) => {
			this.fetchCollection()
		})
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
		tokenMappings = _.keyBy(_.flatten(tokenMappings), 'address')

		//generate curve tokens
		let curveMappings = _.keyBy(
			_.zip(collection.curveBtcPools.contracts, collection.curveBtcPools.symbols, collection.curveBtcPools.names)
				.map((token: any[]) => {
					return _.zipObject(['address', 'symbol', 'name'], token)
				})
			, 'address')
		tokenMappings = _.assign(tokenMappings, curveMappings)

		// set or update token list
		this.tokens = !this.tokens ? tokenMappings : _.mapValues(this.tokens, (value: any, address: string) => _.assign(value, tokenMappings[address]))

		// pull raw addresses
		let tokenAddresses = _.compact(
			_.map(
				tokenMappings,
				(token: any) => token.address).concat(WBTC_ADDRESS))

		// prepare curve query
		const curveBtcPrices = collection.curveBtcPools.contracts.map(
			(address: string, index: number) => jsonQuery(collection.curveBtcPools.prices[index]))

		// prepare graph query
		const graphQueries = tokenAddresses.map(
			(address: string) => graphQuery(address));

		// prepare web3 query
		let readBatches: Promise<any>[] = _.map(tokenMappings, (tokenMap: any) => {
			// let ercMethods = erc20Methods(
			// 	wallet,
			// 	tokenMap)

			return batchCall.execute([
				batchConfig('tokens', wallet, [tokenMap.address], erc20Methods(
					wallet,
					tokenMap, []), ERC20.abi, true)])
		});

		// execute promises
		Promise.all([...curveBtcPrices, ...readBatches, ...graphQueries])
			.then((result: any[]) => {
				let tokenContracts = _.keyBy(reduceBatchResult(_.flatten(result.slice(3, readBatches.length + 3))), 'address')
				let tokenGraph = _.keyBy(_.compact(reduceGraphResult(result.slice(readBatches.length + 3))), 'address')
				let curveBtcPrices = _.keyBy(reduceCurveResult(result.slice(0, 3), collection.curveBtcPools.contracts, tokenContracts, tokenGraph[WBTC_ADDRESS]), 'address')

				this.tokens = _.mapValues(
					this.tokens,
					(value: any, address: string) => {
						return _.assign(
							value,
							tokenGraph[address],
							curveBtcPrices[address],
							tokenContracts[address])
					})
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

	calculateGrowth = action(() => {
		let { vaults, tokens } = this.store.contracts
		let { currentBlock } = this.store.wallet

		if (!currentBlock)
			return

		let periods = [
			Math.max(currentBlock - secondsToBlocks(60 * 5), START_BLOCK), 				// 5 minutes ago
			Math.max(currentBlock - secondsToBlocks(1 * 24 * 60 * 60), START_BLOCK), 	// day
			Math.max(currentBlock - secondsToBlocks(7 * 24 * 60 * 60), START_BLOCK),	// week
			Math.max(currentBlock - secondsToBlocks(30 * 24 * 60 * 60), START_BLOCK),	// month
			START_BLOCK, 	// start
		]

		const growthPromises = periods.map(growthQuery)

		let tvl = new BigNumber(0)

		Promise.all(growthPromises)
			.then((result: any) => {

				// save the growth
				let vaultGrowth = reduceGrowth(result, periods)
				// this.stats._vaultGrowth = vaultGrowth.total

				// extend vaults with new growth statistics.. pretty hairy maybe we keep this is the UI-state
				this.updateVaults(vaultGrowth.vaults)
			})

	})

	calculateGeyserRewards = action(() => {
		let { geysers, tokens, vaults } = this
		let { collection } = this.store.uiState
		let { currentBlock } = this.store.wallet

		let { method, tokens: rewardTokens } = collection.configs.geysers.rewards
		const rewardToken = tokens[rewardTokens[0]]

		if (!tokens || !rewardToken.ethValue)
			return

		const timestamp = new BigNumber(new Date().getTime() / 1000.0)
		this.updateGeysers(
			_.mapValues(geysers,
				(geyser: any, address: string) => {
					let schedule = geyser[method]

					let underlyingVault = vaults[geyser[collection.configs.geysers.underlying]]

					let rawToken = tokens[underlyingVault[collection.configs.vaults.underlying]]
					let underlyingToken = tokens[underlyingVault.address]

					// sum rewards in current period
					// todo: break out to actual durations
					let rewards = reduceGeyserSchedule(timestamp, schedule);

					// console.log(rewards, underlyingVault.totalSupply.toString(), underlyingVault.ethValue.toString(), rawToken.totalSupply.toString(), rawToken.ethValue.toString())
					// turn bignumbers into percentages
					return _.mapValues(rewards, (reward: any) => {
						return !!rawToken.ethValue && reward.multipliedBy(rewardToken.ethValue)
							.dividedBy(rawToken.ethValue.multipliedBy(rawToken.totalSupply))

					})
				}))

	})

	fetchSettRewards = action(() => {
		const { provider } = this.store.wallet
		const { collection } = this.store.uiState
		const { merkle, proofNetwork, tokens } = this.store.uiState.collection.configs.geysers.rewards

		if (!provider.selectedAddress)
			return

		let web3 = new Web3(provider)
		let rewardsTree = new web3.eth.Contract(merkle.abi, merkle.hashContract)
		let checksumAddress = Web3.utils.toChecksumAddress(provider.selectedAddress)

		rewardsTree.methods
			.merkleContentHash()
			.call()
			.then((merkleHash: any) => {
				jsonQuery(`${merkle.proofEndpoint}/rewards/${merkle.proofNetwork}/${merkleHash}/${checksumAddress}`)
					.then((merkleProof: any) => {
						if (!merkleProof.error) {
							rewardsTree.methods.getClaimedFor(provider.selectedAddress, tokens)
								.call()
								.then((claimedRewards: any[]) => {
									let claims = reduceClaims(merkleProof, claimedRewards)
									this.badgerTree = {
										cycle: parseInt(merkleProof.cycle, 16),
										claims,
										merkleProof
									}
								})
						}
					})

			})
	});


	depositAndStake = action((vault: any, amount: BigNumber) => {
		const { tokens, geysers } = this
		const { collection, setTxStatus, queueNotification } = this.store.uiState

		const underlying = tokens[vault.token]
		const wrapped = tokens[vault.address]
		const geyser = geysers[wrapped.contract]

		// ensure balance is valid
		if (amount.isNaN() || amount.lte(0) || amount.gt(underlying.balanceOf.plus(wrapped.balanceOf)))
			return queueNotification("Please enter a valid amount", 'error')

		// calculate amount to deposit
		let wrappedAmount = new BigNumber(0);
		let methodSeries: any = []

		if (amount.gt(vault.balanceOf))
			wrappedAmount = vault.balanceOf
		else
			wrappedAmount = amount

		let underlyingAmount = amount.minus(wrappedAmount)

		// if we need to wrap assets, make sure we have allowance
		if (underlyingAmount.gt(0)) {
			if (underlying.allowance.lt(underlyingAmount))
				methodSeries.push((callback: any) => this.increaseAllowance(underlying, callback))

			methodSeries.push((callback: any) => this.depositVault(
				vault,
				underlyingAmount,
				amount.gte(underlying.balanceOf),
				callback))
		}

		// if we need to deposit wrapped assets, make sure we have allowance
		if (wrapped.allowance.lt(amount))
			methodSeries.push((callback: any) => this.increaseAllowance(wrapped, callback))

		methodSeries.push((callback: any) => this.depositGeyser(geyser, amount, callback))
		setTxStatus('pending')
		async.series(methodSeries, (err: any, results: any) => {
			console.log(err, results)
			setTxStatus(!!err ? 'error' : 'success')
		})

	});

	unstakeAndUnwrap = action((geyser: any, amount: BigNumber) => {
		const { tokens, vaults } = this
		const { collection, setTxStatus, queueNotification } = this.store.uiState

		let wrapped = tokens[geyser[collection.configs.geysers.underlying]]
		let vault = vaults[wrapped.address]
		let underlying = tokens[vaults[wrapped.address].token]

		// ensure balance is valid
		if (amount.isNaN() || amount.lte(0) || amount.gt(geyser.totalStakedFor))
			return queueNotification("Please enter a valid amount", 'error')

		// calculate amount to withdraw
		let wrappedAmount = amount;
		let methodSeries: any = []

		// if we need to wrap assets, make sure we have allowance
		methodSeries.push((callback: any) => this.withdrawGeyser(
			geyser,
			wrappedAmount,
			callback))

		methodSeries.push((callback: any) => this.withdrawVault(
			vault,
			wrappedAmount,
			wrappedAmount.gte(wrapped.balanceOf),
			callback))
		setTxStatus('pending')
		async.series(methodSeries, (err: any, results: any) => {
			console.log(err, results)
			setTxStatus(!!err ? 'error' : 'success')
		})

	});

	unwrap = action((vault: any, amount: BigNumber) => {
		const { tokens } = this
		const { collection, setTxStatus, queueNotification } = this.store.uiState

		let underlying = tokens[vault.token]
		let wrapped = tokens[vault.address]

		// ensure balance is valid
		if (amount.isNaN() || !wrapped.balanceOf || amount.gt(wrapped.balanceOf))
			return queueNotification("Please enter a valid amount", 'error')

		// calculate amount to withdraw
		let wrappedAmount = amount;
		let methodSeries: any = []

		// withdraw
		methodSeries.push((callback: any) => this.withdrawVault(
			vault,
			wrappedAmount,
			wrappedAmount.gte(wrapped.balanceOf),
			callback))
		setTxStatus('pending')
		async.series(methodSeries, (err: any, results: any) => {
			console.log(err, results)
			setTxStatus(!!err ? 'error' : 'success')
		})

	});


	claimGeysers = action((stake: boolean = false) => {
		const { merkleProof } = this.badgerTree
		const { provider, ethBalance, gasPrices } = this.store.wallet
		const { collection, queueNotification, gasPrice, setTxStatus } = this.store.uiState
		const { merkle, proofNetwork, tokens } = this.store.uiState.collection.configs.geysers.rewards

		if (!provider.selectedAddress)
			return

		if (ethBalance?.lt(MIN_ETH_BALANCE))
			return queueNotification("Your account is low on ETH, you may need to top up to claim.", 'warning')

		let web3 = new Web3(provider)
		let rewardsTree = new web3.eth.Contract(merkle.abi, merkle.hashContract)
		const method = rewardsTree.methods.claim(
			merkleProof.tokens,
			merkleProof.cumulativeAmounts,
			merkleProof.index,
			merkleProof.cycle,
			merkleProof.proof)

		queueNotification(`Sign the transaction to claim your earnings`, "info")
		let badgerAmount = new BigNumber(this.badgerTree.claims[0]).multipliedBy(1e18)
		estimateAndSend(web3, gasPrices[gasPrice], method, provider.selectedAddress, (transaction: PromiEvent<Contract>) => {
			transaction
				.on('transactionHash', (hash: string) => {
					queueNotification(`Claim submitted with hash: ${hash}`, "info")
				}).on('receipt', (reciept: any) => {
					queueNotification(`Rewards claimed.`, "success")
					this.fetchSettRewards()
					this.fetchCollection()

					if (stake) {
						let badgerVault = this.vaults["0x19d97d8fa813ee2f51ad4b4e04ea08baf4dffc28"]
						this.depositAndStake(badgerVault, badgerAmount)
					}
				}).catch((error: any) => {
					this.fetchCollection()
					queueNotification(error.message, "error")
					setTxStatus('error')
				})

		})



	});

	updateVaults = action((vaults: any) => {
		this.vaults = !this.vaults ? vaults : _.mapValues(
			this.vaults,
			(value: any, address: string) =>
				_.assignIn(
					vaults[address], value
				))
	});

	updateGeysers = action((geysers: any) => {
		this.geysers = !this.geysers ? geysers : _.mapValues(
			this.geysers,
			(value: any, address: string) =>
				_.assignIn(
					geysers[address], value,
				))

	});

	increaseAllowance = action((underlyingAsset: any, callback: (err: any, result: any) => void) => {
		let { collection, queueNotification, setTxStatus } = this.store.uiState
		let { provider, connectedAddress } = this.store.wallet


		const web3 = new Web3(provider)
		const underlyingContract = new web3.eth.Contract(ERC20.abi, underlyingAsset.address)
		const method = underlyingContract.methods.approve(underlyingAsset.contract, underlyingAsset.totalSupply)

		queueNotification(`Sign the transaction to allow ${underlyingAsset.contract} to spend your ${underlyingAsset.address}`, "warning")

		estimateAndSend(web3, this.store.wallet.gasPrices[this.store.uiState.gasPrice], method, connectedAddress, (transaction: PromiEvent<Contract>) => {
			transaction
				.on('transactionHash', (hash: string) => {
					queueNotification(`Transaction submitted with hash: ${hash}`, "info")
				}).on('receipt', (reciept: any) => {
					queueNotification(`${underlyingAsset.symbol} allowance increased.`, "success")
					this.fetchCollection()
					callback(null, {})
				}).catch((error: any) => {
					this.fetchCollection()
					queueNotification(error.message, "error")
					setTxStatus('error')
				})

		})
	});

	depositGeyser = action((geyser: any, amount: BigNumber, callback: (err: any, result: any) => void) => {
		let { collection, queueNotification, setTxStatus } = this.store.uiState
		let { provider, connectedAddress } = this.store.wallet

		const underlyingAsset = this.tokens[geyser[collection.configs.geysers.underlying]]

		const web3 = new Web3(provider)
		const geyserContract = new web3.eth.Contract(collection.configs.geysers.abi, geyser.address)
		const method = geyserContract.methods.stake(amount, EMPTY_DATA)

		queueNotification(`Sign the transaction to stake ${inCurrency(amount, 'eth', true)} ${underlyingAsset.symbol}`, "warning")

		estimateAndSend(web3, this.store.wallet.gasPrices[this.store.uiState.gasPrice], method, connectedAddress, (transaction: PromiEvent<Contract>) => {
			transaction
				.on('transactionHash', (hash: string) => {
					queueNotification(`Deposit submitted with hash: ${hash}`, "info")
				}).on('receipt', (reciept: any) => {
					queueNotification(`Successfully deposited ${inCurrency(amount, 'eth', true)} ${underlyingAsset.symbol}`, "success")
					this.fetchCollection()
					callback(null, {})
				}).catch((error: any) => {
					this.fetchCollection()
					queueNotification(error.message, "error")
					setTxStatus('error')
				})
		})
	});
	withdrawGeyser = action((geyser: any, amount: BigNumber, callback: (err: any, result: any) => void) => {
		let { collection, queueNotification, setTxStatus } = this.store.uiState
		let { provider, connectedAddress } = this.store.wallet

		const underlyingAsset = this.tokens[geyser[collection.configs.geysers.underlying]]

		const web3 = new Web3(provider)
		const geyserContract = new web3.eth.Contract(collection.configs.geysers.abi, geyser.address)
		const method = geyserContract.methods.unstake(amount, EMPTY_DATA)

		queueNotification(`Sign the transaction to unstake ${inCurrency(amount, 'eth', true)} ${underlyingAsset.symbol}`, "warning")

		estimateAndSend(web3, this.store.wallet.gasPrices[this.store.uiState.gasPrice], method, connectedAddress, (transaction: PromiEvent<Contract>) => {
			transaction
				.on('transactionHash', (hash: string) => {
					queueNotification(`Deposit submitted with hash: ${hash}`, "info")
				}).on('receipt', (reciept: any) => {
					queueNotification(`Successfully unstaked ${inCurrency(amount, 'eth', true)} ${underlyingAsset.symbol}`, "success")
					this.fetchCollection()
					callback(null, {})
				}).catch((error: any) => {
					this.fetchCollection()
					queueNotification(error.message, "error")
					setTxStatus('error')
				})
		})
	});


	depositVault = action((vault: any, amount: BigNumber, all: boolean = false, callback: (err: any, result: any) => void) => {
		let { collection, queueNotification, setTxStatus } = this.store.uiState
		let { provider, connectedAddress } = this.store.wallet

		const underlyingAsset = this.tokens[vault[collection.configs.vaults.underlying]]

		const web3 = new Web3(provider)
		const underlyingContract = new web3.eth.Contract(collection.configs.vaults.abi, vault.address)

		let method = underlyingContract.methods.deposit(amount)
		if (all)
			method = underlyingContract.methods.depositAll()
		queueNotification(`Sign the transaction to wrap ${inCurrency(amount, 'eth', true)} ${underlyingAsset.symbol}`, "warning")

		estimateAndSend(web3, this.store.wallet.gasPrices[this.store.uiState.gasPrice], method, connectedAddress, (transaction: PromiEvent<Contract>) => {
			transaction
				.on('transactionHash', (hash: string) => {
					queueNotification(`Deposit submitted with hash: ${hash}`, "info")
				}).on('receipt', (reciept: any) => {
					queueNotification(`Successfully deposited ${inCurrency(amount, 'eth', true)} ${underlyingAsset.symbol}`, "success")
					this.fetchCollection()
					callback(null, {})
				}).catch((error: any) => {
					this.fetchCollection()
					queueNotification(error.message, "error")
					setTxStatus('error')
				})
		})
	});
	withdrawVault = action((vault: any, amount: BigNumber, all: boolean = false, callback: (err: any, result: any) => void) => {
		let { collection, setTxStatus, queueNotification } = this.store.uiState
		let { provider, connectedAddress } = this.store.wallet

		const underlyingAsset = this.tokens[vault[collection.configs.vaults.underlying]]

		const web3 = new Web3(provider)
		const underlyingContract = new web3.eth.Contract(collection.configs.vaults.abi, vault.address)

		let method = underlyingContract.methods.withdraw(amount)
		if (all)
			method = underlyingContract.methods.withdrawAll()

		queueNotification(`Sign the transaction to unwrap ${inCurrency(amount, 'eth', true)} ${underlyingAsset.symbol}`, "warning")

		estimateAndSend(web3, this.store.wallet.gasPrices[this.store.uiState.gasPrice], method, connectedAddress, (transaction: PromiEvent<Contract>) => {
			transaction
				.on('transactionHash', (hash: string) => {
					queueNotification(`Withdraw submitted with hash: ${hash}`, "info")
				}).on('receipt', (reciept: any) => {
					queueNotification(`Successfully withdrew ${inCurrency(amount, 'eth', true)} ${underlyingAsset.symbol}`, "success")
					this.fetchCollection()
					callback(null, {})
				}).catch((error: any) => {
					this.fetchCollection()
					queueNotification(error.message, "error")
					setTxStatus('error')
				})
		})
	});

}

export default ContractsStore;