import { RootStore } from 'mobx/store';
import { extendObservable, action, observe } from 'mobx';
import async from 'async';

import BigNumber from 'bignumber.js';
import { PromiEvent } from 'web3-core';
import { Contract } from 'web3-eth-contract';
import { AbiItem } from 'web3-utils';
import Web3 from 'web3';
import { TokenModel } from 'mobx/model';
import { estimateAndSend } from 'mobx/utils/web3';

import SETT from 'config/system/abis/Sett.json';
import addresses from 'config/ibBTC/addresses.json';
import BadgerBtcPeak from 'config/system/abis/BadgerBtcPeak.json';
import { ZERO, MAX } from 'config/constants';

class IbBTCStore {
	private store!: RootStore;
	private config!: typeof addresses.mainnet;

	public tokens: Array<TokenModel> = [];
	public ibBTC: TokenModel;

	constructor(store: RootStore) {
		this.store = store;
		this.config = addresses.mainnet;
		const token_config = this.config.contracts.tokens;

		extendObservable(this, {
			tokens: [],
			ibBTC: null,
		});

		this.ibBTC = new TokenModel(this.store, token_config['ibBTC']);
		this.tokens = [
			new TokenModel(this.store, token_config['bcrvRenWSBTC']),
			new TokenModel(this.store, token_config['bcrvRenWBTC']),
			new TokenModel(this.store, token_config['btbtc/sbtcCrv']),
		];

		observe(this.store.wallet as any, 'connectedAddress', () => {
			this.init();
		});

		if (!!this.store.wallet.connectedAddress) this.init();
	}

	init = action((): void => {
		const { connectedAddress } = this.store.wallet;
		if (!!connectedAddress) this.fetchBalances();
		else this.resetBalances();
		this.fetchConversionRates();
	});

	validate = action((amount: BigNumber, token: TokenModel): boolean | void => {
		const { queueNotification } = this.store.uiState;
		const { connectedAddress } = this.store.wallet;

		if (!connectedAddress) return queueNotification('Please connect a wallet', 'error');
		if (!amount || amount.isNaN() || amount.lte(0))
			return queueNotification('Please enter a valid amount', 'error');
		if (amount.gt(token.balance))
			return queueNotification(`You have insufficient balance of ${token.symbol}`, 'error');

		return true;
	});

	fetchBalances = action(
		async (): Promise<void> => {
			// Fetch balance for all tokens
			this.tokens.forEach(async (token) => {
				token.balance = await this.fetchBalance(token);
			});
			this.ibBTC.balance = await this.fetchBalance(this.ibBTC);
		},
	);

	resetBalances = action((): void => {
		// ZERO balance for all tokens
		this.tokens.forEach((token) => {
			token.balance = ZERO;
		});
		this.ibBTC.balance = ZERO;
	});

	fetchConversionRates = action(
		async (): Promise<void> => {
			// Fetch mintRate, redeemRate and set to respected token
			const { provider } = this.store.wallet;
			if (provider) {
				this.tokens.forEach(async (token) => {
					this.fetchMintRate(token);
					this.fetchRedeemRate(token);
				});
			}
		},
	);

	fetchMintRate = action((token: TokenModel): void => {
		const callback = (err: any, result: any): void => {
			if (!err) token.mintRate = token.unscale(new BigNumber(result[0])).toString(10);
			else token.mintRate = '0';
		};

		this.calcMintAmount(token, token.scale(new BigNumber(1)), callback);
	});

	fetchRedeemRate = action((token: TokenModel): void => {
		const callback = (err: any, result: any): void => {
			if (!err) token.redeemRate = token.unscale(new BigNumber(result[0])).toString(10);
			else token.redeemRate = '0';
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

	getAllowance = action(
		async (underlyingAsset: TokenModel, spender: string, callback: (err: any, result: any) => void) => {
			const { queueNotification } = this.store.uiState;
			const { provider, connectedAddress } = this.store.wallet;
			const web3 = new Web3(provider);
			const tokenContract = new web3.eth.Contract(SETT.abi as AbiItem[], underlyingAsset.address);
			const method = tokenContract.methods.allowance(connectedAddress, spender);

			try {
				const result = await method.call();
				callback(null, result);
			} catch (err) {
				queueNotification(err.message, 'error');
				callback(err, null);
			}
		},
	);

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
		const { setTxStatus } = this.store.uiState;

		if (!this.validate(amount, inToken)) return;

		const methodSeries: any = [];
		async.parallel(
			[(callback: any) => this.getAllowance(inToken, this.config.contracts.peak, callback)],
			(err: any, allowances: any) => {
				// make sure we have allowance
				if (amount.gt(allowances[0]))
					methodSeries.push((callback: any) =>
						// skip amount to approve max
						this.increaseAllowance(inToken, this.config.contracts.peak, callback),
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

	calcMintAmount = action(
		async (inToken: TokenModel, amount: BigNumber, callback: (err: any, result: any) => void) => {
			const { queueNotification } = this.store.uiState;
			const { provider } = this.store.wallet;

			if (!provider) return queueNotification('Please connect a wallet', 'error');

			const web3 = new Web3(provider);
			const peakContract = new web3.eth.Contract(BadgerBtcPeak.abi as AbiItem[], this.config.contracts.peak);
			const method = peakContract.methods.calcMint(inToken.poolId, amount);

			try {
				const result = await method.call();
				callback(null, result);
			} catch (err) {
				queueNotification(err.message, 'error');
				callback(err, null);
			}
		},
	);

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
						queueNotification(`Successfully minted ${this.ibBTC.symbol}`, 'success');
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
		if (!this.validate(amount, this.ibBTC)) return;

		this.redeemBBTC(outToken, amount, callback);
	});

	calcRedeemAmount = action(
		async (outToken: TokenModel, amount: BigNumber, callback: (err: any, result: any) => void) => {
			const { queueNotification } = this.store.uiState;
			const { provider } = this.store.wallet;

			if (!provider) return queueNotification('Please connect a wallet', 'error');

			const web3 = new Web3(provider);
			const peakContract = new web3.eth.Contract(BadgerBtcPeak.abi as AbiItem[], this.config.contracts.peak);
			const method = peakContract.methods.calcRedeem(outToken.poolId, amount);

			try {
				const result = await method.call();
				callback(null, result);
			} catch (err) {
				queueNotification(err.message, 'error');
				callback(err, null);
			}
		},
	);

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

export default IbBTCStore;
