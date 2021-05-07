import { RootStore } from 'mobx/store';
import { extendObservable, action, observe, decorate, observable } from 'mobx';

import BigNumber from 'bignumber.js';
import { PromiEvent } from 'web3-core';
import { Contract, ContractSendMethod } from 'web3-eth-contract';
import { AbiItem } from 'web3-utils';
import Web3 from 'web3';
import { ibBTCFees, TokenModel } from 'mobx/model';
import { estimateAndSend } from 'mobx/utils/web3';

import { ZERO, MAX, FLAGS, NETWORK_IDS } from 'config/constants';
import yearnConfig from 'config/system/abis/YearnWrapper.json';
import settConfig from 'config/system/abis/Sett.json';
import ibBTCConfig from 'config/system/abis/ibBTC.json';
import badgerPeakSwap from 'config/system/abis/BadgerBtcPeakSwap.json';
import addresses from 'config/ibBTC/addresses.json';
import BadgerBtcPeak from 'config/system/abis/BadgerBtcPeak.json';
import BadgerYearnWbtcPeak from 'config/system/abis/BadgerYearnWbtcPeak.json';
import guessListConfig from 'config/system/abis/BadgerBtcPeakGuestList.json';
import coreConfig from 'config/system/abis/BadgerBtcPeakCore.json';

interface MintAmountCalculation {
	bBTC: BigNumber;
	fee: BigNumber;
}

interface RedeemAmountCalculation {
	fee: BigNumber;
	max: BigNumber;
	sett: BigNumber;
}

interface PeakType {
	address: string;
	isYearnWBTCPeak: boolean;
	abi: any;
}

decorate(TokenModel, { balance: observable, redeemRate: observable, mintRate: observable });

class IbBTCStore {
	private readonly store: RootStore;
	private config: typeof addresses.mainnet;

	public tokens: Array<TokenModel> = [];
	public ibBTC: TokenModel;
	public apyUsingLastDay?: string | null;
	public apyUsingLastWeek?: string | null;
	public mintFee?: BigNumber;
	public redeemFee?: BigNumber;

	constructor(store: RootStore) {
		this.store = store;
		this.config = addresses.mainnet;
		const token_config = this.config.contracts.tokens;

		this.ibBTC = new TokenModel(this.store, token_config['ibBTC']);
		this.tokens = [
			new TokenModel(this.store, token_config['bcrvRenWSBTC']),
			new TokenModel(this.store, token_config['bcrvRenWBTC']),
			new TokenModel(this.store, token_config['btbtc/sbtcCrv']),
			new TokenModel(this.store, token_config['byvWBTC']),
		];

		extendObservable(this, {
			tokens: this.tokens,
			ibBTC: this.ibBTC,
			apyUsingLastDay: this.apyUsingLastDay,
			apyUsingLastWeek: this.apyUsingLastWeek,
			mintFee: this.mintFee,
			redeemFee: this.redeemFee,
		});

		observe(this.store.wallet as any, 'connectedAddress', () => {
			this.init();
		});

		if (!!this.store.wallet.connectedAddress) this.init();
	}

	init(): void {
		const { connectedAddress, network } = this.store.wallet;
		if (!FLAGS.IBBTC_FLAG || network.networkId !== NETWORK_IDS.ETH) return;

		if (!connectedAddress) {
			this.resetBalances();
			return;
		}

		this.fetchTokensBalance().then();
		this.fetchConversionRates().then();
		this.fetchIbbtcApy().then();
		this.fetchFees().then();
	}

	fetchFees = action(
		async (): Promise<void> => {
			const fees = await this.getFees();
			this.mintFee = fees.mintFee;
			this.redeemFee = fees.redeemFee;
		},
	);

	fetchTokensBalance = action(
		async (): Promise<void> => {
			const fetchTargetTokensBalance = this.tokens.map((token) => this.fetchBalance(token));

			const [ibtcBalance, ...targetTokensBalance] = await Promise.all([
				this.fetchBalance(this.ibBTC),
				...fetchTargetTokensBalance,
			]);

			this.ibBTC.balance = ibtcBalance;
			for (let index = 0; index < targetTokensBalance.length; index++) {
				this.tokens[index].balance = targetTokensBalance[index];
			}
		},
	);

	fetchIbbtcApy = action(async () => {
		const dayOldBlock = 5760; // Block in 24 hrs = 86400 / 15
		const weekOldBlock = dayOldBlock * 7;
		const apyFromLastDay = await this.fetchIbbtApyFromTimestamp(dayOldBlock);
		const apyFromLastWeek = await this.fetchIbbtApyFromTimestamp(weekOldBlock);

		this.apyUsingLastDay = apyFromLastDay !== null ? `${(apyFromLastDay * 365).toFixed(3)}%` : null;
		this.apyUsingLastWeek = apyFromLastWeek !== null ? `${(apyFromLastWeek * 52).toFixed(3)}%` : null;
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
			try {
				const { bBTC } = await this.calcMintAmount(token, token.scale('1'));
				token.mintRate = this.ibBTC.unscale(bBTC).toString();
			} catch (error) {
				token.mintRate = '0';
			}
		},
	);

	fetchRedeemRate = action(
		async (token: TokenModel): Promise<void> => {
			try {
				const { sett } = await this.calcRedeemAmount(token, token.scale('1'));
				token.redeemRate = token.unscale(sett).toString();
			} catch (error) {
				token.redeemRate = '0';
			}
		},
	);

	fetchBalance = action(
		async (token: TokenModel): Promise<BigNumber> => {
			const { provider, connectedAddress } = this.store.wallet;
			if (!connectedAddress) return ZERO;

			const web3 = new Web3(provider);
			const tokenContract = new web3.eth.Contract(settConfig.abi as AbiItem[], token.address);
			let balance = tokenContract.methods.balanceOf(connectedAddress);
			balance = await balance.call();

			return new BigNumber(balance);
		},
	);

	resetBalances = action((): void => {
		// ZERO balance for all tokens
		this.tokens.forEach((token) => {
			token.balance = ZERO;
		});
		this.ibBTC.balance = ZERO;
	});

	isValidAmount = action((amount: BigNumber, token: TokenModel): boolean => {
		const { queueNotification } = this.store.uiState;

		if (!amount || amount.isNaN() || amount.lte(0)) {
			queueNotification('Please enter a valid amount', 'error');
			return false;
		}

		if (amount.gt(token.balance)) {
			queueNotification(`You have insufficient balance of ${token.symbol}`, 'error');
			return false;
		}

		return true;
	});

	getPeakForToken(symbol: string): PeakType {
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
	}

	async getMintValidation(amount: BigNumber, token: TokenModel): Promise<string | null> {
		const { queueNotification } = this.store.uiState;
		const { connectedAddress, provider } = this.store.wallet;
		const { abi: peakAbi, address: peakAddress } = this.getPeakForToken(token.symbol);

		if (!connectedAddress) {
			queueNotification('Please connect a wallet', 'error');
			return null;
		}

		try {
			const web3 = new Web3(provider);
			const peak = new web3.eth.Contract(peakAbi, peakAddress);
			const coreAddress = await peak.methods.core().call();
			const core = new web3.eth.Contract(coreConfig.abi as AbiItem[], coreAddress);
			const guessListAddress = await core.methods.guestList().call();
			const guessList = new web3.eth.Contract(guessListConfig.abi as AbiItem[], guessListAddress);

			const [userRemaining, totalRemaining, userDepositCap, totalDepositCap] = await Promise.all([
				guessList.methods.remainingUserDepositAllowed(connectedAddress).call(),
				guessList.methods.remainingTotalDepositAllowed().call(),
				guessList.methods.userDepositCap().call(),
				guessList.methods.totalDepositCap().call(),
			]);

			if (amount.gt(userRemaining)) {
				return `Your current mint amount limit is ${this.ibBTC.unscale(userRemaining)} ${
					this.ibBTC.symbol
				}. \nIndividual total mint amount limit is currently ${this.ibBTC.unscale(userDepositCap)} ${
					this.ibBTC.symbol
				}.`;
			}

			if (amount.gt(totalRemaining)) {
				return `The current global mint amount limit is ${this.ibBTC.unscale(totalRemaining)} ${
					this.ibBTC.symbol
				}. \nGlobal total mint amount is currently ${this.ibBTC.unscale(totalDepositCap)} ${
					this.ibBTC.symbol
				}.`;
			}
		} catch (error) {
			process.env.NODE_ENV !== 'production' && console.error(error);
			queueNotification('There was an error validating mint amount. Please try again later', 'error');
		}

		return null;
	}

	/**
	 * Calculates redeem conversion rate from a token using the following criteria
	 * for byvWBTCPeak => [bBtc.pricePerShare / 100] / byvWBTC.pricePerShare
	 * for BadgerPeak => [bBtc.pricePerShare * 1e36] / [sett.getPricePerFullShare] / swap.get_virtual_price]
	 * @param token token to be used in calculation
	 */
	async getRedeemConversionRate(token: TokenModel): Promise<BigNumber> {
		const { provider } = this.store.wallet;
		if (!provider) return ZERO;

		const { isYearnWBTCPeak, address, abi } = this.getPeakForToken(token.symbol);
		const web3 = new Web3(provider);
		const ibBTC = new web3.eth.Contract(ibBTCConfig.abi as AbiItem[], this.ibBTC.address);
		const ibBTCPricePerShare = await ibBTC.methods.pricePerShare().call();

		if (isYearnWBTCPeak) {
			const yearnToken = new web3.eth.Contract(yearnConfig.abi as AbiItem[], token.address);
			const yearnTokenPricePerShare = await yearnToken.methods.pricePerShare().call();
			return new BigNumber(ibBTCPricePerShare).dividedBy(100).dividedBy(yearnTokenPricePerShare);
		}

		const badgerBtcPeak = new web3.eth.Contract(abi, address);
		const settToken = new web3.eth.Contract(settConfig.abi as AbiItem[], token.address);
		const { swap: swapAddress } = await badgerBtcPeak.methods.pools(token.poolId).call();
		const swapContract = new web3.eth.Contract(badgerPeakSwap.abi as AbiItem[], swapAddress);

		const [settTokenPricePerShare, swapVirtualPrice] = await Promise.all([
			settToken.methods.getPricePerFullShare().call(),
			swapContract.methods.get_virtual_price().call(),
		]);

		return new BigNumber(ibBTCPricePerShare)
			.multipliedBy(1e36)
			.dividedBy(settTokenPricePerShare)
			.dividedBy(swapVirtualPrice);
	}

	async getFees(): Promise<ibBTCFees> {
		const { provider } = this.store.wallet;
		if (!provider) {
			return {
				mintFee: new BigNumber(0),
				redeemFee: new BigNumber(0),
			};
		}

		const web3 = new Web3(provider);
		const ibBTC = new web3.eth.Contract(ibBTCConfig.abi as AbiItem[], this.ibBTC.address);
		const coreAddress = await ibBTC.methods.core().call();
		const core = new web3.eth.Contract(coreConfig.abi as AbiItem[], coreAddress);
		const mintFee = await core.methods.mintFee().call();
		const redeemFee = await core.methods.redeemFee().call();

		if (mintFee && redeemFee) {
			return {
				mintFee: new BigNumber(mintFee).dividedBy(100),
				redeemFee: new BigNumber(redeemFee).dividedBy(100),
			};
		} else {
			return {
				mintFee: new BigNumber(0),
				redeemFee: new BigNumber(0),
			};
		}
	}

	async getAllowance(underlyingAsset: TokenModel, spender: string): Promise<BigNumber> {
		const { provider, connectedAddress } = this.store.wallet;
		const web3 = new Web3(provider);
		const tokenContract = new web3.eth.Contract(settConfig.abi as AbiItem[], underlyingAsset.address);
		const allowance = await tokenContract.methods.allowance(connectedAddress, spender).call();
		return new BigNumber(allowance);
	}

	async increaseAllowance(
		underlyingAsset: TokenModel,
		spender: string,
		amount: BigNumber | string = MAX,
	): Promise<void> {
		const { queueNotification, setTxStatus } = this.store.uiState;
		const { provider, connectedAddress } = this.store.wallet;

		const web3 = new Web3(provider);
		const tokenContract = new web3.eth.Contract(settConfig.abi as AbiItem[], underlyingAsset.address);
		const method = tokenContract.methods.increaseAllowance(spender, amount);

		queueNotification(`Sign the transaction to allow Badger to spend your ${underlyingAsset.symbol}`, 'info');

		return new Promise((resolve, reject) => {
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
							resolve();
						})
						.catch((error: any) => {
							setTxStatus('error');
							reject(error);
						});
				},
			);
		});
	}

	async mint(inToken: TokenModel, amount: BigNumber): Promise<void> {
		const { setTxStatus, queueNotification } = this.store.uiState;

		if (!this.isValidAmount(amount, inToken)) return;

		try {
			const peak = this.getPeakForToken(inToken.symbol);
			const allowance = await this.getAllowance(inToken, peak.address);

			// make sure we have allowance
			if (amount.gt(allowance)) {
				await this.increaseAllowance(inToken, peak.address);
			}

			setTxStatus('pending');
			await this.mintBBTC(inToken, amount);
			setTxStatus('success');
		} catch (error) {
			process.env.NODE_ENV !== 'production' && console.error(error);
			setTxStatus('error');
			queueNotification(`There was an error minting ${inToken.symbol}. Please try again later.`, 'error');
		}
	}
	async redeem(outToken: TokenModel, amount: BigNumber): Promise<void> {
		if (!this.isValidAmount(amount, this.ibBTC)) return;
		await this.redeemBBTC(outToken, amount);
	}

	async calcMintAmount(inToken: TokenModel, amount: BigNumber): Promise<MintAmountCalculation> {
		const { queueNotification } = this.store.uiState;
		const { provider } = this.store.wallet;
		const fallbackResponse = { bBTC: this.ibBTC.scale('0'), fee: this.ibBTC.scale('0') };

		if (!provider) {
			queueNotification('Please connect a wallet', 'error');
			return fallbackResponse;
		}

		try {
			let method: ContractSendMethod;
			const peak = this.getPeakForToken(inToken.symbol);
			const web3 = new Web3(provider);
			const peakContract = new web3.eth.Contract(peak.abi as AbiItem[], peak.address);
			if (peak.isYearnWBTCPeak) method = peakContract.methods.calcMint(amount);
			else method = peakContract.methods.calcMint(inToken.poolId, amount);
			const { bBTC, fee } = await method.call();
			return { bBTC: new BigNumber(bBTC), fee: new BigNumber(fee) };
		} catch (error) {
			process.env.NODE_ENV !== 'production' && console.error(error);
			queueNotification('There was an error calculating mint amount. Please try again later', 'error');
			return fallbackResponse;
		}
	}

	async calcRedeemAmount(outToken: TokenModel, amount: BigNumber): Promise<RedeemAmountCalculation> {
		const { queueNotification } = this.store.uiState;
		const { provider } = this.store.wallet;
		const fallbackResponse = {
			fee: this.ibBTC.scale('0'),
			max: this.ibBTC.scale('0'),
			sett: this.ibBTC.scale('0'),
		};

		if (!provider) {
			queueNotification('Please connect a wallet', 'error');
			return fallbackResponse;
		}

		try {
			let method: ContractSendMethod;
			const peak = this.getPeakForToken(outToken.symbol);
			const web3 = new Web3(provider);
			const peakContract = new web3.eth.Contract(peak.abi as AbiItem[], peak.address);
			if (peak.isYearnWBTCPeak) method = peakContract.methods.calcRedeem(amount);
			else method = peakContract.methods.calcRedeem(outToken.poolId, amount);
			const { fee, max, sett } = await method.call();

			return { fee: new BigNumber(fee), max: new BigNumber(max), sett: new BigNumber(sett) };
		} catch (error) {
			process.env.NODE_ENV !== 'production' && console.error(error);
			queueNotification('There was an error calculating redeem amount. Please try again later', 'error');
			return fallbackResponse;
		}
	}

	async mintBBTC(inToken: TokenModel, amount: BigNumber): Promise<void> {
		const { queueNotification, setTxStatus } = this.store.uiState;
		const { provider, connectedAddress } = this.store.wallet;

		if (!this.store.user.bouncerProof) {
			queueNotification('You are not part of the guest list yet. Please try again later', 'error');
			return;
		}

		let method: ContractSendMethod;
		const peak = this.getPeakForToken(inToken.symbol);
		const web3 = new Web3(provider);
		const peakContract = new web3.eth.Contract(peak.abi as AbiItem[], peak.address);
		const merkleProof = this.store.user.bouncerProof || [];
		if (peak.isYearnWBTCPeak) method = peakContract.methods.mint(amount, merkleProof);
		else method = peakContract.methods.mint(inToken.poolId, amount, merkleProof);

		return new Promise((resolve, reject) => {
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
							resolve();
						})
						.catch((error: any) => {
							this.init();
							setTxStatus('error');
							reject(error);
						});
				},
			);
		});
	}

	async redeemBBTC(outToken: TokenModel, amount: BigNumber): Promise<void> {
		const { queueNotification, setTxStatus } = this.store.uiState;
		const { provider, connectedAddress } = this.store.wallet;

		let method: ContractSendMethod;
		const peak = this.getPeakForToken(outToken.symbol);
		const web3 = new Web3(provider);
		const peakContract = new web3.eth.Contract(peak.abi as AbiItem[], peak.address);
		if (peak.isYearnWBTCPeak) method = peakContract.methods.redeem(amount);
		else method = peakContract.methods.redeem(outToken.poolId, amount);

		return new Promise((resolve, reject) => {
			estimateAndSend(
				web3,
				this.store.wallet.gasPrices[this.store.uiState.gasPrice],
				method,
				connectedAddress,
				(transaction: PromiEvent<Contract>) => {
					transaction
						.on('transactionHash', (hash) => {
							queueNotification(`Redeem submitted.`, 'info', hash);
							resolve();
						})
						.on('receipt', () => {
							queueNotification(`Successfully redeemed ${outToken.symbol}`, 'success');
							this.init();
						})
						.catch((error: any) => {
							this.init();
							setTxStatus('error');
							reject(error);
						});
				},
			);
		});
	}

	private async fetchIbbtApyFromTimestamp(timestamp: number): Promise<number | null> {
		const { provider } = this.store.wallet;
		const multiplier = 3153600000;
		const web3 = new Web3(provider);
		const ibBTC = new web3.eth.Contract(ibBTCConfig.abi as AbiItem[], this.ibBTC.address);
		const nowBlock = await web3.eth.getBlock('latest');
		const { number: currentBlock } = nowBlock;
		const currentPPS = await ibBTC.methods.pricePerShare().call();

		try {
			const [oldBlock, oldPPS] = await Promise.all([
				web3.eth.getBlock(currentBlock - timestamp),
				ibBTC.methods.pricePerShare().call({}, currentBlock - timestamp),
			]);

			const earnRatio = parseFloat(web3.utils.fromWei(currentPPS)) / parseFloat(web3.utils.fromWei(oldPPS)) - 1;
			return (earnRatio * multiplier) / (Number(nowBlock.timestamp) - Number(oldBlock.timestamp));
		} catch (error) {
			process.env.NODE_ENV !== 'production' &&
				console.error(`Error while getting ibBTC APY from block ${currentBlock - timestamp}: ${error}`);
			return null;
		}
	}
}

export default IbBTCStore;
