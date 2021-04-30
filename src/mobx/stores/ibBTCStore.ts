import { RootStore } from 'mobx/store';
import { extendObservable, action, observe } from 'mobx';
import async from 'async';

import BigNumber from 'bignumber.js';
import { PromiEvent } from 'web3-core';
import { Contract } from 'web3-eth-contract';
import { AbiItem, toHex, toBN } from 'web3-utils';
import Web3 from 'web3';
import { TokenModel } from 'mobx/model';
import { estimateAndSend } from 'mobx/utils/web3';

import SETT from 'config/system/abis/Sett.json';
import ibBTCConfig from 'config/system/abis/ibBTC.json';
import addresses from 'config/ibBTC/addresses.json';
import BadgerBtcPeak from 'config/system/abis/BadgerBtcPeak.json';
import BadgerYearnWbtcPeak from 'config/system/abis/BadgerYearnWbtcPeak.json';
import { ZERO, MAX, FLAGS, NETWORK_IDS } from 'config/constants';

interface IbBTCApyInfo {
	fromLastDay: number;
	fromLastWeek: number;
}

type PeakType = { address: string; isYearnWBTCPeak: boolean; abi: any };

class IbBTCStore {
	private store!: RootStore;
	private config!: typeof addresses.mainnet;

	public tokens: Array<TokenModel> = [];
	public ibBTC: TokenModel;
	apyInfo?: IbBTCApyInfo;

	constructor(store: RootStore) {
		this.store = store;
		this.config = addresses.mainnet;
		const token_config = this.config.contracts.tokens;

		extendObservable(this, {
			tokens: [],
			ibBTC: null,
			apyInfo: this.apyInfo,
		});

		this.ibBTC = new TokenModel(this.store, token_config['ibBTC']);
		this.tokens = [
			new TokenModel(this.store, token_config['bcrvRenWSBTC']),
			new TokenModel(this.store, token_config['bcrvRenWBTC']),
			new TokenModel(this.store, token_config['btbtc/sbtcCrv']),
			new TokenModel(this.store, token_config['byvWbtc']),
		];

		observe(this.store.wallet as any, 'connectedAddress', () => {
			this.init();
		});

		if (!!this.store.wallet.connectedAddress) this.init();
	}

	init = action((): void => {
		const { connectedAddress, network } = this.store.wallet;
		if (!FLAGS.IBBTC_FLAG || network.networkId !== NETWORK_IDS.ETH) return;

		if (!!connectedAddress) this.fetchBalances();
		else this.resetBalances();
		this.fetchConversionRates();
		this.fetchIbbtcApy();
	});

	getPeakForToken = action(
		(symbol: string): PeakType => {
			const peak: PeakType = {
				address: this.config.contracts.BadgerSettPeak.address,
				isYearnWBTCPeak: false,
				abi: BadgerBtcPeak.abi,
			};
			if (this.config.contracts.yearnWBTCPeak.supportedTokens.includes(symbol)) {
				peak.address = this.config.contracts.yearnWBTCPeak.address;
				peak.isYearnWBTCPeak = true;
				peak.abi = BadgerYearnWbtcPeak.abi;
			}

			// Curve Peak as default peak
			return peak;
		},
	);

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
			// TODO: promise.all this
			for (const token of this.tokens) {
				token.balance = await this.fetchBalance(token);
			}

			this.ibBTC.balance = await this.fetchBalance(this.ibBTC);
		},
	);

	fetchIbbtcApy = action(async () => {
		const { provider } = this.store.wallet;

		if (!provider) return;

		try {
			const dailyBlocks = 5760; // Block in 24 hrs = 86400 / 15
			const weeklyBlocks = dailyBlocks * 7;
			const web3 = new Web3(provider);
			const ibBTC = new web3.eth.Contract(ibBTCConfig.abi as AbiItem[], this.ibBTC.address);
			const nowBlock = await web3.eth.getBlock('latest');
			const { number: currentBlock } = nowBlock;

			const [dayOldBlock, weekOldBlock, currentPPS, dayOldPPS, weekOldPPS] = await Promise.all([
				web3.eth.getBlock(currentBlock - dailyBlocks),
				web3.eth.getBlock(currentBlock - weeklyBlocks),
				ibBTC.methods.getPricePerFullShare().call(),
				ibBTC.methods.getPricePerFullShare().call({}, currentBlock - dailyBlocks),
				ibBTC.methods.getPricePerFullShare().call({}, currentBlock - weeklyBlocks),
			]);

			const earnedInDay =
				parseFloat(web3.utils.fromWei(currentPPS)) / parseFloat(web3.utils.fromWei(dayOldPPS)) - 1;
			const earnedInWeek =
				parseFloat(web3.utils.fromWei(currentPPS)) / parseFloat(web3.utils.fromWei(weekOldPPS)) - 1;
			const multiplier = 3153600000;

			const dailyPY = (earnedInDay * multiplier) / (Number(nowBlock.timestamp) - Number(dayOldBlock.timestamp));
			const weeklyPY =
				(earnedInWeek * multiplier) / (Number(nowBlock.timestamp) - Number(weekOldBlock.timestamp));

			this.apyInfo = {
				fromLastDay: dailyPY * 365,
				fromLastWeek: weeklyPY * 52,
			};
		} catch (error) {
			process.env.NODE_ENV !== 'production' && console.error(error);
		}
	});

	resetBalances = action((): void => {
		// ZERO balance for all tokens
		this.tokens.forEach((token) => {
			token.balance = ZERO;
		});
		this.ibBTC.balance = ZERO;
	});

	fetchConversionRates = action(
		async (): Promise<void> => {
			const { provider } = this.store.wallet;
			if (!provider) return;

			// Fetch mintRate, redeemRate and set to respected token
			await this.tokens.map((token) => Promise.all([this.fetchMintRate(token), this.fetchRedeemRate(token)]));
		},
	);

	fetchMintRate = action(
		async (token: TokenModel): Promise<void> => {
			const callback = (err: any, result: any): void => {
				if (!err) token.mintRate = token.unscale(new BigNumber(result[0])).toString(10);
				else token.mintRate = '0';
			};

			await this.calcMintAmount(token, token.scale(new BigNumber(1)), callback);
		},
	);

	fetchRedeemRate = action(
		async (token: TokenModel): Promise<void> => {
			const callback = (err: any, result: any): void => {
				if (!err) token.redeemRate = token.unscale(new BigNumber(result[0])).toString(10);
				else token.redeemRate = '0';
			};

			await this.calcRedeemAmount(token, token.scale(new BigNumber(1)), callback);
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
			const hexAmount = toHex(toBN(amount as any));
			const method = tokenContract.methods.increaseAllowance(spender, hexAmount);

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

		const peak = this.getPeakForToken(inToken.symbol);
		const methodSeries: any = [];
		async.parallel(
			[(callback: any) => this.getAllowance(inToken, peak.address, callback)],
			(err: any, allowances: any) => {
				// make sure we have allowance
				if (amount.gt(allowances[0]))
					methodSeries.push((callback: any) =>
						// skip amount to approve max
						this.increaseAllowance(inToken, peak.address, callback),
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

			const peak = this.getPeakForToken(inToken.symbol);
			const web3 = new Web3(provider);
			const peakContract = new web3.eth.Contract(peak.abi as AbiItem[], peak.address);
			const hexAmount = toHex(toBN(amount as any));
			let method = null;
			if (peak.isYearnWBTCPeak) method = peakContract.methods.calcMint(hexAmount);
			else method = peakContract.methods.calcMint(inToken.poolId, hexAmount);

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

		const peak = this.getPeakForToken(inToken.symbol);
		const web3 = new Web3(provider);
		const peakContract = new web3.eth.Contract(peak.abi as AbiItem[], peak.address);
		const hexAmount = toHex(toBN(amount as any));
		const merkleProof: any[] = [];
		let method = null;
		if (peak.isYearnWBTCPeak) method = peakContract.methods.mint(hexAmount, merkleProof);
		else method = peakContract.methods.mint(inToken.poolId, hexAmount, merkleProof);

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

			const peak = this.getPeakForToken(outToken.symbol);
			const web3 = new Web3(provider);
			const peakContract = new web3.eth.Contract(peak.abi as AbiItem[], peak.address);
			const hexAmount = toHex(toBN(amount as any));
			let method = null;
			if (peak.isYearnWBTCPeak) method = peakContract.methods.calcRedeem(hexAmount);
			else method = peakContract.methods.calcRedeem(outToken.poolId, hexAmount);

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

		const peak = this.getPeakForToken(outToken.symbol);
		const web3 = new Web3(provider);
		const peakContract = new web3.eth.Contract(peak.abi as AbiItem[], peak.address);
		const hexAmount = toHex(toBN(amount as any));
		let method = null;
		if (peak.isYearnWBTCPeak) method = peakContract.methods.redeem(hexAmount);
		else method = peakContract.methods.redeem(outToken.poolId, hexAmount);

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
