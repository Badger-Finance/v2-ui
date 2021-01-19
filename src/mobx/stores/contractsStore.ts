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
	reduceGeyserSchedule,
	reduceGraphResult,
	reduceGrowth,
	reduceSushiAPIResults,
	reduceXSushiROIResults,
} from '../reducers/contractReducers';
import { jsonQuery, graphQuery, growthQuery, secondsToBlocks, inCurrency, vanillaQuery } from '../utils/helpers';
import { PromiEvent } from 'web3-core';
import { Contract } from 'web3-eth-contract';
import async from 'async';
import { reduceClaims, reduceTimeSinceLastCycle } from '../reducers/statsReducers';

import { curveTokens } from '../../config/system/tokens';
import { DIGG_ADDRESS, EMPTY_DATA, ERC20, RPC_URL, START_BLOCK, START_TIME, WBTC_ADDRESS } from '../../config/constants';
import {
	rewards as rewardsConfig,
	geysers as geyserConfigs,
	vaults as vaultsConfigs,
} from '../../config/system/settSystem';
import { digg, rewards as airdropsConfig, token as diggTokenConfig } from '../../config/system/digg';
import { getNextRebase, getRebaseLogs } from '../utils/digHelpers';

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
	public rebase?: any; // rebase contract data

	public badgerTree?: any; // geyser contract data
	public airdrops?: any; // geyser contract data

	constructor(store: RootStore) {
		this.store = store;

		extendObservable(this, {
			vaults: undefined,
			tokens: undefined,
			geysers: undefined,
			rebase: undefined,
			badgerTree: { cycle: '...', timeSinceLastCycle: '0h 0m', claims: [0] },
			airdrops: undefined,
		});

		this.fetchContracts();

		observe(this as any, 'tokens', (change: any) => {
			if (!!change.oldValue) {
				this.calculateVaultGrowth();
				this.calculateGeyserRewards();
				this.fetchRebaseStats();
			}
		});
		observe(this.store.wallet, 'currentBlock', (change: any) => {
			if (!!change.oldValue) {
				this.fetchContracts();
				this.fetchRebaseStats();
			}
		});

		observe(this.store.wallet as any, 'connectedAddress', (change: any) => {
			this.updateProvider();
		});
		if (!!this.store.wallet.connectedAddress) this.updateProvider();

		setInterval(this.fetchSettRewards, 6e4);
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

		this.fetchSettRewards();
		this.fetchAirdrops();
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
	updateRebase = action((rebase: any) => {
		this.rebase = _.defaultsDeep(rebase, this.rebase, rebase);
	});

	fetchContracts = action(() => {
		// state and wallet are separate stores
		// const { vaults, geysers } = this;
		const { connectedAddress } = this.store.wallet;

		// grab respective config files
		this.updateVaults(reduceContractConfig(vaultsConfigs, connectedAddress && { connectedAddress }));
		this.updateGeysers(reduceContractConfig(geyserConfigs, connectedAddress && { connectedAddress }));
		// create batch configs for vaultsConfigs and geysers
		const vaultBatch: any[] = _.map(vaultsConfigs, (config: any) => {
			return batchConfig(
				'vaults',
				config.contracts,
				!!config.methods ? reduceMethodConfig(config.methods, !!connectedAddress && { connectedAddress }) : [],
				config.abi,
			);
		});

		const geyserBatch: any[] = _.map(geyserConfigs, (config: any) => {
			return batchConfig(
				'geysers',
				config.contracts,
				!!config.methods ? reduceMethodConfig(config.methods, !!connectedAddress && { connectedAddress }) : [],
				config.abi,
			);
		});

		const batchContracts = _.concat(vaultBatch, geyserBatch);

		// console.log(batchContracts, batchCall)

		// execute batch calls to web3 (infura most likely)
		batchCall
			.execute(batchContracts)
			.then((result: any) => {
				// sort result into hash {vaults:[], geysers:[]}
				const keyedResult = _.groupBy(result, 'namespace');
				// store vaults & geysers as hashes {contract_address: data}
				_.mapKeys(keyedResult, (value: any, key: string) => {
					if (key === 'vaults') this.updateVaults(_.keyBy(reduceBatchResult(value), 'address'));
					else this.updateGeysers(_.keyBy(reduceBatchResult(value), 'address'));
				});

				// console.log(this.vaults)

				// fetch input/outputs information
				this.fetchTokens();
			})
			.catch((error: any) => process.env.NODE_ENV !== 'production' && console.log(error));
	});

	fetchTokens = action(() => {
		const { } = this.store;
		const { connectedAddress } = this.store.wallet;

		// reduce to {address:{address:,contract:}}
		this.updateTokens(reduceContractsToTokens({ ...this.vaults, ...this.geysers }));
		// console.log(this.tokens)

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
			// this.updateTokens(tokenGraph)
			// this.updateTokens(curveBtcPrices)

			// console.log(this.tokens, tokenContracts, tokenGraph, curveBtcPrices)
		});
	});

	fetchSettRewards = action(() => {
		const { provider, connectedAddress } = this.store.wallet;
		const { } = this.store.uiState;

		if (!connectedAddress) return;

		const web3 = new Web3(provider);
		const rewardsTree = new web3.eth.Contract(rewardsConfig.abi as any, rewardsConfig.contract);
		const checksumAddress = Web3.utils.toChecksumAddress(connectedAddress);

		const treeMethods = [
			rewardsTree.methods.lastPublishTimestamp().call(),
			rewardsTree.methods.merkleContentHash().call(),
		];

		Promise.all(treeMethods).then((rewardsResponse: any) => {
			const merkleHash = rewardsResponse[1];

			this.badgerTree = _.defaults(
				{
					timeSinceLastCycle: reduceTimeSinceLastCycle(rewardsResponse[0]),
				},
				this.badgerTree,
			);

			const endpointQuery = jsonQuery(
				`${rewardsConfig.endpoint}/rewards/${rewardsConfig.network}/${merkleHash}/${checksumAddress}`,
			);

			endpointQuery.then((proof: any) => {
				rewardsTree.methods
					.getClaimedFor(connectedAddress, rewardsConfig.tokens)
					.call()
					.then((claimedRewards: any[]) => {
						if (!proof.error) {
							this.badgerTree = _.defaults(
								{
									cycle: parseInt(proof.cycle, 16),
									claims: reduceClaims(proof, claimedRewards),
									proof,
								},
								this.badgerTree,
							);
						}
					});
			});
		});
	});

	fetchAirdrops = action(() => {
		const { provider, connectedAddress, isCached } = this.store.wallet;
		const { } = this.store.uiState;
		console.log('fetching', connectedAddress)

		if (!connectedAddress)
			return

		console.log('fetching', connectedAddress)


		const web3 = new Web3(provider);
		const rewardsTree = new web3.eth.Contract(airdropsConfig.abi as any, airdropsConfig.contract);
		const diggToken = new web3.eth.Contract(diggTokenConfig.abi as any, diggTokenConfig.contract);
		const checksumAddress = Web3.utils.toChecksumAddress(connectedAddress);

		jsonQuery(`${airdropsConfig.endpoint}/1337/${checksumAddress}`).then((merkleProof: any) => {
			console.log('proof', new BigNumber(Web3.utils.hexToNumberString(merkleProof.amount)).toString())
			if (!merkleProof.error) {
				Promise.all(
					[rewardsTree.methods
						.isClaimed(merkleProof.index)
						.call(),
					diggToken.methods
						.sharesToFragments(new BigNumber(Web3.utils.hexToNumberString(merkleProof.amount)).toFixed(0))
						.call()])

					.then((result: any[]) => {
						console.log(new BigNumber(result[1]).multipliedBy(1e9))
						this.airdrops = {
							digg: !result[0]
								? new BigNumber(result[1]).multipliedBy(1e9)
								: new BigNumber(0),

							merkleProof
						};
					});
			}
		});
	});


	fetchRebaseStats = action(async () => {
		const rebaseLog = await getRebaseLogs();
		const { digg } = require('config/system/digg');
		Promise.all([...[batchCall.execute(digg)], ...[...graphQuery({ address: digg[0].addresses[0] })]]).then(
			(result: any[]) => {
				let keyedResult = _.groupBy(result[0], 'namespace');
				const minRebaseTimeIntervalSec = parseInt(keyedResult.policy[0].minRebaseTimeIntervalSec[0].value);
				const lastRebaseTimestampSec = parseInt(keyedResult.policy[0].lastRebaseTimestampSec[0].value);
				const decimals = parseInt(keyedResult.token[0].decimals[0].value);
				let token = {
					totalSupply: new BigNumber(keyedResult.token[0].totalSupply[0].value).dividedBy(
						Math.pow(10, decimals),
					),
					decimals: decimals,
					lastRebaseTimestampSec: lastRebaseTimestampSec,
					minRebaseTimeIntervalSec: minRebaseTimeIntervalSec,
					rebaseLag: keyedResult.policy[0].rebaseLag[0].value,
					epoch: keyedResult.policy[0].epoch[0].value,
					inRebaseWindow: keyedResult.policy[0].inRebaseWindow[0].value !== "N/A",
					rebaseWindowLengthSec: parseInt(keyedResult.policy[0].rebaseWindowLengthSec[0].value),
					oracleRate: new BigNumber(keyedResult.oracle[0].providerReports[0].value.payload).dividedBy(1e18),
					derivedEth: result[1].data.token.derivedETH,
					nextRebase: getNextRebase(minRebaseTimeIntervalSec, lastRebaseTimestampSec),
					pastRebase: rebaseLog,
				};
				console.log(token)
				this.updateRebase(token);
			},
		);
	});

	callRebase = action(() => {


	});

	depositAndStake = action((geyser: any, amount: BigNumber, onlyWrapped = false) => {
		const { tokens, vaults } = this;
		const { setTxStatus, queueNotification } = this.store.uiState;

		const vault = vaults[geyser[geyser.underlyingKey]];
		const underlying = tokens[vault[vault.underlyingKey]];
		const wrapped = tokens[vault.address];

		// console.log(vault, geyser, onlyWrapped)

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
				// console.log(allowances)

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
			// console.log("unstakeALL")
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

		// console.log("unwrapping", wrappedAmount.dividedBy(1e18).toString())

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

	claimGeysers = action((stake = false) => {
		const { proof } = this.badgerTree;
		const { provider, gasPrices, connectedAddress } = this.store.wallet;
		const { queueNotification, gasPrice, setTxStatus } = this.store.uiState;

		if (!connectedAddress) return;

		// if (ethBalance?.lt(MIN_ETH_BALANCE))
		// 	return queueNotification("Your account is low on ETH, you may need to top up to claim.", 'warning')

		const web3 = new Web3(provider);
		const rewardsTree = new web3.eth.Contract(rewardsConfig.abi as any, rewardsConfig.contract);
		const method = rewardsTree.methods.claim(
			proof.tokens,
			proof.cumulativeAmounts,
			proof.index,
			proof.cycle,
			proof.proof,
		);

		queueNotification(`Sign the transaction to claim your earnings`, 'info');
		if (stake)
			queueNotification(`You will need to approve 3 transactions in order to wrap & stake your assets`, 'info');
		const badgerAmount = new BigNumber(this.badgerTree.claims[0]).multipliedBy(1e18);
		estimateAndSend(web3, gasPrices[gasPrice], method, connectedAddress, (transaction: PromiEvent<Contract>) => {
			transaction
				.on('transactionHash', () => {
					queueNotification(`Claim submitted.`, 'info');
				})
				.on('receipt', () => {
					queueNotification(`Rewards claimed.`, 'success');
					this.fetchSettRewards();
					this.fetchContracts();

					if (stake) {
						const badgerGeyser = this.geysers['0xa9429271a28f8543efffa136994c0839e7d7bf77'];
						this.depositAndStake(badgerGeyser, badgerAmount);
					}
				})
				.catch((error: any) => {
					this.fetchContracts();
					queueNotification(error.message, 'error');
					setTxStatus('error');
				});
		});
	});
	claimBadgerAirdrops = action((stake = false) => {
		const { merkleProof } = this.airdrops;
		const { provider, gasPrices, connectedAddress } = this.store.wallet;
		const { queueNotification, gasPrice, setTxStatus } = this.store.uiState;

		if (!connectedAddress) return;

		// if (ethBalance?.lt(MIN_ETH_BALANCE))
		// 	return queueNotification("Your account is low on ETH, you may need to top up to claim.", 'warning')

		const web3 = new Web3(provider);
		const rewardsTree = new web3.eth.Contract(airdropsConfig.abi as any, airdropsConfig.contract);
		const method = rewardsTree.methods.claim(
			merkleProof.index,
			connectedAddress,
			merkleProof.amount,
			merkleProof.proof,
		);

		queueNotification(`Sign the transaction to claim your airdrop`, 'info');
		const badgerAmount = this.airdrops.badger;
		estimateAndSend(web3, gasPrices[gasPrice], method, connectedAddress, (transaction: PromiEvent<Contract>) => {
			transaction
				.on('transactionHash', () => {
					queueNotification(`Claim submitted.`, 'info');
				})
				.on('receipt', () => {
					queueNotification(`Rewards claimed.`, 'success');
					this.fetchSettRewards();
					this.fetchContracts();

					if (stake) {
						const badgerGeyser = this.geysers['0xa9429271a28f8543efffa136994c0839e7d7bf77'];
						this.depositAndStake(badgerGeyser, badgerAmount);
					}
				})
				.catch((error: any) => {
					this.fetchContracts();
					queueNotification(error.message, 'error');
					setTxStatus('error');
				});
		});
	});
	claimDiggAirdrops = action((stake = false) => {
		const { merkleProof } = this.airdrops;
		const { provider, gasPrices, connectedAddress } = this.store.wallet;
		const { queueNotification, gasPrice, setTxStatus } = this.store.uiState;

		if (!connectedAddress) return;

		// if (ethBalance?.lt(MIN_ETH_BALANCE))
		// 	return queueNotification("Your account is low on ETH, you may need to top up to claim.", 'warning')

		const web3 = new Web3(provider);
		const rewardsTree = new web3.eth.Contract(airdropsConfig.abi as any, airdropsConfig.contract);
		const method = rewardsTree.methods.claim(
			merkleProof.index,
			connectedAddress,
			merkleProof.amount,
			merkleProof.proof,
		);

		queueNotification(`Sign the transaction to claim your airdrop`, 'info');
		const diggAmount = this.airdrops.digg;
		estimateAndSend(web3, gasPrices[gasPrice], method, connectedAddress, (transaction: PromiEvent<Contract>) => {
			transaction
				.on('transactionHash', () => {
					queueNotification(`Claim submitted.`, 'info');
				})
				.on('receipt', () => {
					queueNotification(`Rewards claimed.`, 'success');
					this.fetchSettRewards();
					this.fetchContracts();

					if (stake) {
						const badgerGeyser = this.geysers['0xa9429271a28f8543efffa136994c0839e7d7bf77'];
						this.depositAndStake(badgerGeyser, diggAmount);
					}
				})
				.catch((error: any) => {
					this.fetchContracts();
					queueNotification(error.message, 'error');
					setTxStatus('error');
				});
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
					.on('transactionHash', () => {
						queueNotification(`Transaction submitted.`, 'info');
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
					.on('transactionHash', () => {
						queueNotification(`Deposit submitted.`, 'info');
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
					.on('transactionHash', () => {
						queueNotification(`Transaction submitted.`, 'info');
					})
					.on('receipt', () => {
						queueNotification(
							`Successfully unstaked ${inCurrency(amount, 'eth', true)} ${underlyingAsset.symbol}`,
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

		const underlyingAsset = this.tokens[vault[vault.underlyingKey]];
		// console.log("tokens: ", this.tokens)
		// console.log("underlying address: ", underlyingAsset)

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
					.on('transactionHash', () => {
						queueNotification(`Deposit submitted.`, 'info');
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
					.on('transactionHash', () => {
						queueNotification(`Withdraw submitted.`, 'info');
					})
					.on('receipt', () => {
						queueNotification(
							`Successfully withdrew ${inCurrency(amount, 'eth', true)} ${vault.symbol}`,
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

	calculateGeyserRewards = action(() => {
		const { geysers, tokens, vaults } = this;
		const { } = this.store.uiState;
		const { } = this.store.wallet;

		const rewardToken = tokens[rewardsConfig.tokens[0]];

		if (!tokens || !rewardToken) return;

		const timestamp = new BigNumber(new Date().getTime() / 1000.0);
		const geyserRewards = _.mapValues(geysers, (geyser: any) => {
			const schedule = geyser['getUnlockSchedulesFor'];
			const underlyingVault = vaults[geyser[geyser.underlyingKey]];

			if (!schedule || !underlyingVault) return {};

			const rawToken = tokens[underlyingVault[underlyingVault.underlyingKey]];

			// sum rewards in current period
			// todo: break out to actual durations
			const rewardSchedule = reduceGeyserSchedule(timestamp, schedule);

			return _.mapValues(rewardSchedule, (reward: any) => {
				return (
					!!rawToken.ethValue &&
					reward
						.multipliedBy(rewardToken.ethValue)
						.dividedBy(
							rawToken.ethValue
								.multipliedBy(underlyingVault.balance)
								.multipliedBy(underlyingVault.getPricePerFullShare.dividedBy(1e18)),
						)
				);
			});
		});

		this.updateGeysers(geyserRewards);

		// grab sushi APYs
		_.map(geyserConfigs, (config: any) => {
			if (!!config.growthEndpoints) {
				// let masterChef = chefQueries(config.contracts, this.geysers, config.growthEndpoints[0])
				const xSushi = vanillaQuery(config.growthEndpoints[1]);

				// First we grab the sushi pair contracts from the sushi geysers
				const sushiSuffix: string[] = [];
				_.map(config.contracts, (contract: any) => {
					try {
						sushiSuffix.push(this.vaults[this.geysers[contract].getStakingToken].token);
					} catch (e) {
						process.env.NODE_ENV !== 'production' && console.log(e);
					}
				});
				// Then we use the provided API from sushi to get the ROI numbers
				const newMasterChef = vanillaQuery(config.growthEndpoints[2].concat(sushiSuffix.join(';')));

				Promise.all([xSushi, newMasterChef]).then((results: any) => {
					const xROI: any = reduceXSushiROIResults(results[0]['weekly_APY']);
					const newSushiRewards = reduceSushiAPIResults(results[1], config.contracts);
					this.updateGeysers(
						_.mapValues(newSushiRewards, (reward: any, geyserAddress: string) => {
							const geyser = geysers[geyserAddress];
							if (!geyser) return;

							const vault = vaults[geyser[geyser.underlyingKey]];
							if (!vault) return;

							const vaultBalance = vault.balance;
							const tokenValue = this.tokens[vault.token].ethValue;
							if (!tokenValue) return;

							const vaultEthVal = vaultBalance.multipliedBy(tokenValue.dividedBy(1e18));
							return {
								sushiRewards: _.mapValues(reward, (periodROI: BigNumber, period: string) => {
									if (periodROI.toString().substr(0, 2) != '0x') {
										const sushiRewards = vaultEthVal.multipliedBy(periodROI);
										const xsushiRewards = sushiRewards.multipliedBy(xROI[period].dividedBy(100));
										const xsushiROI = xsushiRewards.dividedBy(vaultEthVal);
										periodROI = periodROI.plus(xsushiROI);
									}
									return periodROI;
								}),
							};
						}),
					);
				});
			}
		});
	});
}

export default ContractsStore;
