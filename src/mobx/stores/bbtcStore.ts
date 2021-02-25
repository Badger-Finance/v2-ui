import { RootStore } from '../store';
import { extendObservable, action, observe } from 'mobx';
import async from 'async';

import BigNumber from 'bignumber.js';
import { PromiEvent } from 'web3-core';
import { Contract } from 'web3-eth-contract';
import { AbiItem } from 'web3-utils';
import Web3 from 'web3';
import { TokenModel } from 'mobx/model';
import { estimateAndSend } from '../utils/web3';

import SETT from 'config/system/abis/Sett.json';
import addresses from '../../config/bbtc/addresses.json';
import BadgerBtcPeak from 'config/system/abis/BadgerBtcPeak.json';

const ZERO = new BigNumber(0);
const MAX = Web3.utils.toTwosComplement(-1);

class BBTCStore {
	private store!: RootStore;
	private config!: typeof addresses.mainnet;

	public tokens: Array<TokenModel> = [];
	public bBTC: TokenModel;

	constructor(store: RootStore) {
		this.store = store;
		this.config = addresses.mainnet;
		const token_config = this.config.contracts.tokens;

		extendObservable(this, {
			tokens: [],
			bBTC: null,
		});

		this.bBTC = new TokenModel(this.store, token_config['bBTC']);
		this.tokens = [new TokenModel(this.store, token_config['bcrvRenWSBTC'])];

		observe(this.store.wallet as any, 'connectedAddress', () => {
			const { connectedAddress } = this.store.wallet;
			if (!!connectedAddress) {
				this.init();
			}
		});

		observe(this as any, 'tokens', () => {
			console.log('updated');
			const { tokens } = this;
			console.log(tokens);
		});

		if (!!this.store.wallet.connectedAddress) this.init();
	}

	init = action((): void => {
		this.fetchBalances();
		this.fetchConversionRates();
	});

	fetchBalances = action(
		async (): Promise<void> => {
			// Fetch balance for all tokens
			this.tokens.forEach(async (token) => {
				token.balance = await this.fetchBalance(token);
			});
			this.bBTC.balance = await this.fetchBalance(this.bBTC);
		},
	);

	fetchConversionRates = action(
		async (): Promise<void> => {
			// Fetch mint rate and redeem rate
			this.tokens.forEach(async (token) => {
				this.fetchMintRate(token);
				this.fetchRedeemRate(token);
			});
		},
	);

	fetchMintRate = action((token: TokenModel): void => {
		const callback = (err: any, result: any): void => {
			if (!err) token.mintRate = token.unscale(new BigNumber(result)).toString(10);
			else token.mintRate = ZERO;
		};

		this.calcMintAmount(token, token.scale(new BigNumber(1)), callback);
	});

	fetchRedeemRate = action((token: TokenModel): void => {
		const callback = (err: any, result: any): void => {
			if (!err) token.redeemRate = token.unscale(new BigNumber(result)).toString(10);
			else token.redeemRate = ZERO;
		};

		this.calcRedeemAmount(token, token.scale(new BigNumber(1)), callback);
	});

	fetchBalance = action(
		async (token: TokenModel): Promise<BigNumber> => {
			const { provider, connectedAddress } = this.store.wallet;
			if (!connectedAddress) return ZERO;

			const web3 = new Web3(provider);
			const tokenContract = new web3.eth.Contract(SETT.abi as AbiItem[], token.address);
			let balance = tokenContract.methods.balanceOf(connectedAddress);
			balance = await balance.call();

			return new BigNumber(balance);
		},
	);

	getAllowance = action((underlyingAsset: TokenModel, spender: string, callback: (err: any, result: any) => void) => {
		const { provider, connectedAddress } = this.store.wallet;
		const web3 = new Web3(provider);
		const tokenContract = new web3.eth.Contract(SETT.abi as AbiItem[], underlyingAsset.address);
		const method = tokenContract.methods.allowance(connectedAddress, spender);

		method.call().then((result: any) => {
			callback(null, result);
		});
	});

	increaseAllowance = action(
		(
			underlyingAsset: TokenModel,
			spender: string,
			callback: (err: any, result: any) => void,
			amount: BigNumber | string = MAX,
		) => {
			const { queueNotification, setTxStatus } = this.store.uiState;
			const { provider, connectedAddress } = this.store.wallet;

			const web3 = new Web3(provider);
			const tokenContract = new web3.eth.Contract(SETT.abi as AbiItem[], underlyingAsset.address);
			const method = tokenContract.methods.increaseAllowance(spender, amount);

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
							callback(null, {});
						})
						.catch((error: any) => {
							queueNotification(error.message, 'error');
							setTxStatus('error');
						});
				},
			);
		},
	);

	mint = action((inToken: TokenModel, amount: BigNumber, callback: (err: any, result: any) => void) => {
		const { queueNotification, setTxStatus } = this.store.uiState;
		const { connectedAddress } = this.store.wallet;

		if (!connectedAddress) return queueNotification('Please connect a wallet', 'error');

		if (!amount || amount.isNaN() || amount.lte(0))
			return queueNotification('Please enter a valid amount', 'error');
		if (amount.gt(inToken.balance))
			return queueNotification(`You have insufficient balance of ${inToken.symbol}`, 'error');

		const methodSeries: any = [];
		async.parallel(
			[(callback: any) => this.getAllowance(inToken, this.config.contracts.peak, callback)],
			(err: any, allowances: any) => {
				// make sure we have allowance
				if (amount.gt(allowances[0]))
					methodSeries.push((callback: any) =>
						// skip amount to approve max
						this.increaseAllowance(inToken, this.config.contracts.peak, callback, amount),
					);
				methodSeries.push((callback: any) => this.mintBBTC(inToken, amount, callback));
				setTxStatus('pending');
				async.series(methodSeries, (err: any, results: any) => {
					setTxStatus(!!err ? 'error' : 'success');
					callback(err, results);
				});
			},
		);
	});
	calcMintAmount = action((inToken: TokenModel, amount: BigNumber, callback: (err: any, result: any) => void) => {
		const { provider } = this.store.wallet;

		const web3 = new Web3(provider);
		const peakContract = new web3.eth.Contract(BadgerBtcPeak.abi as AbiItem[], this.config.contracts.peak);
		const method = peakContract.methods.calcMint(inToken.poolId, amount);

		method.call().then((result: any) => {
			callback(null, result);
		});
	});

	mintBBTC = action((inToken: TokenModel, amount: BigNumber, callback: (err: any, result: any) => void) => {
		const { queueNotification, setTxStatus } = this.store.uiState;
		const { provider, connectedAddress } = this.store.wallet;

		const web3 = new Web3(provider);
		const peakContract = new web3.eth.Contract(BadgerBtcPeak.abi as AbiItem[], this.config.contracts.peak);
		const method = peakContract.methods.mint(inToken.poolId, amount);

		estimateAndSend(
			web3,
			this.store.wallet.gasPrices[this.store.uiState.gasPrice],
			method,
			connectedAddress,
			(transaction: PromiEvent<Contract>) => {
				transaction
					.on('transactionHash', (hash) => {
						queueNotification(`Mint submitted.`, 'info', hash);
					})
					.on('receipt', () => {
						queueNotification(`Successfully minted ${this.bBTC.symbol}`, 'success');
						this.init();
						callback(null, {});
					})
					.catch((error: any) => {
						this.init();
						queueNotification(error.message, 'error');
						setTxStatus('error');
					});
			},
		);
	});

	redeem = action((outToken: TokenModel, amount: BigNumber, callback: (err: any, result: any) => void) => {
		const { queueNotification } = this.store.uiState;
		const { connectedAddress } = this.store.wallet;

		if (!connectedAddress) return queueNotification('Please connect a wallet', 'error');
		if (!amount || amount.isNaN() || amount.lte(0))
			return queueNotification('Please enter a valid amount', 'error');
		if (amount.gt(this.bBTC.balance))
			return queueNotification(`You have insufficient balance of ${this.bBTC.symbol}`, 'error');

		this.redeemBBTC(outToken, amount, callback);
	});

	calcRedeemAmount = action((outToken: TokenModel, amount: BigNumber, callback: (err: any, result: any) => void) => {
		const { provider } = this.store.wallet;

		const web3 = new Web3(provider);
		const peakContract = new web3.eth.Contract(BadgerBtcPeak.abi as AbiItem[], this.config.contracts.peak);
		const method = peakContract.methods.calcRedeem(outToken.poolId, amount);

		method.call().then((result: any) => {
			callback(null, result);
		});
	});

	redeemBBTC = action((outToken: TokenModel, amount: BigNumber, callback: (err: any, result: any) => void) => {
		const { queueNotification, setTxStatus } = this.store.uiState;
		const { provider, connectedAddress } = this.store.wallet;

		const web3 = new Web3(provider);
		const peakContract = new web3.eth.Contract(BadgerBtcPeak.abi as AbiItem[], this.config.contracts.peak);
		const method = peakContract.methods.redeem(outToken.poolId, amount);

		estimateAndSend(
			web3,
			this.store.wallet.gasPrices[this.store.uiState.gasPrice],
			method,
			connectedAddress,
			(transaction: PromiEvent<Contract>) => {
				transaction
					.on('transactionHash', (hash) => {
						queueNotification(`Redeem submitted.`, 'info', hash);
					})
					.on('receipt', () => {
						queueNotification(`Successfully redeemed ${outToken.symbol}`, 'success');
						this.init();
						callback(null, {});
					})
					.catch((error: any) => {
						this.init();
						queueNotification(error.message, 'error');
						setTxStatus('error');
					});
			},
		);
	});
}

export default BBTCStore;
