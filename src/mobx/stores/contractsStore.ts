import { extendObservable, action, observe } from 'mobx';
import Web3 from 'web3';
import { AbiItem } from 'web3-utils';
import { estimateAndSend, getNetworkDeploy } from '../utils/web3';
import BigNumber from 'bignumber.js';
import { RootStore } from '../store';
import {
	reduceBatchResult,
	reduceContractConfig,
	reduceGrowth,
	reduceGrowthQueryConfig,
	reduceSushiAPIResults,
} from '../reducers/contractReducers';
import { Vault, Geyser, Token, GeyserPayload } from '../model';
import { vanillaQuery } from 'mobx/utils/helpers';
import { PromiEvent } from 'web3-core';
import { Contract } from 'web3-eth-contract';
import async from 'async';
import { EMPTY_DATA, ERC20, NETWORK_CONSTANTS, NETWORK_LIST } from 'config/constants';
import { formatAmount } from 'mobx/reducers/statsReducers';
import BatchCall from 'web3-batch-call';
import { getApi } from '../utils/apiV2';
import { compact, defaultsDeep, flatten, keyBy, mapValues, values } from '../../utils/lodashToNative';

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

		observe(this.store.wallet, 'currentBlock', (change: any) => {
			if (!!change.oldValue) {
				this.fetchContracts();
			}
		});
	}

	updateProvider = action(() => {
		if (!this.store.wallet.provider) {
			return;
		}
		this.vaults = {};
		this.tokens = {};
		this.geysers = {};
		const newOptions = {
			web3: new Web3(this.store.wallet.provider),
		};
		batchCall = new BatchCall(newOptions);
	});

	fetchContracts = action(
		async (): Promise<void> => {
			await this.fetchTokens();
			await this.fetchVaults();
			await this.fetchGeysers();
		},
	);

	fetchTokens = action(
		async (): Promise<void> => {
			const { connectedAddress, network } = this.store.wallet;
			if (!network.tokens) {
				return;
			}

			const { batchCall: batch } = reduceContractConfig(
				network.tokens!.tokenBatches,
				!!connectedAddress && { connectedAddress },
			);

			const priceApi = vanillaQuery(`${getApi()}/prices?chain=${network.name}&currency=eth`);
			if (!batchCall) {
				return;
			}

			// clean this up, but force async
			await Promise.all([priceApi, batchCall.execute(batch)])
				.then((result: any[]) => {
					const cgPrices = mapValues(result.slice(0, 1)[0], (price: any) => ({
						ethValue: new BigNumber(price).multipliedBy(1e18),
					}));
					const tokenContracts = keyBy(reduceBatchResult(flatten(result.slice(1, 2))), 'address');
					const tokens = compact(
						values(
							defaultsDeep(
								cgPrices,
								tokenContracts,
								mapValues(network.tokens!.symbols, (value: string, address: string) => ({
									address,
									symbol: value,
								})),
								mapValues(network.tokens!.names, (value: string, address: string) => ({
									address,
									name: value,
								})),
							),
						),
					);

					tokens.forEach((contract: any) => {
						const token = this.getOrCreateToken(contract.address);
						token.update(contract);
					});
				})
				.catch((error: any) => process.env.NODE_ENV !== 'production' && console.log('batch error: ', error));
		},
	);

	fetchVaults = action(
		async (): Promise<void> => {
			if (!batchCall) {
				return;
			}

			const { connectedAddress, currentBlock, network } = this.store.wallet;
			const { settList } = this.store.setts;
			const sushiBatches = network.vaults!['sushiswap'];

			const { defaults, batchCall: batch } = reduceContractConfig(
				values(network.vaults ?? {}),
				connectedAddress && { connectedAddress },
			);

			const { growthQueries, periods } = reduceGrowthQueryConfig(network.name, currentBlock);
			const settStructure = keyBy(settList ?? [], 'vaultToken');

			const priceApi = vanillaQuery(`${getApi()}/prices?chain=${network.name}&currency=eth`);

			await Promise.all([batchCall.execute(batch), ...growthQueries, priceApi])
				.then((queryResult: any[]) => {
					const result = reduceBatchResult(queryResult[0]);
					const vaultGrowth = reduceGrowth(
						queryResult.slice(1, growthQueries.length + 1),
						periods,
						NETWORK_CONSTANTS[network.name].START_TIME,
					);

					const prices = _.mapValues(queryResult.pop(), (price: any) => ({
						ethValue: new BigNumber(price).multipliedBy(1e18),
					}));

					result.forEach((contract: any, i: number) => {
						const tokenAddress = network.tokens!.tokenMap[contract.address];
						if (!tokenAddress) {
							return console.log(
								network.tokens!.tokenMap[contract.address],
								network.tokens!.tokenMap,
								contract.address,
							);
						}
						const vault = this.getOrCreateVault(
							contract.address,
							this.tokens[tokenAddress],
							defaults[contract.address].abi,
						);
						const growth =
							!!vaultGrowth[contract.address] &&
							mapValues(vaultGrowth[contract.address], (tokens: BigNumber) => ({
								amount: tokens,
								token: this.tokens[tokenAddress],
							}));

						// update ppfs from ppfs api
						// digg ppfs is handled differently than other setts
						// so we set this to 1
						contract.getPricePerFullShare =
							settStructure[vault.address] &&
							vault.address !== getNetworkDeploy(NETWORK_LIST.ETH)!.sett_system.vaults['native.digg']
								? new BigNumber(settStructure[vault.address].ppfs)
								: new BigNumber(1);
						vault.update(
							defaultsDeep(contract, defaults[contract.address], {
								growth: compact([vault.growth, growth]),
							}),
						);
						// update vaultBalance if given
						vault.vaultBalance = isNaN(parseFloat(result[i].balance))
							? new BigNumber(0.0)
							: new BigNumber(result[i].balance);
						// update vault Eth Value if given
						vault.ethValue = prices[contract.address].ethValue
							? prices[contract.address].ethValue
							: new BigNumber(0.0);
					});
				})
				.then(async () => {
					if (!!sushiBatches) {
						const xSushiQuery = vanillaQuery(sushiBatches!.growthEndpoints![1]);
						const masterChefQuery = vanillaQuery(
							// Disable reason: growthEndPoints[2] has a hardcoded value and will never be null for vaultBatches[1]
							// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
							sushiBatches!.growthEndpoints![2].concat(
								network.vaults!.sushiswap!.fillers.pairContract
									? network.vaults!.sushiswap!.fillers.pairContract.join(';')
									: '',
							),
						);

						await Promise.all([masterChefQuery, xSushiQuery]).then((queryResult: any[]) => {
							const masterChefResult: any = queryResult[0];
							const newSushiRewards = reduceSushiAPIResults(masterChefResult);
							network.vaults!.sushiswap!.contracts.forEach((contract: any, i: number) => {
								const tokenAddress = network.tokens!.tokenMap[contract];
								const xSushiGrowth =
									!!newSushiRewards[tokenAddress] &&
									mapValues(newSushiRewards[tokenAddress], (tokens: BigNumber) => {
										return {
											amount: tokens,
											token: this.tokens[NETWORK_CONSTANTS[network.name].TOKENS.XSUSHI_ADDRESS],
										};
									});
								const vault = this.getOrCreateVault(
									contract,
									this.tokens[tokenAddress],
									defaults[contract].abi,
								);
								vault.update(
									defaultsDeep(contract, defaults[contract], {
										growth: compact([vault.growth, xSushiGrowth]),
									}),
								);
							});
						});
					}
				})
				.catch((error: any) => process.env.NODE_ENV !== 'production' && console.log(error));
		},
	);

	fetchGeysers = action(
		async (): Promise<void> => {
			if (!batchCall) {
				return;
			}
			const { connectedAddress, network } = this.store.wallet;

			// Initialization checks
			if (!network.geysers || (this.vaults && Object.keys(this.vaults).length === 0)) {
				return;
			}

			const { defaults, batchCall: batch } = reduceContractConfig(
				network.geysers!.geyserBatches || [],
				connectedAddress && { connectedAddress },
			);

			await batchCall
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
							geyser.update(defaultsDeep(contract, defaults[contract.address]) as GeyserPayload);
						});
					}
				})
				.catch((error: any) => process.env.NODE_ENV !== 'production' && console.log(error));
		},
	);

	getOrCreateToken = action((address: string) => {
		const { network } = this.store.wallet;
		if (!this.tokens[address]) {
			this.tokens[address] = new Token(this.store, address, network.tokens!.decimals[address]);
			return this.tokens[address];
		} else {
			return this.tokens[address];
		}
	});
	getOrCreateVault = action((address: string, token: Token, abi?: any) => {
		const { network } = this.store.wallet;
		if (!this.vaults[address]) {
			this.vaults[address] = new Vault(this.store, address, network.tokens!.decimals[address], token, abi);
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
