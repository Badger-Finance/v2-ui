import { extendObservable, action, observe } from 'mobx';
import Web3 from 'web3';
import BatchCall from 'web3-batch-call';
import { AbiItem } from 'web3-utils';
import { batchConfig, estimateAndSend } from '../utils/web3';
import BigNumber from 'bignumber.js';
import { RootStore } from '../store';
import _ from 'lodash';
import {
	erc20BatchConfig,
	generateCurveTokens,
	reduceBatchResult,
	reduceContractConfig,
	reduceMethodConfig,
	reduceContractsToTokens,
	reduceCurveResult,
	reduceGraphResult,
	reduceGrowth,
	Vault,
	Geyser,
} from '../reducers/contractReducers';
import { jsonQuery, graphQuery, growthQuery, secondsToBlocks, inCurrency } from '../utils/helpers';
import { PromiEvent } from 'web3-core';
import { Contract } from 'web3-eth-contract';
import async from 'async';

import { curveTokens } from '../../config/system/tokens';
import { EMPTY_DATA, ERC20, RPC_URL, START_BLOCK, START_TIME, WBTC_ADDRESS } from '../../config/constants';
import {
	geysers as geyserBatches,
	geysers,
	vaults as vaultBatches,
} from '../../config/system/contracts';
import {
	decimals as tokensConfig
} from '../../config/system/tokens';

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
			tokens: {} as { string: Vault },
			geysers: {} as { string: Vault },
		});

		this.fetchContracts();
		this.fetchContracts();

		observe(this as any, 'tokens', (change: any) => {
			if (!!change.oldValue) {
				this.calculateVaultGrowth();
			}
		});
		observe(this.store.wallet, 'currentBlock', (change: any) => {
			if (!!change.oldValue) {
				this.fetchContracts();
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
		this.fetchContracts();
	});
	updateVaults = action((vaults: any) => {
		this.vaults = _.defaultsDeep(vaults, this.vaults, vaults);
	});
	updateTokens = action((tokens: any) => {
		this.tokens = _.defaultsDeep(tokens, this.tokens, tokens);
	});
	updateGeysers = action((geysers: any) => {
		this.geysers = _.defaultsDeep(geysers, this.geysers, geysers);
	});

	fetchContracts = action(() => {
		this.fetchTokens();
		this.fetchVaults();
		this.fetchGeysers();
	})

	fetchVaults = action(() => {
		const { connectedAddress } = this.store.wallet;

		let { defaults, batchCall: batch } = reduceContractConfig(vaultBatches, connectedAddress && { connectedAddress });

		batchCall
			.execute(batch)
			.then((infuraResult: any[]) => {
				let result = reduceBatchResult(infuraResult)
				result.forEach((contract: any) => {
					let vault = this.getOrCreateVault(contract.address)
					vault.update(_.defaults(contract, defaults[contract.address]))
				});
			})
			.catch((error: any) => process.env.NODE_ENV !== 'production' && console.log(error));
	});

	fetchGeysers = action(() => {
		const { connectedAddress } = this.store.wallet;

		let { defaults, batchCall: batch } = reduceContractConfig(geyserBatches, connectedAddress && { connectedAddress });

		batchCall
			.execute(batch)
			.then((infuraResult: any[]) => {
				let result = reduceBatchResult(infuraResult)
				result.forEach((contract: any) => {
					let vaultAddress = contract[defaults[contract.address].underlyingKey]
					let geyser = this.getOrCreateGeyser(contract.address, this.vaults[vaultAddress])
					geyser.update(_.defaults(contract, defaults[contract.address]))
				});
				console.log(this.geysers)
			})
			.catch((error: any) => process.env.NODE_ENV !== 'production' && console.log(error));

	});

	getOrCreateVault = action((address: string) => {
		if (!this.vaults[address]) {
			return this.vaults[address] = new Vault(this.store, address, tokensConfig[address])
		} else {
			return this.vaults[address]
		}
	})
	getOrCreateGeyser = action((address: string, vault?: Vault) => {
		if (!this.vaults[address]) {
			return this.geysers[address] = new Geyser(this.store, address, vault!)
		} else {
			return this.geysers[address]
		}
	})

	fetchTokens = action(() => {
		const { } = this.store;
		const { connectedAddress } = this.store.wallet;

		// reduce to {address:{address:,contract:}}
		this.updateTokens(reduceContractsToTokens({ ...this.vaults, ...this.geysers }));

		//generate curve tokens
		this.updateTokens(generateCurveTokens());


		// prepare curve query
		const curveBtcPrices = curveTokens.contracts.map((address: string, index: number) =>
			jsonQuery(curveTokens.priceEndpoints[index]),
		);

		// prepare price queries
		const graphQueries = _.flatten(_.map(this.tokens, (token: any) => graphQuery(token)));

		// prepare batch call
		const ercConfigs = erc20BatchConfig(this.tokens, connectedAddress);
		const ercBatch = !!ercConfigs ? [batchCall.execute(ercConfigs)] : [];

		// execute promises
		Promise.all([...curveBtcPrices, ...ercBatch, ...graphQueries]).then((result: any[]) => {
			const tokenContracts = _.keyBy(reduceBatchResult(_.flatten(result.slice(3, 4))), 'address');
			const tokenGraph = _.keyBy(_.compact(reduceGraphResult(result.slice(4))), 'address');
			const curveBtcPrices = _.keyBy(
				reduceCurveResult(result.slice(0, 3), curveTokens.contracts, this.tokens, tokenGraph[WBTC_ADDRESS]),
				'address',
			);

			this.updateTokens(_.defaultsDeep(curveBtcPrices, tokenGraph, tokenContracts, this.tokens));

		});
	});

	depositAndStake = action((geyser: any, amount: BigNumber, onlyWrapped = false) => {
		const { tokens, vaults } = this;
		const { setTxStatus, queueNotification } = this.store.uiState;

		const vault = vaults[geyser[geyser.underlyingKey]];
		const underlying = tokens[vault[vault.underlyingKey]];
		const wrapped = tokens[vault.address];


		if (!amount || amount.isNaN() || amount.lte(0))
			return queueNotification('Please enter a valid amount', 'error');

		// calculate amount to deposit

		let underlyingAmount = new BigNumber(0);

		if (onlyWrapped) {
			if (amount.gt(vault.balanceOf)) return queueNotification('Please enter a valid amount', 'error');
		} else {
			underlyingAmount = amount;
		}

		const methodSeries: any = [];

		async.parallel(
			[
				(callback: any) => this.getAllowance(underlying, vault.address, callback),
				(callback: any) => this.getAllowance(wrapped, geyser.address, callback),
			],
			(err: any, allowances: any) => {

				// if we need to wrap assets, make sure we have allowance
				if (underlyingAmount.gt(0)) {
					if (underlyingAmount.gt(allowances[0]))
						methodSeries.push((callback: any) =>
							this.increaseAllowance(underlying, vault.address, callback),
						);

					methodSeries.push((callback: any) =>
						this.depositVault(vault, underlyingAmount, amount.gte(underlying.balanceOf), callback),
					);
				}
				if (onlyWrapped) {
					// if we need to deposit wrapped assets, make sure we have allowance
					if (amount.gt(allowances[1]))
						methodSeries.push((callback: any) => this.increaseAllowance(wrapped, geyser.address, callback));

					methodSeries.push((callback: any) => this.depositGeyser(geyser, amount, callback));
				}

				setTxStatus('pending');
				async.series(methodSeries, (err: any, results: any) => {
					console.log(err, results);
					setTxStatus(!!err ? 'error' : 'success');
				});
			},
		);
	});

	unstakeAndUnwrap = action((geyser: any, amount: BigNumber) => {
		const { tokens, vaults } = this;
		const { setTxStatus, queueNotification } = this.store.uiState;

		const wrapped = tokens[geyser[geyser.underlyingKey]];
		const vault = vaults[wrapped.address];

		// ensure balance is valid
		if (
			amount.isNaN() ||
			amount.lte(0) ||
			amount.gt(geyser.totalStakedFor.multipliedBy(vault.getPricePerFullShare.dividedBy(1e18)))
		)
			return queueNotification('Please enter a valid amount', 'error');

		// calculate amount to withdraw
		let wrappedAmount = amount.dividedBy(vault.getPricePerFullShare.dividedBy(1e18));
		const methodSeries: any = [];

		if (geyser.totalStakedFor.minus(wrappedAmount).lte(1)) {
			wrappedAmount = geyser.totalStakedFor;
		}

		// if we need to wrap assets, make sure we have allowance
		methodSeries.push((callback: any) => this.withdrawGeyser(geyser, wrappedAmount, callback));

		methodSeries.push((callback: any) =>
			this.withdrawVault(vault, wrappedAmount, wrappedAmount.gte(wrapped.balanceOf), callback),
		);
		setTxStatus('pending');
		async.series(methodSeries, (err: any, results: any) => {
			console.log(err, results);
			setTxStatus(!!err ? 'error' : 'success');
		});
	});

	unwrap = action((vault: any, amount: BigNumber) => {
		const { tokens } = this;
		const { setTxStatus, queueNotification } = this.store.uiState;

		const wrapped = tokens[vault.address];

		// ensure balance is valid
		if (amount.isNaN() || !wrapped.balanceOf || amount.gt(wrapped.balanceOf))
			return queueNotification('Please enter a valid amount', 'error');

		// calculate amount to withdraw
		const wrappedAmount = amount;
		const methodSeries: any = [];


		// withdraw
		methodSeries.push((callback: any) =>
			this.withdrawVault(vault, wrappedAmount, wrappedAmount.gte(wrapped.balanceOf), callback),
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
	getAllowance = action((underlyingAsset: any, spender: string, callback: (err: any, result: any) => void) => {
		const { } = this.store.uiState;
		const { provider, connectedAddress } = this.store.wallet;

		const web3 = new Web3(provider);
		const underlyingContract = new web3.eth.Contract(ERC20.abi as AbiItem[], underlyingAsset.address);
		const method = underlyingContract.methods.allowance(connectedAddress, spender);

		method.call().then((result: any) => {
			callback(null, result);
		});
	});

	depositGeyser = action((geyser: any, amount: BigNumber, callback: (err: any, result: any) => void) => {
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
	withdrawGeyser = action((geyser: any, amount: BigNumber, callback: (err: any, result: any) => void) => {
		const { queueNotification, setTxStatus } = this.store.uiState;
		const { provider, connectedAddress } = this.store.wallet;

		const underlyingAsset = this.tokens[geyser[geyser.underlyingKey]];

		// unstake all if within 2e-18

		const web3 = new Web3(provider);
		const geyserContract = new web3.eth.Contract(geyser.abi, geyser.address);
		const method = geyserContract.methods.unstake(amount.toFixed(0, BigNumber.ROUND_DOWN), EMPTY_DATA);

		queueNotification(
			`Sign the transaction to unstake ${inCurrency(amount, 'eth', true)} ${underlyingAsset.symbol}`,
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
							`Successfully unstaked ${inCurrency(amount, 'eth', true)} ${underlyingAsset.symbol}`,
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

	depositVault = action((vault: any, amount: BigNumber, all = false, callback: (err: any, result: any) => void) => {
		const { queueNotification, setTxStatus } = this.store.uiState;
		const { provider, connectedAddress } = this.store.wallet;

		const underlyingAsset = this.tokens[vault[vault.underlyingKey]];

		const web3 = new Web3(provider);
		const underlyingContract = new web3.eth.Contract(vault.abi, vault.address);

		let method = underlyingContract.methods.deposit(amount.toFixed(0, BigNumber.ROUND_DOWN));
		if (all) method = underlyingContract.methods.depositAll();
		queueNotification(
			`Sign the transaction to wrap ${inCurrency(amount, 'eth', true)} ${underlyingAsset.symbol}`,
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

	calculateVaultGrowth = action(() => {
		const { } = this.store.contracts;
		const { currentBlock } = this.store.wallet;

		if (!currentBlock) return;

		const periods = [
			Math.max(currentBlock - Math.floor(secondsToBlocks(60 * 5)), START_BLOCK), // 5 minutes ago
			Math.max(currentBlock - Math.floor(secondsToBlocks(1 * 24 * 60 * 60)), START_BLOCK), // day
			Math.max(currentBlock - Math.floor(secondsToBlocks(7 * 24 * 60 * 60)), START_BLOCK), // week
			Math.max(currentBlock - Math.floor(secondsToBlocks(30 * 24 * 60 * 60)), START_BLOCK), // month
			START_BLOCK, // start
		];

		const growthPromises = periods.map(growthQuery);

		Promise.all(growthPromises).then((result: any) => {
			// save the growth
			const vaultGrowth = reduceGrowth(result, periods, START_TIME);
			// this.stats._vaultGrowth = vaultGrowth.total

			// extend vaults with new growth statistics.. pretty hairy maybe we keep this is the UI-state
			this.updateVaults(vaultGrowth);
		});
	});
}

export default ContractsStore;
