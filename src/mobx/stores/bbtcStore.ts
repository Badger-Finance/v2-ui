import BigNumber from 'bignumber.js';
import { extendObservable, action, observe, autorun } from 'mobx';
import async from 'async';
import { PromiEvent } from 'web3-core';
import { Contract } from 'web3-eth-contract';
import { AbiItem } from 'web3-utils';
import SETT from 'config/system/abis/Sett.json';
import BadgerBtcPeak from 'config/system/abis/BadgerBtcPeak.json';
import Web3 from 'web3';
import { estimateAndSend } from '../utils/web3';
import addresses from '../../config/bbtc/addresses.json';
import { TokenModel } from 'components/Bbtc/model';
import { RootStore } from '../store';
import { formatAmount } from 'mobx/reducers/statsReducers';

const ZERO = new BigNumber(0);
const MAX = Web3.utils.toTwosComplement(-1);

// TODO: I need three pool token 0, 1 and 2 respectively bcrvRenWSBTC,
// bcrvRenWBTC, and b-tbtc/sbtcCrv
// Use the pool id with each three tokens
// Have bBTC
// Fetch balances
// Check allowance
// Mint and Redeem

class BBTCStore {
	private store!: RootStore;
	private config!: typeof addresses.mainnet;
	private client!: any;

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

	mint = action((inToken: TokenModel, amount: BigNumber) => {
		const { queueNotification, setTxStatus } = this.store.uiState;
		const { connectedAddress } = this.store.wallet;
		if (!connectedAddress) {
			return queueNotification('Please connect a wallet', 'error');
		}
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
						this.increaseAllowance(inToken, this.config.contracts.peak, callback, amount),
					);
				methodSeries.push((callback: any) => this.mintBBTC(inToken, amount, callback));
				setTxStatus('pending');
				async.series(methodSeries, (err: any, results: any) => {
					console.log(err, results);
					setTxStatus(!!err ? 'error' : 'success');
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
						this.fetchBalances();
						callback(null, {});
					})
					.catch((error: any) => {
						this.fetchBalances();
						queueNotification(error.message, 'error');
						setTxStatus('error');
					});
			},
		);
	});

	redeem = action((inToken: TokenModel, amount: BigNumber) => {
		const { queueNotification, setTxStatus } = this.store.uiState;
		const { connectedAddress } = this.store.wallet;
		if (!connectedAddress) {
			return queueNotification('Please connect a wallet', 'error');
		}
		if (!amount || amount.isNaN() || amount.lte(0))
			return queueNotification('Please enter a valid amount', 'error');
		if (amount.gt(this.bBTC.balance))
			return queueNotification(`You have insufficient balance of ${this.bBTC.symbol}`, 'error');

		const methodSeries: any = [];
		async.parallel(
			[(callback: any) => this.getAllowance(this.bBTC, this.config.contracts.peak, callback)],
			(err: any, allowances: any) => {
				// make sure we have allowance
				if (amount.gt(allowances[0]))
					methodSeries.push((callback: any) =>
						this.increaseAllowance(this.bBTC, this.config.contracts.peak, callback, amount),
					);
				methodSeries.push((callback: any) => this.redeemBBTC(inToken, amount, callback));
				setTxStatus('pending');
				async.series(methodSeries, (err: any, results: any) => {
					console.log(err, results);
					setTxStatus(!!err ? 'error' : 'success');
				});
			},
		);
	});
	redeemBBTC = action((inToken: TokenModel, amount: BigNumber, callback: (err: any, result: any) => void) => {
		const { queueNotification, setTxStatus } = this.store.uiState;
		const { provider, connectedAddress } = this.store.wallet;

		const web3 = new Web3(provider);
		const peakContract = new web3.eth.Contract(BadgerBtcPeak.abi as AbiItem[], this.config.contracts.peak);
		const method = peakContract.methods.redeem(inToken.poolId, amount);

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
						queueNotification(`Successfully redeemed ${inToken.symbol}`, 'success');
						this.fetchBalances();
						callback(null, {});
					})
					.catch((error: any) => {
						this.fetchBalances();
						queueNotification(error.message, 'error');
						setTxStatus('error');
					});
			},
		);
	});
}

export default BBTCStore;
