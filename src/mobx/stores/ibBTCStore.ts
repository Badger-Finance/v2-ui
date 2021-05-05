import { RootStore } from 'mobx/store';
import { extendObservable, action, observe, decorate, observable } from 'mobx';

import BigNumber from 'bignumber.js';
import { PromiEvent } from 'web3-core';
import { Contract, ContractSendMethod } from 'web3-eth-contract';
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
	public apyUsingLastDay?: string;
	public apyUsingLastWeek?: string;

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
		});

		observe(this.store.wallet as any, 'connectedAddress', () => {
			this.init();
		});

		if (!!this.store.wallet.connectedAddress) this.init();
	}

	init = action((): void => {
		const { connectedAddress, network } = this.store.wallet;
		if (!FLAGS.IBBTC_FLAG || network.networkId !== NETWORK_IDS.ETH) return;

		if (!!connectedAddress) this.fetchTokensBalance().then();
		else this.resetBalances();
		this.fetchConversionRates().then();
		this.fetchIbbtcApy().then();
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

		this.apyUsingLastDay = apyFromLastDay === null ? 'N/A' : `${(apyFromLastDay * 365).toFixed(3)}%`;
		this.apyUsingLastWeek = apyFromLastWeek === null ? 'N/A' : `${(apyFromLastWeek * 52).toFixed(3)}%`;
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
			const tokenContract = new web3.eth.Contract(SETT.abi as AbiItem[], token.address);
			let balance = tokenContract.methods.balanceOf(connectedAddress);
			balance = await balance.call();

			return new BigNumber(balance);
		},
	);

	getAllowance = action(async (underlyingAsset: TokenModel, spender: string) => {
		const { provider, connectedAddress } = this.store.wallet;
		const web3 = new Web3(provider);
		const tokenContract = new web3.eth.Contract(SETT.abi as AbiItem[], underlyingAsset.address);
		const method = tokenContract.methods.allowance(connectedAddress, spender);
		return method.call();
	});

	increaseAllowance = action((underlyingAsset: TokenModel, spender: string, amount: BigNumber | string = MAX) => {
		const { queueNotification, setTxStatus } = this.store.uiState;
		const { provider, connectedAddress } = this.store.wallet;

		const web3 = new Web3(provider);
		const tokenContract = new web3.eth.Contract(SETT.abi as AbiItem[], underlyingAsset.address);
		const hexAmount = toHex(toBN(amount as any));
		const method = tokenContract.methods.increaseAllowance(spender, hexAmount);

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
	});

	mint = action(async (inToken: TokenModel, amount: BigNumber) => {
		const { setTxStatus, queueNotification } = this.store.uiState;

		if (!this.validate(amount, inToken)) return;

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
	});

	calcMintAmount = async (inToken: TokenModel, amount: BigNumber): Promise<MintAmountCalculation> => {
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
			const hexAmount = toHex(toBN(amount as any));
			if (peak.isYearnWBTCPeak) method = peakContract.methods.calcMint(hexAmount);
			else method = peakContract.methods.calcMint(inToken.poolId, hexAmount);
			const { bBTC, fee } = await method.call();
			return { bBTC: new BigNumber(bBTC), fee: new BigNumber(fee) };
		} catch (error) {
			process.env.NODE_ENV !== 'production' && console.error(error);
			queueNotification('There was an error calculating mint amount. Please try again later', 'error');
			return fallbackResponse;
		}
	};

	mintBBTC = action((inToken: TokenModel, amount: BigNumber) => {
		const { queueNotification, setTxStatus } = this.store.uiState;
		const { provider, connectedAddress } = this.store.wallet;

		let method: ContractSendMethod;
		const peak = this.getPeakForToken(inToken.symbol);
		const web3 = new Web3(provider);
		const peakContract = new web3.eth.Contract(peak.abi as AbiItem[], peak.address);
		const hexAmount = toHex(toBN(amount as any));
		const merkleProof = this.store.user.bouncerProof || [];
		if (peak.isYearnWBTCPeak) method = peakContract.methods.mint(hexAmount, merkleProof);
		else method = peakContract.methods.mint(inToken.poolId, hexAmount, merkleProof);

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
	});

	redeem = action((outToken: TokenModel, amount: BigNumber) => {
		if (!this.validate(amount, this.ibBTC)) return;
		return this.redeemBBTC(outToken, amount);
	});

	calcRedeemAmount = async (outToken: TokenModel, amount: BigNumber): Promise<RedeemAmountCalculation> => {
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
			const hexAmount = toHex(toBN(amount as any));
			if (peak.isYearnWBTCPeak) method = peakContract.methods.calcRedeem(hexAmount);
			else method = peakContract.methods.calcRedeem(outToken.poolId, hexAmount);
			const { fee, max, sett } = await method.call();

			return { fee: new BigNumber(fee), max: new BigNumber(max), sett: new BigNumber(sett) };
		} catch (error) {
			process.env.NODE_ENV !== 'production' && console.error(error);
			queueNotification('There was an error calculating redeem amount. Please try again later', 'error');
			return fallbackResponse;
		}
	};

	redeemBBTC = action((outToken: TokenModel, amount: BigNumber) => {
		const { queueNotification, setTxStatus } = this.store.uiState;
		const { provider, connectedAddress } = this.store.wallet;

		let method: ContractSendMethod;
		const peak = this.getPeakForToken(outToken.symbol);
		const web3 = new Web3(provider);
		const peakContract = new web3.eth.Contract(peak.abi as AbiItem[], peak.address);
		const hexAmount = toHex(toBN(amount as any));
		if (peak.isYearnWBTCPeak) method = peakContract.methods.redeem(hexAmount);
		else method = peakContract.methods.redeem(outToken.poolId, hexAmount);

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
	});

	private async fetchIbbtApyFromTimestamp(timestamp: number): Promise<number | null> {
		const { provider } = this.store.wallet;

		if (!provider) {
			process.env.NODE_ENV !== 'production' && console.log('No provider available');
			return null;
		}

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
