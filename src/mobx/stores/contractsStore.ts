import { extendObservable, action, observe } from 'mobx';
import Web3 from 'web3';
import BatchCall from 'web3-batch-call';
import { AbiItem } from 'web3-utils';
import { estimateAndSend } from '../utils/web3';
import BigNumber from 'bignumber.js';
import { RootStore } from '../store';
import _ from 'lodash';
import {
	reduceBatchResult,
	reduceContractConfig,
	reduceCurveResult,
	reduceGraphResult,
	reduceGrowth,
	reduceGrowthQueryConfig,
	reduceSushiAPIResults,
} from '../reducers/contractReducers';
import { Vault, Geyser, Token } from '../model';
import { jsonQuery, graphQuery, vanillaQuery } from 'mobx/utils/helpers';
import { PromiEvent } from 'web3-core';
import { Contract } from 'web3-eth-contract';
import async from 'async';
import {  } from 'config/system/tokens';
import { EMPTY_DATA, ERC20 } from 'config/constants';
import {  } from 'config/system/vaults';
import {  } from 'config/system/geysers';
import {  } from 'config/system/tokens';
import { formatAmount } from 'mobx/reducers/statsReducers';

// let batchCall = new BatchCall(options);
let batchCall: any = null;

class ContractsStore {
	private store!: RootStore;

	public tokens?: any = {}; // inputs to vaults and geysers
	public vaults?: any = {}; // vaults contract data
	public geysers?: any = {}; // geyser contract data

	constructor(store: RootStore) {
		this.store = store;

		extendObservable(this, {
			vaults: {} as { string: Vault },
			tokens: {} as { string: Token },
			geysers: {} as { string: Geyser },
		});

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

		observe(this.store.wallet as any, 'connectedAddress', () => {
			this.updateProvider();
		});
		if (!!this.store.wallet.connectedAddress) this.updateProvider();
	}

	updateProvider = action(() => {
		if (!this.store.wallet.provider) {
			this.vaults = {};
			this.tokens = {};
			this.geysers = {};
			return;
		}
		const newOptions = {
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

	private _fetchingContracts = false;
	private _pendingChangeOfAddress = false;
	fetchContracts = action(() => {
		if (this._fetchingContracts) return;
		this._fetchingContracts = true;
		async.series(
			[
				(callback: any) => this.fetchTokens(callback),
				(callback: any) => this.fetchVaults(callback),
				(callback: any) => this.fetchGeysers(callback),
			],
			() => {
				this._fetchingContracts = false;
				if (this._pendingChangeOfAddress) {
					this._pendingChangeOfAddress = false;
					this.fetchContracts();
				}
			},
		);
	});

	fetchTokens = action((callback: any) => {
		const { connectedAddress, network } = this.store.wallet;

		const { batchCall: batch } = reduceContractConfig(network.tokens.tokenBatches, !!connectedAddress && { connectedAddress });
		// prepare curve price query
		const curveQueries = network.tokens.curveTokens?.priceEndpoints ? network.tokens.curveTokens?.contracts.map((address: string, index: number) =>
			jsonQuery(network.tokens.curveTokens?.priceEndpoints[index]),
		) : [''];

		// prepare price queries
		const graphQueries = _.flatten(_.map(network.tokens.tokenBatches[0].contracts, (address: string) => graphQuery(address)));

		const cgQueries = vanillaQuery(
			`https://api.coingecko.com/api/v3/simple/token_price/ethereum?contract_addresses=${network.tokens.tokenBatches[0].contracts.join(
				',',
			)}&vs_currencies=eth`,
		);

		if (!batchCall) {
			callback();
			return;
		}

		Promise.all([cgQueries, batchCall.execute(batch), ...curveQueries, ...graphQueries])
			.then((result: any[]) => {
				const cgPrices = _.mapValues(result.slice(0, 1)[0], (price: any) => ({
					ethValue: new BigNumber(price.eth).multipliedBy(1e18),
				}));
				const tokenContracts = _.keyBy(reduceBatchResult(_.flatten(result.slice(1, 2))), 'address');
				const tokenPrices = _.keyBy(
					_.compact(reduceGraphResult(result.slice(2 + curveQueries.length), cgPrices)),
					'address',
				);
				const curvePrices = network.tokens.curveTokens ? _.keyBy(
					reduceCurveResult(
						result.slice(2, 2 + curveQueries.length),
						network.tokens.curveTokens.contracts,
						tokenPrices[network.tokens.curveTokens.vsToken],
					),
					'address',
				);
				const tokens = _.compact(
					_.values(
						_.defaultsDeep(
							curvePrices,
							cgPrices,
							tokenPrices,
							tokenContracts,
							_.mapValues(symbols, (value: string, address: string) => ({ address, symbol: value })),
							_.mapValues(names, (value: string, address: string) => ({ address, name: value })),
						),
					),
				);

				tokens.forEach((contract: any) => {
					const token = this.getOrCreateToken(contract.address);
					token.update(contract);
				});

				callback();
			})
			.catch((error: any) => process.env.NODE_ENV !== 'production' && console.log(error));
	});

	fetchVaults = action((callback: any) => {
		if (!batchCall) {
			callback();
			return;
		}

		const { connectedAddress, currentBlock, network } = this.store.wallet;
		const sushiBatches = vaultBatches[1];

		const { defaults, batchCall: batch } = reduceContractConfig(
			vaultBatches,
			connectedAddress && { connectedAddress },
		);

		const { growthQueries, periods } = reduceGrowthQueryConfig(network.name, currentBlock);

		// Disable reason: growthEndPoints[1] has a hardcoded value and will never be null for vaultBatches[1]
		// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
		const xSushiQuery = vanillaQuery(sushiBatches.growthEndpoints![1]);
		const masterChefQuery = vanillaQuery(
			// Disable reason: growthEndPoints[2] has a hardcoded value and will never be null for vaultBatches[1]
			// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
			sushiBatches.growthEndpoints![2].concat(tokenBatches[0].contracts.join(';')),
		);
		const ppfsQuery = vanillaQuery('https://api.sett.vision/protocol/ppfs');

		Promise.all([batchCall.execute(batch), ...growthQueries, masterChefQuery, xSushiQuery, ppfsQuery])
			.then((queryResult: any[]) => {
				const result = reduceBatchResult(queryResult[0]);
				const masterChefResult: any = queryResult.slice(growthQueries.length + 1, growthQueries.length + 2);
				const ppfsResult: any = queryResult.slice(growthQueries.length + 3)[0];

				const vaultGrowth = reduceGrowth(queryResult.slice(1, growthQueries.length + 1), periods, START_TIME);
				const newSushiRewards = reduceSushiAPIResults(masterChefResult[0]);

				result.forEach((contract: any, i: number) => {
					const tokenAddress = tokenMap[contract.address];
					if (!tokenAddress) {
						return console.log(tokenMap[contract.address], tokenMap, contract.address);
					}
					const vault = this.getOrCreateVault(
						contract.address,
						this.tokens[tokenAddress],
						defaults[contract.address].abi,
					);

					const growth =
						!!vaultGrowth[contract.address] &&
						_.mapValues(vaultGrowth[contract.address], (tokens: BigNumber) => ({
							amount: tokens,
							token: this.tokens[tokenAddress],
						}));
					const xSushiGrowth =
						!!newSushiRewards[tokenAddress] &&
						_.mapValues(newSushiRewards[tokenAddress], (tokens: BigNumber) => {
							return {
								amount: tokens,
								token: this.tokens[XSUSHI_ADDRESS],
							};
						});

					//TODO: xSushi ROI not added in here - need vault balance which doesn't seem to be set.
					// console.log(vault)
					// update ppfs from ppfs api
					contract.getPricePerFullShare = new BigNumber(ppfsResult[vault.address]);
					vault.update(
						_.defaultsDeep(contract, defaults[contract.address], {
							growth: _.compact([growth, xSushiGrowth]),
						}),
					);
					// update vaultBalance if given
					vault.vaultBalance = isNaN(parseFloat(result[i].balance))
						? new BigNumber(0.0)
						: new BigNumber(result[i].balance);
				});
				callback();
			})
			.catch((error: any) => process.env.NODE_ENV !== 'production' && console.log(error));
	});

	fetchGeysers = action((callback: any) => {
		if (!batchCall) {
			callback();
			return;
		}

		const { connectedAddress } = this.store.wallet;

		const { defaults, batchCall: batch } = reduceContractConfig(
			geyserBatches,
			connectedAddress && { connectedAddress },
		);

		batchCall
			.execute(batch)
			.then((infuraResult: any[]) => {
				const result = reduceBatchResult(infuraResult);

				if (result) {
					result.forEach((contract: any) => {
						const vaultAddress = contract[defaults[contract.address].underlyingKey];
						const geyser: Geyser = this.getOrCreateGeyser(
							contract.address,
							this.vaults[vaultAddress],
							defaults[contract.address].abi,
						);
						geyser.update(_.defaultsDeep(contract, defaults[contract.address]));
					});
				}

				callback();
			})
			.catch((error: any) => process.env.NODE_ENV !== 'production' && console.log(error));
	});

	getOrCreateToken = action((address: string) => {
		if (!this.tokens[address]) {
			this.tokens[address] = new Token(this.store, address, tokenDecimals[address]);
			return this.tokens[address];
		} else {
			return this.tokens[address];
		}
	});
	getOrCreateVault = action((address: string, token: Token, abi?: any) => {
		if (!this.vaults[address]) {
			this.vaults[address] = new Vault(this.store, address, tokenDecimals[address], token, abi);
			return this.vaults[address];
		} else {
			return this.vaults[address];
		}
	});
	getOrCreateGeyser = action((address: string, vault: Vault, abi?: any) => {
		if (!this.vaults[address]) {
			this.geysers[address] = new Geyser(this.store, address, vault, abi);
			return this.geysers[address];
		} else {
			return this.geysers[address];
		}
	});

	deposit = action((vault: Vault, amount: BigNumber) => {
		const { setTxStatus, queueNotification } = this.store.uiState;

		if (!amount || amount.isNaN() || amount.lte(0) || amount.gt(vault.underlyingToken.balance))
			return queueNotification('Please enter a valid amount', 'error');

		const underlyingAmount = amount.multipliedBy(10 ** vault.underlyingToken.decimals);

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
		const { setTxStatus, queueNotification } = this.store.uiState;

		if (!amount || amount.isNaN() || amount.lte(0) || amount.gt(vault.balance))
			return queueNotification('Please enter a valid amount', 'error');

		const wrappedAmount = amount.multipliedBy(10 ** vault.decimals);

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
		const { setTxStatus, queueNotification } = this.store.uiState;

		if (!amount || amount.isNaN() || amount.lte(0) || amount.gt(vault.geyser.balance))
			return queueNotification('Please enter a valid amount', 'error');

		const wrappedAmount = amount.multipliedBy(10 ** vault.decimals);

		const methodSeries: any = [];

		methodSeries.push((callback: any) => this.unstakeGeyser(vault.geyser, wrappedAmount, callback));

		setTxStatus('pending');
		async.series(methodSeries, (err: any, results: any) => {
			console.log(err, results);
			setTxStatus(!!err ? 'error' : 'success');
		});
	});

	withdraw = action((vault: any, amount: BigNumber) => {
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

		const underlyingAsset = geyser.vault.underlyingToken;

		const web3 = new Web3(provider);
		const geyserContract = new web3.eth.Contract(geyser.abi, geyser.address);
		const method = geyserContract.methods.stake(amount.toFixed(0, BigNumber.ROUND_HALF_FLOOR), EMPTY_DATA);
		queueNotification(
			`Sign the transaction to stake ${formatAmount({ amount: amount, token: underlyingAsset })} ${
				underlyingAsset.symbol
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
							`Successfully deposited ${formatAmount({ amount: amount, token: underlyingAsset })} ${
								underlyingAsset.symbol
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
	unstakeGeyser = action((geyser: any, amount: BigNumber, callback: (err: any, result: any) => void) => {
		const { queueNotification, setTxStatus } = this.store.uiState;
		const { provider, connectedAddress } = this.store.wallet;

		const web3 = new Web3(provider);
		const geyserContract = new web3.eth.Contract(geyser.abi, geyser.address);
		const method = geyserContract.methods.unstake(amount.toFixed(0, BigNumber.ROUND_HALF_FLOOR), EMPTY_DATA);

		queueNotification(
			`Sign the transaction to unstake ${formatAmount({ amount: amount, token: geyser.vault.underlyingToken })} ${
				geyser.vault.underlyingToken.symbol
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
						queueNotification(`Transaction submitted.`, 'info', hash);
					})
					.on('receipt', () => {
						queueNotification(
							`Successfully unstaked ${formatAmount({
								amount: amount,
								token: geyser.vault.underlyingToken,
							})} ${geyser.vault.underlyingToken.symbol}`,
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

		let method = underlyingContract.methods.deposit(amount.toFixed(0, BigNumber.ROUND_HALF_FLOOR));
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

		let method = underlyingContract.methods.withdraw(amount.toFixed(0, BigNumber.ROUND_HALF_FLOOR));
		if (all) method = underlyingContract.methods.withdrawAll();

		queueNotification(
			`Sign the transaction to unwrap ${formatAmount({ amount: amount, token: vault.underlyingToken }, true)} ${
				vault.symbol
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
						queueNotification(`Withdraw submitted.`, 'info', hash);
					})
					.on('receipt', () => {
						queueNotification(
							`Successfully withdrew ${formatAmount(
								{ amount: amount, token: vault.underlyingToken },
								true,
							)} ${vault.symbol}`,
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
}

export default ContractsStore;
