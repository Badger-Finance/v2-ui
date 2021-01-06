import { extendObservable, action, observe } from 'mobx';
import Web3 from 'web3'
import BatchCall from "web3-batch-call";
import { batchConfig, erc20Methods, contractMethods, estimateAndSend } from "../utils/web3"
import BigNumber from 'bignumber.js';
import { RootStore } from '../store';
import _ from 'lodash';
import { erc20BatchConfig, generateCurveTokens, reduceBatchResult, reduceContractConfig, reduceMethodConfig, reduceContractsToTokens, reduceCurveResult, reduceGeyserSchedule, reduceGraphResult, reduceGrowth, reduceMasterChefResults } from '../reducers/contractReducers';
import { jsonQuery, graphQuery, growthQuery, secondsToBlocks, inCurrency, chefQueries, vanillaQuery } from '../utils/helpers';
import { PromiEvent } from 'web3-core';
import { Contract } from 'web3-eth-contract';
import async from 'async';
import { reduceClaims } from '../reducers/statsReducers';
import { token as diggToken } from '../../config/system/digg';
import { curveTokens } from '../../config/system/tokens';
import { EMPTY_DATA, ERC20, MIN_ETH_BALANCE, START_BLOCK, WBTC_ADDRESS } from '../../config/constants';
import { rewards as rewardsConfig, geysers as geyserConfigs } from '../../config/system/settSystem';
import { rewards as airdropsConfig } from '../../config/system/settSystem';



const infuraProvider = new Web3.providers.HttpProvider('https://mainnet.infura.io/v3/77a0f6647eb04f5ca1409bba62ae9128')
const options = {
	web3: new Web3(infuraProvider),
	etherscan: {
		apiKey: "NXSHKK6D53D3R9I17SR49VX8VITQY7UC6P",
		delayTime: 300
	},
}

var batchCall = new BatchCall(options);

class ContractsStore {
	private store!: RootStore;

	public tokens?: any;	// inputs to vaults and geysers
	public vaults?: any;	// vaults contract data
	public geysers?: any; 	// geyser contract data
	public rebase?: any; 	// rebase contract data

	public badgerTree?: any; 	// geyser contract data
	public airdrops?: any; 	// geyser contract data

	constructor(store: RootStore) {
		this.store = store

		extendObservable(this, {
			vaults: undefined,
			tokens: undefined,
			geysers: undefined,
			rebase: undefined,
			badgerTree: undefined,
			airdrops: undefined
		});

		this.fetchContracts()

		observe(this as any, "tokens", (change: any) => {
			if (!!change.oldValue) {
				this.calculateVaultGrowth()
				this.calculateGeyserRewards()
				// this.fetchRebase()
			}
		})
		observe(this.store.wallet, "currentBlock", (change: any) => {
			if (!!change.oldValue) {
				this.fetchContracts()
				// this.fetchRebase()
			}
		})

		observe(this.store.wallet as any, "connectedAddress", (change: any) => {
			let newOptions = {
				web3: new Web3(this.store.wallet.provider),
				etherscan: {
					apiKey: "NXSHKK6D53D3R9I17SR49VX8VITQY7UC6P",
					delayTime: 300
				},
			}
			batchCall = new BatchCall(newOptions);

			this.fetchSettRewards()
			this.fetchContracts()
		})
	}

	updateVaults = action((vaults: any) => {
		this.vaults = _.defaultsDeep(vaults, this.vaults)
	});
	updateTokens = action((tokens: any) => {
		this.tokens = _.defaultsDeep(tokens, this.tokens)
	});
	updateGeysers = action((geysers: any) => {
		this.geysers = _.defaultsDeep(geysers, this.geysers)
	});

	fetchContracts = action(() => {
		// state and wallet are separate stores
		const { wallet, uiState } = this.store
		const { connectedAddress } = this.store.wallet

		// grab respective config files
		const { vaults, geysers } = require('config/system/settSystem.ts')

		this.updateVaults(reduceContractConfig(vaults, connectedAddress && { connectedAddress }))
		this.updateGeysers(reduceContractConfig(geysers, connectedAddress && { connectedAddress }))

		// create batch configs for vaults and geysers
		const vaultBatch: any[] = _.map(vaults,
			(config: any) => {
				return batchConfig('vaults',
					config.contracts,
					!!config.methods ? reduceMethodConfig(config.methods, !!connectedAddress && { connectedAddress }) : [],
					config.abi)
			})

		const geyserBatch: any[] = _.map(geysers,
			(config: any) => {
				return batchConfig('geysers',
					config.contracts,
					!!config.methods ? reduceMethodConfig(config.methods, !!connectedAddress && { connectedAddress }) : [],
					config.abi)
			})

		let batchContracts = _.concat(vaultBatch, geyserBatch)

		// console.log(batchContracts, batchCall)

		// execute batch calls to web3 (infura most likely)
		batchCall.execute(batchContracts)
			.then((result: any) => {

				// sort result into hash {vaults:[], geysers:[]}
				let keyedResult = _.groupBy(result, 'namespace')
				// store vaults & geysers as hashes {contract_address: data}
				_.mapKeys(keyedResult, (value: any, key: string) => {
					if (key === "vaults")
						this.updateVaults(_.keyBy(reduceBatchResult(value), 'address'))
					else
						this.updateGeysers(_.keyBy(reduceBatchResult(value), 'address'))
				})

				// console.log(this.vaults)

				// fetch input/outputs information
				this.fetchTokens()

			})
			.catch((error: any) => console.log(error))

	});

	fetchTokens = action(() => {
		const { wallet, uiState } = this.store
		const { connectedAddress } = this.store.wallet

		// reduce to {address:{address:,contract:}}
		this.updateTokens(reduceContractsToTokens({ ...this.vaults, ...this.geysers }))
		// console.log(this.tokens)

		//generate curve tokens
		this.updateTokens(generateCurveTokens())

		// prepare curve query
		const curveBtcPrices = curveTokens.contracts.map(
			(address: string, index: number) => jsonQuery(curveTokens.priceEndpoints[index]))

		// prepare price queries
		const graphQueries = _.flatten(_.map(this.tokens,
			(token: any, address: string) => graphQuery(token)));

		// prepare batch call
		let ercConfigs = erc20BatchConfig(this.tokens, connectedAddress)
		let ercBatch = !!ercConfigs ? [batchCall.execute(ercConfigs)] : []

		// execute promises
		Promise.all([...curveBtcPrices, ...ercBatch, ...graphQueries])
			.then((result: any[]) => {
				let tokenContracts = _.keyBy(reduceBatchResult(_.flatten(result.slice(3, 4))), 'address')
				let tokenGraph = _.keyBy(_.compact(reduceGraphResult(result.slice(4))), 'address')
				let curveBtcPrices = _.keyBy(reduceCurveResult(result.slice(0, 3), curveTokens.contracts, this.tokens, tokenGraph[WBTC_ADDRESS]), 'address')

				this.updateTokens(_.defaultsDeep(curveBtcPrices, tokenGraph, tokenContracts, this.tokens))
				// this.updateTokens(tokenGraph)
				// this.updateTokens(curveBtcPrices)

				// console.log(this.tokens, tokenContracts, tokenGraph, curveBtcPrices)
			})
	});

	fetchSettRewards = action(() => {
		const { provider, connectedAddress } = this.store.wallet
		const { collection } = this.store.uiState

		if (!connectedAddress)
			return

		let web3 = new Web3(provider)
		let rewardsTree = new web3.eth.Contract(rewardsConfig.abi, rewardsConfig.contract)
		let checksumAddress = Web3.utils.toChecksumAddress(connectedAddress)

		rewardsTree.methods
			.merkleContentHash()
			.call()
			.then((merkleHash: any) => {
				jsonQuery(`${rewardsConfig.endpoint}/rewards/${rewardsConfig.network}/${merkleHash}/${checksumAddress}`)
					.then((merkleProof: any) => {
						if (!merkleProof.error) {
							rewardsTree.methods.getClaimedFor(connectedAddress, rewardsConfig.tokens)
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

	fetchAirdrops = action(() => {
		const { provider, connectedAddress } = this.store.wallet
		const { collection } = this.store.uiState

		if (!connectedAddress)
			return

		let web3 = new Web3(provider)
		let rewardsTree = new web3.eth.Contract(airdropsConfig.abi, airdropsConfig.contract)
		let checksumAddress = Web3.utils.toChecksumAddress(connectedAddress)

		rewardsTree.methods
			.merkleContentHash()
			.call()
			.then((merkleHash: any) => {
				jsonQuery(`${airdropsConfig.endpoint}/hunt/${checksumAddress}`)
					.then((merkleProof: any) => {

						if (!merkleProof.error) {
							rewardsTree.methods.isClaimed(merkleProof.index)
								.call()
								.then((isClaimed: boolean) => {
									this.airdrops = {
										badger: !isClaimed ? new BigNumber(Web3.utils.hexToNumberString(merkleProof.amount)).multipliedBy(1e18) : new BigNumber(0),
										merkleProof
									}
								})
						}
					})

			})
	});


	depositAndStake = action((vault: any, amount: BigNumber) => {
		const { tokens, geysers } = this
		const { setTxStatus, queueNotification } = this.store.uiState

		const underlying = tokens[vault[vault.underlyingKey]]
		const wrapped = tokens[vault.address]
		const geyser = geysers[wrapped.contract]

		let depositedTokens = !!vault.balanceOf ? vault.balanceOf.multipliedBy(vault.getPricePerFullShare.dividedBy(1e18)) : new BigNumber(0)

		console.log(underlying.balanceOf.plus(depositedTokens).dividedBy(1e18).toString(), amount.dividedBy(1e18).toString())
		// ensure balance is valid
		if (!amount || amount.isNaN() || amount.lte(0) || amount.gt(underlying.balanceOf.plus(depositedTokens)))
			return queueNotification("Please enter a valid amount", 'error')

		// calculate amount to deposit
		let wrappedAmount = new BigNumber(0);
		let methodSeries: any = []

		if (amount.gt(depositedTokens))
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
		const { setTxStatus, queueNotification } = this.store.uiState

		let wrapped = tokens[geyser[geyser.underlyingKey]]
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
		const { setTxStatus, queueNotification } = this.store.uiState

		let underlying = tokens[vault[vault.underlyingKey]]
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
		const { provider, ethBalance, gasPrices, connectedAddress } = this.store.wallet
		const { queueNotification, gasPrice, setTxStatus } = this.store.uiState

		if (!connectedAddress)
			return

		// if (ethBalance?.lt(MIN_ETH_BALANCE))
		// 	return queueNotification("Your account is low on ETH, you may need to top up to claim.", 'warning')

		let web3 = new Web3(provider)
		let rewardsTree = new web3.eth.Contract(rewardsConfig.abi, rewardsConfig.contract)
		const method = rewardsTree.methods.claim(
			merkleProof.tokens,
			merkleProof.cumulativeAmounts,
			merkleProof.index,
			merkleProof.cycle,
			merkleProof.proof)

		queueNotification(`Sign the transaction to claim your earnings`, "info")
		if (stake)
			queueNotification(`You will need to approve 3 transactions in order to wrap & stake your assets`, "info")
		let badgerAmount = new BigNumber(this.badgerTree.claims[0]).multipliedBy(1e18)
		estimateAndSend(web3, gasPrices[gasPrice], method, connectedAddress, (transaction: PromiEvent<Contract>) => {
			transaction
				.on('transactionHash', (hash: string) => {
					queueNotification(`Claim submitted with hash: ${hash}`, "info")
				}).on('receipt', (reciept: any) => {
					queueNotification(`Rewards claimed.`, "success")
					this.fetchSettRewards()
					this.fetchContracts()

					if (stake) {
						let badgerVault = this.vaults["0x19d97d8fa813ee2f51ad4b4e04ea08baf4dffc28"]
						this.depositAndStake(badgerVault, badgerAmount)
					}
				}).catch((error: any) => {
					this.fetchContracts()
					queueNotification(error.message, "error")
					setTxStatus('error')
				})

		})
	});
	claimAirdrops = action((stake: boolean = false) => {
		const { merkleProof } = this.airdrops
		const { provider, ethBalance, gasPrices, connectedAddress } = this.store.wallet
		const { queueNotification, gasPrice, setTxStatus } = this.store.uiState

		if (!connectedAddress)
			return

		// if (ethBalance?.lt(MIN_ETH_BALANCE))
		// 	return queueNotification("Your account is low on ETH, you may need to top up to claim.", 'warning')

		let web3 = new Web3(provider)
		let rewardsTree = new web3.eth.Contract(airdropsConfig.abi, airdropsConfig.contract)
		const method = rewardsTree.methods.claim(
			merkleProof.index,
			connectedAddress,
			merkleProof.amount,
			merkleProof.proof)

		queueNotification(`Sign the transaction to claim your airdrop`, "info")
		let badgerAmount = this.airdrops.badger
		estimateAndSend(web3, gasPrices[gasPrice], method, connectedAddress, (transaction: PromiEvent<Contract>) => {
			transaction
				.on('transactionHash', (hash: string) => {
					queueNotification(`Claim submitted with hash: ${hash}`, "info")
				}).on('receipt', (reciept: any) => {
					queueNotification(`Rewards claimed.`, "success")
					this.fetchSettRewards()
					this.fetchContracts()

					if (stake) {
						let badgerVault = this.vaults["0x19d97d8fa813ee2f51ad4b4e04ea08baf4dffc28"]
						this.depositAndStake(badgerVault, badgerAmount)
					}
				}).catch((error: any) => {
					this.fetchContracts()
					queueNotification(error.message, "error")
					setTxStatus('error')
				})

		})
	});



	increaseAllowance = action((underlyingAsset: any, callback: (err: any, result: any) => void) => {
		let { queueNotification, setTxStatus } = this.store.uiState
		let { provider, connectedAddress } = this.store.wallet

		const web3 = new Web3(provider)
		const underlyingContract = new web3.eth.Contract(ERC20.abi, underlyingAsset.address)
		const method = underlyingContract.methods.approve(underlyingAsset.contract, underlyingAsset.totalSupply)

		queueNotification(`Sign the transaction to allow Badger to spend your ${underlyingAsset.symbol}`, "info")

		estimateAndSend(web3, this.store.wallet.gasPrices[this.store.uiState.gasPrice], method, connectedAddress, (transaction: PromiEvent<Contract>) => {
			transaction
				.on('transactionHash', (hash: string) => {
					queueNotification(`Transaction submitted with hash: ${hash}`, "info")
				}).on('receipt', (reciept: any) => {
					queueNotification(`${underlyingAsset.symbol} allowance increased.`, "success")
					this.fetchContracts()
					callback(null, {})
				}).catch((error: any) => {
					this.fetchContracts()
					queueNotification(error.message, "error")
					setTxStatus('error')
				})

		})
	});

	depositGeyser = action((geyser: any, amount: BigNumber, callback: (err: any, result: any) => void) => {
		let { queueNotification, setTxStatus } = this.store.uiState
		let { provider, connectedAddress } = this.store.wallet

		const underlyingAsset = this.tokens[geyser[geyser.underlyingKey]]

		const web3 = new Web3(provider)
		const geyserContract = new web3.eth.Contract(geyser.abi, geyser.address)
		const method = geyserContract.methods.stake(amount.toFixed(0), EMPTY_DATA)

		queueNotification(`Sign the transaction to stake ${inCurrency(amount, 'eth', true)} ${underlyingAsset.symbol}`, "info")

		estimateAndSend(web3, this.store.wallet.gasPrices[this.store.uiState.gasPrice], method, connectedAddress, (transaction: PromiEvent<Contract>) => {
			transaction
				.on('transactionHash', (hash: string) => {
					queueNotification(`Deposit submitted with hash: ${hash}`, "info")
				}).on('receipt', (reciept: any) => {
					queueNotification(`Successfully deposited ${inCurrency(amount, 'eth', true)} ${underlyingAsset.symbol}`, "success")
					this.fetchContracts()
					callback(null, {})
				}).catch((error: any) => {
					this.fetchContracts()
					queueNotification(error.message, "error")
					setTxStatus('error')
				})
		})
	});
	withdrawGeyser = action((geyser: any, amount: BigNumber, callback: (err: any, result: any) => void) => {
		let { queueNotification, setTxStatus } = this.store.uiState
		let { provider, connectedAddress } = this.store.wallet

		const underlyingAsset = this.tokens[geyser[geyser.underlyingKey]]

		const web3 = new Web3(provider)
		const geyserContract = new web3.eth.Contract(geyser.abi, geyser.address)
		const method = geyserContract.methods.unstake(amount.toFixed(0), EMPTY_DATA)

		queueNotification(`Sign the transaction to unstake ${inCurrency(amount, 'eth', true)} ${underlyingAsset.symbol}`, "info")

		estimateAndSend(web3, this.store.wallet.gasPrices[this.store.uiState.gasPrice], method, connectedAddress, (transaction: PromiEvent<Contract>) => {
			transaction
				.on('transactionHash', (hash: string) => {
					queueNotification(`Transaction submitted with hash: ${hash}`, "info")
				}).on('receipt', (reciept: any) => {
					queueNotification(`Successfully unstaked ${inCurrency(amount, 'eth', true)} ${underlyingAsset.symbol}`, "success")
					this.fetchContracts()
					callback(null, {})
				}).catch((error: any) => {
					this.fetchContracts()
					queueNotification(error.message, "error")
					setTxStatus('error')
				})
		})
	});


	depositVault = action((vault: any, amount: BigNumber, all: boolean = false, callback: (err: any, result: any) => void) => {
		let { queueNotification, setTxStatus } = this.store.uiState
		let { provider, connectedAddress } = this.store.wallet

		const underlyingAsset = this.tokens[vault[vault.underlyingKey]]

		const web3 = new Web3(provider)
		const underlyingContract = new web3.eth.Contract(vault.abi, vault.address)

		let method = underlyingContract.methods.deposit(amount.toFixed(0))
		if (all)
			method = underlyingContract.methods.depositAll()
		queueNotification(`Sign the transaction to wrap ${inCurrency(amount, 'eth', true)} ${underlyingAsset.symbol}`, "info")

		estimateAndSend(web3, this.store.wallet.gasPrices[this.store.uiState.gasPrice], method, connectedAddress, (transaction: PromiEvent<Contract>) => {
			transaction
				.on('transactionHash', (hash: string) => {
					queueNotification(`Deposit submitted with hash: ${hash}`, "info")
				}).on('receipt', (reciept: any) => {
					queueNotification(`Successfully deposited ${inCurrency(amount, 'eth', true)} ${underlyingAsset.symbol}`, "success")
					this.fetchContracts()
					callback(null, {})
				}).catch((error: any) => {
					this.fetchContracts()
					queueNotification(error.message, "error")
					setTxStatus('error')
				})
		})
	});
	withdrawVault = action((vault: any, amount: BigNumber, all: boolean = false, callback: (err: any, result: any) => void) => {
		let { setTxStatus, queueNotification } = this.store.uiState
		let { provider, connectedAddress } = this.store.wallet

		const underlyingAsset = this.tokens[vault[vault.underlyingKey]]

		const web3 = new Web3(provider)
		const underlyingContract = new web3.eth.Contract(vault.abi, vault.address)

		let method = underlyingContract.methods.withdraw(amount.toFixed(0))
		if (all)
			method = underlyingContract.methods.withdrawAll()

		queueNotification(`Sign the transaction to unwrap ${inCurrency(amount, 'eth', true)} ${underlyingAsset.symbol}`, "info")

		estimateAndSend(web3, this.store.wallet.gasPrices[this.store.uiState.gasPrice], method, connectedAddress, (transaction: PromiEvent<Contract>) => {
			transaction
				.on('transactionHash', (hash: string) => {
					queueNotification(`Withdraw submitted with hash: ${hash}`, "info")
				}).on('receipt', (reciept: any) => {
					queueNotification(`Successfully withdrew ${inCurrency(amount, 'eth', true)} ${underlyingAsset.symbol}`, "success")
					this.fetchContracts()
					callback(null, {})
				}).catch((error: any) => {
					this.fetchContracts()
					queueNotification(error.message, "error")
					setTxStatus('error')
				})
		})
	});


	calculateVaultGrowth = action(() => {
		let { vaults, tokens } = this.store.contracts
		let { currentBlock } = this.store.wallet

		if (!currentBlock)
			return

		let periods = [
			Math.max(currentBlock - Math.floor(secondsToBlocks(60 * 5)), START_BLOCK), 				// 5 minutes ago
			Math.max(currentBlock - Math.floor(secondsToBlocks(1 * 24 * 60 * 60)), START_BLOCK), 	// day
			Math.max(currentBlock - Math.floor(secondsToBlocks(7 * 24 * 60 * 60)), START_BLOCK),	// week
			Math.max(currentBlock - Math.floor(secondsToBlocks(30 * 24 * 60 * 60)), START_BLOCK),	// month
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
				this.updateVaults(vaultGrowth)
			})


	})

	calculateGeyserRewards = action(() => {
		let { geysers, tokens, vaults } = this
		let { collection } = this.store.uiState
		let { currentBlock } = this.store.wallet

		let rewardToken = tokens[rewardsConfig.tokens[0]]

		if (!tokens || !rewardToken)
			return

		const timestamp = new BigNumber(new Date().getTime() / 1000.0)
		let geyserRewards =
			_.mapValues(geysers,
				(geyser: any, address: string) => {
					let schedule = geyser['getUnlockSchedulesFor']
					let underlyingVault = vaults[geyser[geyser.underlyingKey]]

					if (!schedule || !underlyingVault)
						return {}

					let rawToken = tokens[underlyingVault[underlyingVault.underlyingKey]]

					// sum rewards in current period
					// todo: break out to actual durations
					let rewardSchedule = reduceGeyserSchedule(timestamp, schedule);

					return _.mapValues(rewardSchedule, (reward: any) => {

						return !!rawToken.ethValue && reward.multipliedBy(rewardToken.ethValue)
							.dividedBy(rawToken.ethValue
								.multipliedBy(underlyingVault.balance)
								.multipliedBy(underlyingVault.getPricePerFullShare.dividedBy(1e18)))

					})
				})

		this.updateGeysers(geyserRewards)

		// grab sushi APYs
		_.map(geyserConfigs, (config: any) => {
			if (!!config.growthEndpoints) {
				let masterChef = chefQueries(config.contracts, this.geysers, config.growthEndpoints[0])
				let xSushi = vanillaQuery(config.growthEndpoints[1])

				let rewardToken = tokens[rewardsConfig.tokens[2]]
				let xRewardToken = tokens[rewardsConfig.tokens[3]]

				Promise.all([...masterChef, xSushi]).then((results: any) => {

					let sushiRewards = reduceMasterChefResults(results.slice(0, 2), config.contracts, this.tokens, this.vaults)
					let xAPY = parseFloat(results[2]['APY'])

					this.updateGeysers(_.mapValues(sushiRewards, (reward: any, geyserAddress: string) => {
						let geyser = geysers[geyserAddress]
						if (!geyser)
							return

						let vault = vaults[geyser[geyser.underlyingKey]]

						if (!vault)
							return

						let token = tokens[vault[vault.underlyingKey]]

						let slpBalance = new BigNumber(reward.slpBalance)

						delete reward.address
						delete reward.slpBalance

						return {
							sushiRewards: _.mapValues(reward, (rewardsInSushi: BigNumber, period: string) => {
								if (!rewardToken.ethValue)
									return

								// period will be day, week, month
								// rewards in sushi are amount of sushi earned in that period

								// xAPY contains xSUSHI apy

								let numerator = rewardToken.ethValue
									.multipliedBy(rewardsInSushi).dividedBy(1e18)

								let sushiAPY = numerator
									.dividedBy(vault.balance.multipliedBy(token.ethValue.dividedBy(1e18)).multipliedBy(slpBalance.dividedBy(token.totalSupply)))


								return sushiAPY
							})
						}
					}))
				})
			}
		})


	})


}

export default ContractsStore;