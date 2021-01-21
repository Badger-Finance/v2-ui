import { extendObservable, action, observe } from 'mobx';
import Web3 from 'web3';
import BatchCall from 'web3-batch-call';
import { AbiItem } from 'web3-utils';
import { batchConfig, estimateAndSend } from '../utils/web3';
import BigNumber from 'bignumber.js';
import { RootStore } from '../store';
import _ from 'lodash';
import {
	reduceBatchResult,
	reduceContractConfig,
	reduceCurveResult,
	reduceGraphResult,
	reduceGrowth,
	Vault,
	Geyser,
	Token,
	reduceGrowthQueryConfig,
	Growth,
	reduceXSushiROIResults,
	reduceSushiAPIResults,
} from '../reducers/contractReducers';
import { jsonQuery, graphQuery, growthQuery, secondsToBlocks, inCurrency, vanillaQuery } from '../utils/helpers';
import { PromiEvent } from 'web3-core';
import { Contract } from 'web3-eth-contract';
import async from 'async';

import { curveTokens, names, symbols } from '../../config/system/tokens';
import {
	EMPTY_DATA,
	ERC20,
	RPC_URL,
	START_BLOCK,
	START_TIME,
	WBTC_ADDRESS,
	XSUSHI_ADDRESS,
} from '../../config/constants';
import { geyserBatches, vaultBatches } from '../../config/system/contracts';
import { decimals as tokenDecimals, tokenBatches } from '../../config/system/tokens';
import { formatAmount } from 'mobx/reducers/statsReducers';

const infuraProvider = new Web3.providers.HttpProvider(RPC_URL);
const options = {
	web3: new Web3(infuraProvider),
	etherscan: {
		apiKey: 'NXSHKK6D53D3R9I17SR49VX8VITQY7UC6P',
		delayTime: 300,
	},
};

let batchCall = new BatchCall(options);

class ContractsStore {
	private store!: RootStore;

	public tokens?: any; // inputs to vaults and geysers
	public vaults?: any; // vaults contract data
	public geysers?: any; // geyser contract data

	constructor(store: RootStore) {
		this.store = store;

		extendObservable(this, {
			vaults: {} as { string: Vault },
			tokens: {} as { string: Token },
			geysers: {} as { string: Geyser },
		});

		this.fetchContracts();
		this.fetchContracts();

		// observe(this as any, 'tokens', (change: any) => {
		// 	if (!!change.oldValue) {
		// 		this.calculateVaultGrowth();
		// 	}
		// });
		observe(this.store.wallet, 'currentBlock', (change: any) => {
			if (!!change.oldValue) {
				this.fetchContracts();
			}
		});

		observe(this.store.wallet as any, 'connectedAddress', (change: any) => {
			this.updateProvider();
		});
		if (!!this.store.wallet.connectedAddress) this.updateProvider();
	}

	updateProvider = action(() => {
		let newOptions = {
			web3: new Web3(this.store.wallet.provider),
			etherscan: {
				apiKey: 'NXSHKK6D53D3R9I17SR49VX8VITQY7UC6P',
				delayTime: 300,
			},
		};
		batchCall = new BatchCall(newOptions);

		this.store.airdrops.fetchAirdrops();
		if (this._fetchingContracts) this._pendingChangeOfAddress = true;
		else this.fetchContracts();
	});

	private _fetchingContracts: boolean = false;
	private _pendingChangeOfAddress: boolean = false;
	fetchContracts = action(() => {
		if (this._fetchingContracts) return;
		this._fetchingContracts = true;
		async.series(
			[
				(callback: any) => this.fetchTokens(callback),
				(callback: any) => this.fetchVaults(callback),
				(callback: any) => this.fetchGeysers(callback),
			],
			(err: any, result: any) => {
				this._fetchingContracts = false;
				if (this._pendingChangeOfAddress) {
					this._pendingChangeOfAddress = false;
					this.fetchContracts();
				}
			},
		);
	});

	fetchTokens = action((callback: any) => {
		const { connectedAddress } = this.store.wallet;

		let { defaults, batchCall: batch } = reduceContractConfig(
			tokenBatches,
			!!connectedAddress && { connectedAddress },
		);
		// prepare curve price query
		const curveQueries = curveTokens.contracts.map((address: string, index: number) =>
			jsonQuery(curveTokens.priceEndpoints[index]),
		);

		// prepare price queries
		const graphQueries = _.flatten(_.map(tokenBatches[0].contracts, (address: string) => graphQuery(address)));
		console.log(batch);
		Promise.all([batchCall.execute(batch), ...curveQueries, ...graphQueries])
			.then((result: any[]) => {
				const tokenContracts = _.keyBy(reduceBatchResult(_.flatten(result.slice(0, 1))), 'address');
				const tokenPrices = _.keyBy(
					_.compact(reduceGraphResult(result.slice(1 + curveQueries.length))),
					'address',
				);
				const curvePrices = _.keyBy(
					reduceCurveResult(
						result.slice(1, 1 + curveQueries.length),
						curveTokens.contracts,
						this.tokens,
						tokenPrices[WBTC_ADDRESS],
					),
					'address',
				);
				const tokens = _.compact(
					_.values(
						_.defaultsDeep(
							curvePrices,
							tokenPrices,
							tokenContracts,
							_.mapValues(symbols, (value: string, address: string) => ({ address, symbol: value })),
							_.mapValues(names, (value: string, address: string) => ({ address, name: value })),
						),
					),
				);

				tokens.forEach((contract: any) => {
					let token = this.getOrCreateToken(contract.address);
					token.update(contract);
				});

				callback();
			})
			.catch((error: any) => process.env.NODE_ENV !== 'production' && console.log(error));
	});
	fetchVaults = action((callback: any) => {
		const { connectedAddress, currentBlock } = this.store.wallet;
		const sushiBatches = vaultBatches[1];

		let { defaults, batchCall: batch } = reduceContractConfig(
			vaultBatches,
			connectedAddress && { connectedAddress },
		);

		const { growthQueries, periods } = reduceGrowthQueryConfig(currentBlock);

		const xSushiQuery = vanillaQuery(sushiBatches.growthEndpoints![1]);
		const masterChefQuery = vanillaQuery(
			sushiBatches.growthEndpoints![2].concat(tokenBatches[0].contracts.join(';')),
		);

		Promise.all([batchCall.execute(batch), ...growthQueries, masterChefQuery, xSushiQuery])
			.then((queryResult: any[]) => {
				let result = reduceBatchResult(queryResult[0]);
				let masterChefResult: any = queryResult.slice(growthQueries.length + 1, growthQueries.length + 2);
				let xSushiResult: any = queryResult.slice(growthQueries.length + 2);

				console.log('master chef result: ', masterChefResult[0]);
				console.log('xSushi result: ', xSushiResult);

				const vaultGrowth = reduceGrowth(queryResult.slice(1, growthQueries.length + 1), periods, START_TIME);

				const xROI: any = reduceXSushiROIResults(xSushiResult['weekly_APY']);
				const newSushiRewards = reduceSushiAPIResults(masterChefResult[0], sushiBatches.contracts);
				console.log('new sushi rewards return: ', newSushiRewards);
				result.forEach((contract: any) => {
					let tokenAddress = contract[defaults[contract.address].underlyingKey];
					if (!this.tokens[tokenAddress]) {
						return console.log(contract.address, this.tokens);
					}
					let vault = this.getOrCreateVault(
						contract.address,
						this.tokens[tokenAddress],
						defaults[contract.address].abi,
					);

					let growth =
						!!vaultGrowth[contract.address] &&
						_.mapValues(vaultGrowth[contract.address], (tokens: BigNumber, period: string) => ({
							amount: tokens,
							token: this.tokens[tokenAddress],
						}));

					let xSushiGrowth =
						!!newSushiRewards[contract.address] &&
						_.mapValues(newSushiRewards[contract.address], (tokens: BigNumber, period: string) => ({
							amount: tokens,
							token: this.tokens[XSUSHI_ADDRESS],
						}));

					vault.update(
						_.defaults(contract, defaults[contract.address], { growth: _.compact([growth, xSushiGrowth]) }),
					);
				});
				callback();
				console.log(this.vaults);
			})
			.catch((error: any) => process.env.NODE_ENV !== 'production' && console.log(error));
	});

	fetchGeysers = action((callback: any) => {
		const { connectedAddress } = this.store.wallet;

		let { defaults, batchCall: batch } = reduceContractConfig(
			geyserBatches,
			connectedAddress && { connectedAddress },
		);

		batchCall
			.execute(batch)
			.then((infuraResult: any[]) => {
				let result = reduceBatchResult(infuraResult);
				result.forEach((contract: any) => {
					let vaultAddress = contract[defaults[contract.address].underlyingKey];
					let geyser: Geyser = this.getOrCreateGeyser(
						contract.address,
						this.vaults[vaultAddress],
						defaults[contract.address].abi,
					);
					geyser.update(_.defaults(contract, defaults[contract.address]));
				});
				callback();
			})
			.catch((error: any) => process.env.NODE_ENV !== 'production' && console.log(error));
	});

	getOrCreateToken = action((address: string) => {
		if (!this.tokens[address]) {
			return (this.tokens[address] = new Token(this.store, address, tokenDecimals[address]));
		} else {
			return this.tokens[address];
		}
	});
	getOrCreateVault = action((address: string, token?: Token, abi?: any) => {
		if (!this.vaults[address]) {
			return (this.vaults[address] = new Vault(this.store, address, tokenDecimals[address], token!, abi));
		} else {
			return this.vaults[address];
		}
	});
	getOrCreateGeyser = action((address: string, vault?: Vault, abi?: any) => {
		if (!this.vaults[address]) {
			return (this.geysers[address] = new Geyser(this.store, address, vault!, abi));
		} else {
			return this.geysers[address];
		}
	});

	deposit = action((vault: Vault, amount: BigNumber) => {
		const { tokens, vaults } = this;
		const { setTxStatus, queueNotification } = this.store.uiState;

		if (!amount || amount.isNaN() || amount.lte(0) || amount.gt(vault.underlyingToken.balance))
			return queueNotification('Please enter a valid amount', 'error');

		let underlyingAmount = amount.multipliedBy(10 ** vault.underlyingToken.decimals);

		const methodSeries: any = [];

		async.parallel(
			[(callback: any) => this.getAllowance(vault.underlyingToken, vault.address, callback)],
			(err: any, allowances: any) => {
				// if we need to wrap assets, make sure we have allowance
				if (underlyingAmount.gt(allowances[0]))
					methodSeries.push((callback: any) =>
						this.increaseAllowance(vault.underlyingToken, vault.address, callback),
					);

				methodSeries.push((callback: any) =>
					this.depositVault(vault, underlyingAmount, amount.gte(vault.underlyingToken.balance), callback),
				);

				setTxStatus('pending');
				async.series(methodSeries, (err: any, results: any) => {
					console.log(err, results);
					setTxStatus(!!err ? 'error' : 'success');
				});
			},
		);
	});
	stake = action((vault: Vault, amount: BigNumber) => {
		const { tokens, vaults } = this;
		const { setTxStatus, queueNotification } = this.store.uiState;

		if (!amount || amount.isNaN() || amount.lte(0) || amount.gt(vault.balance))
			return queueNotification('Please enter a valid amount', 'error');

		let wrappedAmount = amount.multipliedBy(10 ** vault.decimals);

		const methodSeries: any = [];

		async.parallel(
			[(callback: any) => this.getAllowance(vault, vault.geyser.address, callback)],
			(err: any, allowances: any) => {
				// if we need to wrap assets, make sure we have allowance
				if (wrappedAmount.gt(allowances[0]))
					methodSeries.push((callback: any) => this.increaseAllowance(vault, vault.geyser.address, callback));

				methodSeries.push((callback: any) => this.stakeGeyser(vault.geyser, wrappedAmount, callback));

				setTxStatus('pending');
				async.series(methodSeries, (err: any, results: any) => {
					console.log(err, results);
					setTxStatus(!!err ? 'error' : 'success');
				});
			},
		);
	});
	unstake = action((vault: Vault, amount: BigNumber) => {
		const { tokens, vaults } = this;
		const { setTxStatus, queueNotification } = this.store.uiState;

		if (!amount || amount.isNaN() || amount.lte(0) || amount.gt(vault.geyser.balance))
			return queueNotification('Please enter a valid amount', 'error');

		let wrappedAmount = amount.multipliedBy(10 ** vault.decimals);

		const methodSeries: any = [];

		methodSeries.push((callback: any) => this.unstakeGeyser(vault.geyser, wrappedAmount, callback));

		setTxStatus('pending');
		async.series(methodSeries, (err: any, results: any) => {
			console.log(err, results);
			setTxStatus(!!err ? 'error' : 'success');
		});
	});

	withdraw = action((vault: any, amount: BigNumber) => {
		const { tokens } = this;
		const { setTxStatus, queueNotification } = this.store.uiState;

		// ensure balance is valid
		if (amount.isNaN() || !vault.balance || amount.gt(vault.balance))
			return queueNotification('Please enter a valid amount', 'error');

		// calculate amount to withdraw
		const wrappedAmount = amount.multipliedBy(10 ** vault.decimals);
		const methodSeries: any = [];

		// withdraw
		methodSeries.push((callback: any) =>
			this.withdrawVault(vault, wrappedAmount, wrappedAmount.gte(vault.balance), callback),
		);
		setTxStatus('pending');
		async.series(methodSeries, (err: any, results: any) => {
			console.log(err, results);
			setTxStatus(!!err ? 'error' : 'success');
		});
	});

	increaseAllowance = action((underlyingAsset: any, contract: string, callback: (err: any, result: any) => void) => {
		const { queueNotification, setTxStatus } = this.store.uiState;
		const { provider, connectedAddress } = this.store.wallet;

		const web3 = new Web3(provider);
		const underlyingContract = new web3.eth.Contract(ERC20.abi as AbiItem[], underlyingAsset.address);
		const method = underlyingContract.methods.approve(contract, underlyingAsset.totalSupply.toFixed(0));

		queueNotification(`Sign the transaction to allow Badger to spend your ${underlyingAsset.symbol}`, 'info');

		estimateAndSend(
			web3,
			this.store.wallet.gasPrices[this.store.uiState.gasPrice],
			method,
			connectedAddress,
			(transaction: PromiEvent<Contract>) => {
				transaction
					.on('transactionHash', (hash) => {
						queueNotification(`Transaction submitted.`, 'info', hash);
					})
					.on('receipt', () => {
						queueNotification(`${underlyingAsset.symbol} allowance increased.`, 'success');
						this.fetchContracts();
						callback(null, {});
					})
					.catch((error: any) => {
						this.fetchContracts();
						queueNotification(error.message, 'error');
						setTxStatus('error');
					});
			},
		);
	});

	getAllowance = action((underlyingAsset: any, spender: string, callback: (err: any, result: any) => void) => {
		const {} = this.store.uiState;
		const { provider, connectedAddress } = this.store.wallet;

		const web3 = new Web3(provider);
		const underlyingContract = new web3.eth.Contract(ERC20.abi as AbiItem[], underlyingAsset.address);
		const method = underlyingContract.methods.allowance(connectedAddress, spender);

		method.call().then((result: any) => {
			callback(null, result);
		});
	});

	stakeGeyser = action((geyser: any, amount: BigNumber, callback: (err: any, result: any) => void) => {
		const { queueNotification, setTxStatus } = this.store.uiState;
		const { provider, connectedAddress } = this.store.wallet;

		const underlyingAsset = this.tokens[geyser[geyser.underlyingKey]];

		const web3 = new Web3(provider);
		const geyserContract = new web3.eth.Contract(geyser.abi, geyser.address);
		const method = geyserContract.methods.stake(amount.toFixed(0, BigNumber.ROUND_DOWN), EMPTY_DATA);

		queueNotification(
			`Sign the transaction to stake ${inCurrency(amount, 'eth', true)} ${underlyingAsset.symbol}`,
			'info',
		);

		estimateAndSend(
			web3,
			this.store.wallet.gasPrices[this.store.uiState.gasPrice],
			method,
			connectedAddress,
			(transaction: PromiEvent<Contract>) => {
				transaction
					.on('transactionHash', (hash) => {
						queueNotification(`Deposit submitted.`, 'info', hash);
					})
					.on('receipt', () => {
						queueNotification(
							`Successfully deposited ${inCurrency(amount, 'eth', true)} ${underlyingAsset.symbol}`,
							'success',
						);
						this.fetchContracts();
						callback(null, {});
					})
					.catch((error: any) => {
						this.fetchContracts();
						queueNotification(error.message, 'error');
						setTxStatus('error');
					});
			},
		);
	});
	unstakeGeyser = action((geyser: any, amount: BigNumber, callback: (err: any, result: any) => void) => {
		const { queueNotification, setTxStatus } = this.store.uiState;
		const { provider, connectedAddress } = this.store.wallet;

		const web3 = new Web3(provider);
		const geyserContract = new web3.eth.Contract(geyser.abi, geyser.address);
		const method = geyserContract.methods.unstake(amount.toFixed(0, BigNumber.ROUND_DOWN), EMPTY_DATA);

		queueNotification(
			`Sign the transaction to unstake ${inCurrency(amount, 'eth', true)} ${geyser.vault.underlyingToken.symbol}`,
			'info',
		);

		estimateAndSend(
			web3,
			this.store.wallet.gasPrices[this.store.uiState.gasPrice],
			method,
			connectedAddress,
			(transaction: PromiEvent<Contract>) => {
				transaction
					.on('transactionHash', (hash) => {
						queueNotification(`Transaction submitted.`, 'info', hash);
					})
					.on('receipt', () => {
						queueNotification(
							`Successfully unstaked ${inCurrency(amount, 'eth', true)} ${
								geyser.vault.underlyingToken.symbol
							}`,
							'success',
						);
						this.fetchContracts();
						callback(null, {});
					})
					.catch((error: any) => {
						this.fetchContracts();
						queueNotification(error.message, 'error');
						setTxStatus('error');
					});
			},
		);
	});

	depositVault = action((vault: any, amount: BigNumber, all = false, callback: (err: any, result: any) => void) => {
		const { queueNotification, setTxStatus } = this.store.uiState;
		const { provider, connectedAddress } = this.store.wallet;

		const web3 = new Web3(provider);
		const underlyingContract = new web3.eth.Contract(vault.abi, vault.address);

		let method = underlyingContract.methods.deposit(amount.toFixed(0, BigNumber.ROUND_DOWN));
		if (all) method = underlyingContract.methods.depositAll();

		queueNotification(
			`Sign the transaction to wrap ${formatAmount({ amount: amount, token: vault.underlyingToken })} ${
				vault.underlyingToken.symbol
			}`,
			'info',
		);

		estimateAndSend(
			web3,
			this.store.wallet.gasPrices[this.store.uiState.gasPrice],
			method,
			connectedAddress,
			(transaction: PromiEvent<Contract>) => {
				transaction
					.on('transactionHash', (hash) => {
						queueNotification(`Deposit submitted.`, 'info', hash);
					})
					.on('receipt', () => {
						queueNotification(
							`Successfully deposited ${formatAmount({ amount: amount, token: vault.underlyingToken })} ${
								vault.underlyingToken.symbol
							}`,
							'success',
						);
						this.fetchContracts();
						this.fetchContracts();
						callback(null, {});
					})
					.catch((error: any) => {
						this.fetchContracts();
						this.fetchContracts();
						queueNotification(error.message, 'error');
						setTxStatus('error');
					});
			},
		);
	});
	withdrawVault = action((vault: any, amount: BigNumber, all = false, callback: (err: any, result: any) => void) => {
		const { setTxStatus, queueNotification } = this.store.uiState;
		const { provider, connectedAddress } = this.store.wallet;

		const web3 = new Web3(provider);
		const underlyingContract = new web3.eth.Contract(vault.abi, vault.address);

		let method = underlyingContract.methods.withdraw(amount.toFixed(0, BigNumber.ROUND_DOWN));
		if (all) method = underlyingContract.methods.withdrawAll();

		queueNotification(`Sign the transaction to unwrap ${inCurrency(amount, 'eth', true)} ${vault.symbol}`, 'info');

		estimateAndSend(
			web3,
			this.store.wallet.gasPrices[this.store.uiState.gasPrice],
			method,
			connectedAddress,
			(transaction: PromiEvent<Contract>) => {
				transaction
					.on('transactionHash', (hash) => {
						queueNotification(`Withdraw submitted.`, 'info', hash);
					})
					.on('receipt', () => {
						queueNotification(
							`Successfully withdrew ${inCurrency(amount, 'eth', true)} ${vault.symbol}`,
							'success',
						);
						this.fetchContracts();
						this.fetchContracts();
						callback(null, {});
					})
					.catch((error: any) => {
						this.fetchContracts();
						this.fetchContracts();
						queueNotification(error.message, 'error');
						setTxStatus('error');
					});
			},
		);
	});

	// calculateVaultGrowth = action(() => {
	// 	const { } = this.store.contracts;
	// 	const { currentBlock } = this.store.wallet;

	// 	if (!currentBlock) return;

	// 	const periods = [
	// 		Math.max(currentBlock - Math.floor(secondsToBlocks(60 * 5)), START_BLOCK), // 5 minutes ago
	// 		Math.max(currentBlock - Math.floor(secondsToBlocks(1 * 24 * 60 * 60)), START_BLOCK), // day
	// 		Math.max(currentBlock - Math.floor(secondsToBlocks(7 * 24 * 60 * 60)), START_BLOCK), // week
	// 		Math.max(currentBlock - Math.floor(secondsToBlocks(30 * 24 * 60 * 60)), START_BLOCK), // month
	// 		START_BLOCK, // start
	// 	];

	// 	const growthPromises = periods.map(growthQuery);

	// 	Promise.all(growthPromises).then((result: any) => {
	// 		// save the growth
	// 		const vaultGrowth = reduceGrowth(result, periods, START_TIME);
	// 		// this.stats._vaultGrowth = vaultGrowth.total

	// 		// extend vaults with new growth statistics.. pretty hairy maybe we keep this is the UI-state
	// 		this.updateVaults(vaultGrowth);
	// 	});
	// });
}

export default ContractsStore;
