import { RootStore } from 'mobx/RootStore';
import { action, computed, extendObservable } from 'mobx';
import BigNumber from 'bignumber.js';
import { ContractSendMethod } from 'web3-eth-contract';
import { AbiItem } from 'web3-utils';
import Web3 from 'web3';
import { ERC20_ABI, MAX, ZERO } from 'config/constants';
import settConfig from 'config/system/abis/Vault.json';
import ibBTCConfig from 'config/system/abis/ibBTC.json';
import addresses from 'config/ibBTC/addresses.json';
import coreConfig from 'config/system/abis/BadgerBtcPeakCore.json';
import { getSendOptions, sendContractMethod, TransactionRequestResult } from 'mobx/utils/web3';
import { getNetworkFromProvider } from 'mobx/utils/helpers';
import { ibBTCFees } from '../model/fees/ibBTCFees';
import { DEBUG } from 'config/environment';
import { Network, Token } from '@badger-dao/sdk';
import { IbBTCMintZapFactory } from 'mobx/ibbtc-mint-zap-factory';
import { TokenBalance } from '../model/tokens/token-balance';
import mainnetDeploy from '../../config/deployments/mainnet.json';

interface MintAmountCalculation {
	bBTC: BigNumber;
	fee: BigNumber;
}

interface RedeemAmountCalculation {
	fee: BigNumber;
	max: BigNumber;
	sett: BigNumber;
}

class IbBTCStore {
	private readonly store: RootStore;

	public mintRates: Record<string, string> = {};
	public redeemRates: Record<string, string> = {};
	public apyUsingLastDay?: string | null;
	public apyUsingLastWeek?: string | null;
	public mintFeePercent?: BigNumber;
	public redeemFeePercent?: BigNumber;

	constructor(store: RootStore) {
		this.store = store;

		extendObservable(this, {
			apyUsingLastDay: this.apyUsingLastDay,
			apyUsingLastWeek: this.apyUsingLastWeek,
			mintFeePercent: this.mintFeePercent,
			redeemFeePercent: this.redeemFeePercent,
			mintRates: this.mintRates,
			redeemRates: this.redeemRates,
		});
	}

	@computed
	get ibBTC(): TokenBalance {
		return this.store.user.getTokenBalance(mainnetDeploy.tokens['ibBTC']);
	}

	@computed
	get tokenBalances(): TokenBalance[] {
		return [
			this.store.user.getTokenBalance(mainnetDeploy.sett_system.vaults['native.renCrv']),
			this.store.user.getTokenBalance(mainnetDeploy.tokens['renBTC']),
			this.store.user.getTokenBalance(mainnetDeploy.tokens['wBTC']),
			this.store.user.getTokenBalance(mainnetDeploy.sett_system.vaults['native.sbtcCrv']),
			this.store.user.getTokenBalance(mainnetDeploy.sett_system.vaults['native.tbtcCrv']),
			this.store.user.getTokenBalance(mainnetDeploy.tokens['bWBTC']),
			this.store.user.getTokenBalance(mainnetDeploy.sett_system.vaults['native.hbtcCrv']),
			this.store.user.getTokenBalance(mainnetDeploy.sett_system.vaults['native.bbtcCrv']),
			this.store.user.getTokenBalance(mainnetDeploy.sett_system.vaults['native.obtcCrv']),
			this.store.user.getTokenBalance(mainnetDeploy.sett_system.vaults['native.pbtcCrv']),
		];
	}

	@computed
	get initialized(): boolean {
		const mintRatesAvailable = Object.keys(this.mintRates).length > 0;
		const redeemRatesAvailable = Object.keys(this.redeemRates).length > 0;
		const feesAreLoaded = !!this.mintFeePercent && !!this.redeemFeePercent;
		const tokensInformationIsLoaded = this.tokenBalances.every(
			(option) => !!option.token.name && !!option.token.symbol,
		);

		return mintRatesAvailable && redeemRatesAvailable && feesAreLoaded && tokensInformationIsLoaded;
	}

	get mintOptions(): TokenBalance[] {
		return this.tokenBalances;
	}

	// currently, the zap contract does not support redeem
	get redeemOptions(): TokenBalance[] {
		return this.tokenBalances.filter(({ token }) =>
			addresses.mainnet.contracts.RenVaultZap.supportedTokens.includes(token.address),
		);
	}

	async init(): Promise<void> {
		const { address, wallet } = this.store.onboard;
		// M50: by default the network ID is set to ethereum.  We should check the provider to ensure the
		// connected wallet is using ETH network, not the site.
		const network = getNetworkFromProvider(wallet?.provider);

		if (this.initialized || network !== Network.Ethereum || !address) {
			return;
		}

		await Promise.all([this.fetchConversionRates(), this.fetchFees()]).catch((err) => {
			if (DEBUG) {
				console.error(err);
			}
			return;
		});
	}

	fetchFees = action(async (): Promise<void> => {
		const fees = await this.getFees();
		this.mintFeePercent = fees.mintFeePercent;
		this.redeemFeePercent = fees.redeemFeePercent;
	});

	fetchIbbtcApy = action(async () => {
		const dayOldBlock = 86400; // [Seconds in a day]
		const weekOldBlock = dayOldBlock * 7;
		const apyFromLastDay = await this.fetchIbbtApyFromTimestamp(dayOldBlock);
		const apyFromLastWeek = await this.fetchIbbtApyFromTimestamp(weekOldBlock);

		this.apyUsingLastDay = apyFromLastDay !== null ? `${apyFromLastDay}%` : null;
		this.apyUsingLastWeek = apyFromLastWeek !== null ? `${apyFromLastWeek}%` : null;
	});

	fetchConversionRates = action(async (): Promise<void> => {
		const { wallet } = this.store.onboard;
		if (!wallet?.provider) return;

		const [fetchMintRates, fetchRedeemRates] = await Promise.all([
			Promise.all(this.mintOptions.map(({ token }) => this.fetchMintRate(token))),
			Promise.all(this.redeemOptions.map(({ token }) => this.fetchRedeemRate(token))),
		]);

		for (let i = 0; i < fetchMintRates.length; i++) {
			this.mintRates[this.mintOptions[i].token.address] = fetchMintRates[i];
		}

		for (let i = 0; i < fetchRedeemRates.length; i++) {
			this.redeemRates[this.mintOptions[i].token.address] = fetchRedeemRates[i];
		}
	});

	fetchMintRate = action(async (token: Token): Promise<string> => {
		try {
			const { bBTC, fee } = await this.calcMintAmount(
				TokenBalance.fromBalance(this.store.user.getTokenBalance(token.address), '1'),
			);
			return TokenBalance.fromBigNumber(this.ibBTC, bBTC.plus(fee)).balanceDisplay(6);
		} catch (error) {
			return '0.000';
		}
	});

	fetchRedeemRate = action(async (token: Token): Promise<string> => {
		try {
			const redeemRate = await this.getRedeemConversionRate(token);
			return TokenBalance.fromBigNumber(this.ibBTC, redeemRate).balanceDisplay(6);
		} catch (error) {
			return '0.000';
		}
	});

	isZapToken(token: Token): boolean {
		return !addresses.mainnet.contracts.RenVaultZap.supportedTokens.includes(token.address);
	}

	isValidAmount(amount: TokenBalance, tokenBalance: TokenBalance, slippage?: BigNumber): boolean {
		const { queueNotification } = this.store.uiState;

		if (amount.tokenBalance.isNaN() || amount.tokenBalance.lte(0)) {
			queueNotification('Please enter a valid amount', 'error');
			return false;
		}

		if (amount.tokenBalance.gt(tokenBalance.tokenBalance)) {
			queueNotification(`You have insufficient balance of ${amount.token.symbol}`, 'error');
			return false;
		}

		if (this.isZapToken(amount.token) && (slippage?.isNaN() || slippage?.lte(0))) {
			queueNotification('Please enter a valid slippage value', 'error');
			return false;
		}

		return true;
	}

	async getRedeemConversionRate(token: Token): Promise<BigNumber> {
		const { wallet } = this.store.onboard;
		if (!wallet?.provider) return ZERO;

		const web3 = new Web3(wallet.provider);
		const ibBTC = new web3.eth.Contract(ibBTCConfig.abi as AbiItem[], this.ibBTC.token.address);
		const ibBTCPricePerShare = await ibBTC.methods.pricePerShare().call();

		return IbBTCMintZapFactory.getIbBTCZap(this.store, token).bBTCToSett(new BigNumber(ibBTCPricePerShare));
	}

	async getFees(): Promise<ibBTCFees> {
		const { wallet } = this.store.onboard;

		if (!wallet?.provider) {
			return {
				mintFeePercent: new BigNumber(0),
				redeemFeePercent: new BigNumber(0),
			};
		}

		const web3 = new Web3(wallet.provider);
		const ibBTC = new web3.eth.Contract(ibBTCConfig.abi as AbiItem[], this.ibBTC.token.address);
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

	async getAllowance(underlyingAsset: Token, spender: string): Promise<BigNumber> {
		const { address, wallet } = this.store.onboard;
		const web3 = new Web3(wallet?.provider);
		const tokenContract = new web3.eth.Contract(settConfig.abi as AbiItem[], underlyingAsset.address);
		const allowance = await tokenContract.methods.allowance(address, spender).call();
		return new BigNumber(allowance);
	}

	async increaseAllowance(underlyingAsset: Token, spender: string, amount: BigNumber | string = MAX): Promise<void> {
		const { queueNotification } = this.store.uiState;
		const { address } = this.store.onboard;
		if (!address) {
			return;
		}
		const method = this.getApprovalMethod(underlyingAsset, spender, amount);
		queueNotification(`Sign the transaction to allow Badger to spend your ${underlyingAsset.symbol}`, 'info');
		await this.executeMethod(
			method,
			`Increase ${underlyingAsset.symbol} allowance submitted.`,
			`${underlyingAsset.symbol} allowance increased.`,
		);
	}

	async mint(mintBalance: TokenBalance, slippage: BigNumber): Promise<TransactionRequestResult> {
		const { queueNotification } = this.store.uiState;
		try {
			const zap = IbBTCMintZapFactory.getIbBTCZap(this.store, mintBalance.token);
			const allowance = await this.getAllowance(mintBalance.token, zap.address);

			// make sure we have allowance
			if (mintBalance.tokenBalance.gt(allowance)) {
				await this.increaseAllowance(mintBalance.token, zap.address);
			}

			const result = await this.mintBBTC(mintBalance, slippage);

			if (result === TransactionRequestResult.Success) {
				this.store.uiState.queueNotification(
					'Wrap your minted tokens to deposit into the ibBTC vault!',
					'info',
				);
				await this.store.user.reloadBalances();
				return result;
			}
			return TransactionRequestResult.Rejected;
		} catch (error) {
			console.error(error);
			queueNotification(
				`There was an error minting ${this.ibBTC.token.symbol}. Please try again later.`,
				'error',
			);
			return TransactionRequestResult.Failure;
		}
	}

	async redeem(redeemBalance: TokenBalance, outToken: Token): Promise<TransactionRequestResult> {
		try {
			return this.redeemBBTC(redeemBalance, outToken);
		} catch (error) {
			process.env.NODE_ENV !== 'production' && console.error(error);
			this.store.uiState.queueNotification(
				`There was an error redeeming ${redeemBalance.token.symbol}. Please try again later.`,
				'error',
			);
			return TransactionRequestResult.Failure;
		}
	}

	async calcMintAmount(mintBalance: TokenBalance): Promise<MintAmountCalculation> {
		const { queueNotification } = this.store.uiState;

		const fallbackResponse = {
			bBTC: TokenBalance.fromBalance(this.ibBTC, '0').tokenBalance,
			fee: TokenBalance.fromBalance(this.ibBTC, '0').tokenBalance,
		};

		try {
			const zap = IbBTCMintZapFactory.getIbBTCZap(this.store, mintBalance.token);
			const method = zap.getCalcMintMethod(mintBalance.tokenBalance);
			const result = await method.call();
			// zaps return different outputs - this is a hacky massage around the inconsistent interface
			if (result.bBTC && result.fee) {
				return { bBTC: new BigNumber(result.bBTC), fee: new BigNumber(result.fee) };
			}
			return { bBTC: new BigNumber(result), fee: new BigNumber(0) };
		} catch (error) {
			process.env.NODE_ENV !== 'production' && console.error(error);
			queueNotification('There was an error calculating mint amount. Please try again later', 'error');
			return fallbackResponse;
		}
	}

	async calcRedeemAmount(redeemBalance: TokenBalance, outToken: Token): Promise<RedeemAmountCalculation> {
		const { queueNotification } = this.store.uiState;

		const fallbackResponse = {
			fee: TokenBalance.fromBalance(this.ibBTC, '0').tokenBalance,
			max: TokenBalance.fromBalance(this.ibBTC, '0').tokenBalance,
			sett: TokenBalance.fromBalance(this.ibBTC, '0').tokenBalance,
		};

		try {
			const zap = IbBTCMintZapFactory.getIbBTCZap(this.store, outToken);
			const method = zap.getCalcRedeemMethod(redeemBalance.tokenBalance);
			const { fee, max, sett } = await method.call();
			return { fee: new BigNumber(fee), max: new BigNumber(max), sett: new BigNumber(sett) };
		} catch (error) {
			process.env.NODE_ENV !== 'production' && console.error(error);
			queueNotification('There was an error calculating redeem amount. Please try again later', 'error');
			return fallbackResponse;
		}
	}

	async mintBBTC(mintBalance: TokenBalance, slippage: BigNumber): Promise<TransactionRequestResult> {
		try {
			const zap = IbBTCMintZapFactory.getIbBTCZap(this.store, mintBalance.token);
			const method = await zap.getMintMethod(mintBalance.tokenBalance, slippage);
			return this.executeMethod(method, 'Mint submitted', `Successfully minted ${this.ibBTC.token.symbol}`);
		} catch (err) {
			// handle rejected request
			if (err.code === 4001) {
				return TransactionRequestResult.Rejected;
			}
			console.log(err);
			return TransactionRequestResult.Failure;
		}
	}

	async redeemBBTC(redeemBalance: TokenBalance, outToken: Token): Promise<TransactionRequestResult> {
		const zap = IbBTCMintZapFactory.getIbBTCZap(this.store, outToken);
		const method = zap.getRedeemMethod(redeemBalance.tokenBalance);
		return this.executeMethod(method, 'Redeem submitted', `Successfully redeemed ${redeemBalance.token.symbol}`);
	}

	private getApprovalMethod(token: Token, spender: string, amount: BigNumber | string = MAX) {
		const { wallet } = this.store.onboard;
		const web3 = new Web3(wallet?.provider);

		if (token.address === mainnetDeploy.tokens['wBTC']) {
			return new web3.eth.Contract(ERC20_ABI as AbiItem[], token.address).methods.approve(spender, amount);
		}

		return new web3.eth.Contract(settConfig.abi as AbiItem[], token.address).methods.increaseAllowance(
			spender,
			amount,
		);
	}

	private async executeMethod(
		method: ContractSendMethod,
		infoMessage: string,
		successMessage: string,
	): Promise<TransactionRequestResult> {
		const { address } = this.store.onboard;
		if (!address) {
			return TransactionRequestResult.Rejected;
		}
		const { gasPrice } = this.store.uiState;
		const { gasPrices } = this.store.network;
		const price = gasPrices ? gasPrices[gasPrice] : 0;
		const options = await getSendOptions(method, address, price);
		return sendContractMethod(this.store, method, options, infoMessage, successMessage);
	}

	private async fetchIbbtApyFromTimestamp(timestamp: number): Promise<string | null> {
		const { wallet } = this.store.onboard;
		if (!wallet?.provider) {
			return null;
		}
		const secondsPerYear = new BigNumber(31536000);
		const web3 = new Web3(wallet.provider);
		const ibBTC = new web3.eth.Contract(ibBTCConfig.abi as AbiItem[], this.ibBTC.token.address);
		const currentPPS = new BigNumber(await ibBTC.methods.pricePerShare().call());
		const currentBlock = await web3.eth.getBlockNumber();

		try {
			const targetBlock = currentBlock - Math.floor(timestamp / 15);
			const oldPPS = new BigNumber(await ibBTC.methods.pricePerShare().call({}, targetBlock));
			const ppsGrowth = currentPPS.minus(oldPPS).dividedBy(oldPPS);
			const growthPerSecond = ppsGrowth.multipliedBy(secondsPerYear.dividedBy(timestamp));
			return growthPerSecond.multipliedBy(1e2).toFixed(3);
		} catch (error) {
			if (DEBUG) {
				console.error(error);
			}
			return null;
		}
	}
}

export default IbBTCStore;
