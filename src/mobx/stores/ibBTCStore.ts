import { RootStore } from 'mobx/store';
import { extendObservable, action, observe } from 'mobx';
import BigNumber from 'bignumber.js';
import { ContractSendMethod } from 'web3-eth-contract';
import { AbiItem } from 'web3-utils';
import Web3 from 'web3';
import { ibBTCFees, MintLimits, TokenModel } from 'mobx/model';
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
import { toHex } from '../utils/helpers';
import { getSendOptions } from 'mobx/utils/web3';

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

class IbBTCStore {
	private readonly store: RootStore;
	private config: typeof addresses.mainnet;

	public tokens: Array<TokenModel> = [];
	public ibBTC: TokenModel;
	public apyUsingLastDay?: string | null;
	public apyUsingLastWeek?: string | null;
	public mintFeePercent?: BigNumber;
	public redeemFeePercent?: BigNumber;

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
		this.mintFeePercent = new BigNumber(0);
		this.redeemFeePercent = new BigNumber(0);

		extendObservable(this, {
			tokens: this.tokens,
			ibBTC: this.ibBTC,
			apyUsingLastDay: this.apyUsingLastDay,
			apyUsingLastWeek: this.apyUsingLastWeek,
			mintFeePercent: this.mintFeePercent,
			redeemFeePercent: this.redeemFeePercent,
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
		this.fetchTokensBalances().then();
		this.fetchIbbtcApy().then();
		this.fetchConversionRates().then();
		this.fetchFees().then();
	}

	fetchFees = action(
		async (): Promise<void> => {
			const fees = await this.getFees();
			this.mintFeePercent = fees.mintFeePercent;
			this.redeemFeePercent = fees.redeemFeePercent;
		},
	);

	fetchTokensBalances = action(
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
		const dayOldBlock = 86400 / 15; // [Seconds in a day / EVM block time ratio]
		const weekOldBlock = dayOldBlock * 7;
		const apyFromLastDay = await this.fetchIbbtApyFromTimestamp(dayOldBlock);
		const apyFromLastWeek = await this.fetchIbbtApyFromTimestamp(weekOldBlock);

		this.apyUsingLastDay = apyFromLastDay !== null ? `${apyFromLastDay.toFixed(3)}%` : null;
		this.apyUsingLastWeek = apyFromLastWeek !== null ? `${apyFromLastWeek.toFixed(3)}%` : null;
	});

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

	fetchConversionRates = action(
		async (): Promise<void> => {
			const { provider } = this.store.wallet;
			if (!provider) return;

			// Fetch mintRate, redeemRate and set to respected token
			const tokensRateInformation = this.tokens.map((token) =>
				Promise.all([this.fetchMintRate(token), this.fetchRedeemRate(token)]),
			);

			await Promise.all(tokensRateInformation);
		},
	);

	fetchMintRate = action(
		async (token: TokenModel): Promise<void> => {
			try {
				const { bBTC, fee } = await this.calcMintAmount(token, token.scale('1'));
				token.mintRate = this.ibBTC.unscale(bBTC.plus(fee)).toFixed(6, BigNumber.ROUND_HALF_FLOOR);
			} catch (error) {
				token.mintRate = '0.000';
			}
		},
	);

	fetchRedeemRate = action(
		async (token: TokenModel): Promise<void> => {
			try {
				const redeemRate = await this.getRedeemConversionRate(token);
				token.redeemRate = token.unscale(redeemRate).toFixed(6, BigNumber.ROUND_HALF_FLOOR);
			} catch (error) {
				token.redeemRate = '0.000';
			}
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

	isValidMint(amount: BigNumber, limits: MintLimits): boolean {
		return amount.lte(limits.userLimit) && amount.lte(limits.allUsersLimit);
	}

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

	async getMintLimit(token: TokenModel): Promise<MintLimits> {
		const { connectedAddress, provider } = this.store.wallet;
		const { abi: peakAbi, address: peakAddress } = this.getPeakForToken(token.symbol);

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

		const [userLimit, allUsersLimit, individualLimit, globalLimit] = await Promise.all([
			this.bBTCToSett(new BigNumber(userRemaining), token),
			this.bBTCToSett(new BigNumber(totalRemaining), token),
			this.bBTCToSett(new BigNumber(userDepositCap), token),
			this.bBTCToSett(new BigNumber(totalDepositCap), token),
		]);

		return {
			userLimit,
			allUsersLimit,
			individualLimit,
			globalLimit,
		};
	}

	async getRedeemConversionRate(token: TokenModel): Promise<BigNumber> {
		const { provider } = this.store.wallet;
		if (!provider) return ZERO;

		const web3 = new Web3(provider);
		const ibBTC = new web3.eth.Contract(ibBTCConfig.abi as AbiItem[], this.ibBTC.address);
		const ibBTCPricePerShare = await ibBTC.methods.pricePerShare().call();

		return this.bBTCToSett(new BigNumber(ibBTCPricePerShare), token);
	}

	/**
	 * Calculates the settToken amount equivalent  of an ibBTC amount using the following criteria
	 * for byvWBTCPeak => [amount/ 100] / byvWBTC.pricePerShare
	 * for BadgerPeak => [amount* 1e36] / [sett.getPricePerFullShare] / swap.get_virtual_price]
	 * @param amount amount that will be converted
	 * @param token token to be used in calculation
	 */
	async bBTCToSett(amount: BigNumber, token: TokenModel): Promise<BigNumber> {
		const { provider } = this.store.wallet;
		if (!provider) return ZERO;

		const { isYearnWBTCPeak, address, abi } = this.getPeakForToken(token.symbol);
		const web3 = new Web3(provider);

		if (isYearnWBTCPeak) {
			const yearnToken = new web3.eth.Contract(yearnConfig.abi as AbiItem[], token.address);
			const yearnTokenPricePerShare = await yearnToken.methods.pricePerShare().call();
			return amount.dividedToIntegerBy(100).dividedToIntegerBy(yearnTokenPricePerShare);
		}

		const badgerBtcPeak = new web3.eth.Contract(abi, address);
		const settToken = new web3.eth.Contract(settConfig.abi as AbiItem[], token.address);
		const { swap: swapAddress } = await badgerBtcPeak.methods.pools(token.poolId).call();
		const swapContract = new web3.eth.Contract(badgerPeakSwap.abi as AbiItem[], swapAddress);

		const [settTokenPricePerFullShare, swapVirtualPrice] = await Promise.all([
			settToken.methods.getPricePerFullShare().call(),
			swapContract.methods.get_virtual_price().call(),
		]);

		return amount
			.multipliedBy(1e36)
			.dividedToIntegerBy(settTokenPricePerFullShare)
			.dividedToIntegerBy(swapVirtualPrice);
	}

	async getFees(): Promise<ibBTCFees> {
		const { provider } = this.store.wallet;
		if (!provider) {
			return {
				mintFeePercent: new BigNumber(0),
				redeemFeePercent: new BigNumber(0),
			};
		}

		const web3 = new Web3(provider);
		const ibBTC = new web3.eth.Contract(ibBTCConfig.abi as AbiItem[], this.ibBTC.address);
		const coreAddress = await ibBTC.methods.core().call();
		const core = new web3.eth.Contract(coreConfig.abi as AbiItem[], coreAddress);
		const mintFeePercent = await core.methods.mintFee().call();
		const redeemFeePercent = await core.methods.redeemFee().call();

		if (mintFeePercent && redeemFeePercent) {
			return {
				mintFeePercent: new BigNumber(mintFeePercent).dividedBy(100),
				redeemFeePercent: new BigNumber(redeemFeePercent).dividedBy(100),
			};
		} else {
			return {
				mintFeePercent: new BigNumber(0),
				redeemFeePercent: new BigNumber(0),
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

		const gasPrice = this.store.wallet.gasPrices[this.store.uiState.gasPrice];
		const options = await getSendOptions(method, connectedAddress, gasPrice);
		await method
			.send(options)
			.on('transactionHash', (_hash: string) => {
				queueNotification(`Transaction submitted.`, 'info', _hash);
			})
			.on('receipt', () => {
				queueNotification(`${underlyingAsset.symbol} allowance increased.`, 'success');
			})
			.on('error', (error: Error) => {
				queueNotification(error.message, 'error');
				setTxStatus('error');
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

		try {
			await this.redeemBBTC(outToken, amount);
		} catch (error) {
			process.env.NODE_ENV !== 'production' && console.error(error);
			this.store.uiState.queueNotification(
				`There was an error redeeming ${outToken.symbol}. Please try again later.`,
				'error',
			);
		}
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
			if (peak.isYearnWBTCPeak) method = peakContract.methods.calcMint(toHex(amount));
			else method = peakContract.methods.calcMint(inToken.poolId, toHex(amount));
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
			if (peak.isYearnWBTCPeak) method = peakContract.methods.calcRedeem(toHex(amount));
			else method = peakContract.methods.calcRedeem(outToken.poolId, toHex(amount));
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

		let method: ContractSendMethod;
		const peak = this.getPeakForToken(inToken.symbol);
		const web3 = new Web3(provider);
		const peakContract = new web3.eth.Contract(peak.abi as AbiItem[], peak.address);
		const merkleProof = this.store.user.bouncerProof || [];
		if (peak.isYearnWBTCPeak) method = peakContract.methods.mint(toHex(amount), merkleProof);
		else method = peakContract.methods.mint(inToken.poolId, toHex(amount), merkleProof);

		const gasPrice = this.store.wallet.gasPrices[this.store.uiState.gasPrice];
		const options = await getSendOptions(method, connectedAddress, gasPrice);
		await method
			.send(options)
			.on('transactionHash', (_hash: string) => {
				queueNotification(`Mint submitted.`, 'info', _hash);
			})
			.on('receipt', () => {
				queueNotification(`Successfully minted ${this.ibBTC.symbol}`, 'success');
				this.init();
			})
			.on('error', (error: Error) => {
				queueNotification(error.message, 'error');
				setTxStatus('error');
			});
	}

	async redeemBBTC(outToken: TokenModel, amount: BigNumber): Promise<void> {
		const { queueNotification, setTxStatus } = this.store.uiState;
		const { provider, connectedAddress } = this.store.wallet;

		let method: ContractSendMethod;
		const peak = this.getPeakForToken(outToken.symbol);
		const web3 = new Web3(provider);
		const peakContract = new web3.eth.Contract(peak.abi as AbiItem[], peak.address);
		if (peak.isYearnWBTCPeak) method = peakContract.methods.redeem(toHex(amount));
		else method = peakContract.methods.redeem(outToken.poolId, toHex(amount));

		const gasPrice = this.store.wallet.gasPrices[this.store.uiState.gasPrice];
		const options = await getSendOptions(method, connectedAddress, gasPrice);
		await method
			.send(options)
			.on('transactionHash', (_hash: string) => {
				queueNotification(`Redeem submitted.`, 'info', _hash);
			})
			.on('receipt', () => {
				queueNotification(`Successfully redeemed ${outToken.symbol}`, 'success');
				this.init();
			})
			.on('error', (error: Error) => {
				this.init();
				queueNotification(error.message, 'error');
				setTxStatus('error');
			});
	}

	private async fetchIbbtApyFromTimestamp(timestamp: number): Promise<number | null> {
		const { provider } = this.store.wallet;
		const multiplier = 3153600000; // seconds in a year * 100%
		const web3 = new Web3(provider);
		const ibBTC = new web3.eth.Contract(ibBTCConfig.abi as AbiItem[], this.ibBTC.address);
		const nowBlock = await web3.eth.getBlock('latest');
		const { number: currentBlock } = nowBlock;
		const currentPPS = await ibBTC.methods.pricePerShare().call();

		if (!provider) {
			return null;
		}

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
