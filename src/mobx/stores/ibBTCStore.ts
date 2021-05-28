import { RootStore } from 'mobx/store';
import { extendObservable, action, observe } from 'mobx';
import BigNumber from 'bignumber.js';
import { ContractSendMethod } from 'web3-eth-contract';
import { AbiItem } from 'web3-utils';
import Web3 from 'web3';
import { ibBTCFees, TokenModel } from 'mobx/model';
import { ZERO, MAX, FLAGS, NETWORK_IDS } from 'config/constants';
import settConfig from 'config/system/abis/Sett.json';
import ibBTCConfig from 'config/system/abis/ibBTC.json';
import addresses from 'config/ibBTC/addresses.json';
import coreConfig from 'config/system/abis/BadgerBtcPeakCore.json';
import { getSendOptions } from 'mobx/utils/web3';
import { IbbtcVaultPeakFactory } from '../ibbtc-vault-peak-factory';

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
			new TokenModel(this.store, token_config['renBTC']),
			new TokenModel(this.store, token_config['WBTC']),
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

	// just to have the same pattern as redeem options, currently all peaks can mint
	get mintOptions(): TokenModel[] {
		return this.tokens;
	}

	// currently the zap contract does not support redeem
	get redeemOptions(): TokenModel[] {
		return this.tokens.filter(({ symbol }) => !this.config.contracts.ZapPeak.supportedTokens.includes(symbol));
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

			const fetchMintRates = this.mintOptions.map((token) => this.fetchMintRate(token));
			const fetchRedeemRates = this.redeemOptions.map((token) => this.fetchRedeemRate(token));
			await Promise.all([...fetchMintRates, ...fetchRedeemRates]);
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

	isZapToken(token: TokenModel): boolean {
		return this.config.contracts.ZapPeak.supportedTokens.includes(token.symbol);
	}

	isValidAmount(token: TokenModel, amount: BigNumber, slippage?: BigNumber): boolean {
		const { queueNotification } = this.store.uiState;

		if (!amount || amount.isNaN() || amount.lte(0)) {
			queueNotification('Please enter a valid amount', 'error');
			return false;
		}

		if (amount.gt(token.balance)) {
			queueNotification(`You have insufficient balance of ${token.symbol}`, 'error');
			return false;
		}

		if (this.isZapToken(token) && (slippage?.isNaN() || slippage?.lte(0))) {
			queueNotification('Please enter a valid slippage value', 'error');
			return false;
		}

		return true;
	}

	async getRedeemConversionRate(token: TokenModel): Promise<BigNumber> {
		const { provider } = this.store.wallet;
		if (!provider) return ZERO;

		const web3 = new Web3(provider);
		const ibBTC = new web3.eth.Contract(ibBTCConfig.abi as AbiItem[], this.ibBTC.address);
		const ibBTCPricePerShare = await ibBTC.methods.pricePerShare().call();

		return IbbtcVaultPeakFactory.createIbbtcVaultPeakForToken(this.store, token).bBTCToSett(
			new BigNumber(ibBTCPricePerShare),
		);
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

	async mint(inToken: TokenModel, amount: BigNumber, slippage?: BigNumber): Promise<void> {
		const { setTxStatus, queueNotification } = this.store.uiState;

		if (!this.isValidAmount(inToken, amount, slippage)) return;

		try {
			const peak = IbbtcVaultPeakFactory.createIbbtcVaultPeakForToken(this.store, inToken);
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
		if (!this.isValidAmount(this.ibBTC, amount)) return;

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
		const fallbackResponse = { bBTC: this.ibBTC.scale('0'), fee: this.ibBTC.scale('0') };

		try {
			const peak = IbbtcVaultPeakFactory.createIbbtcVaultPeakForToken(this.store, inToken);
			const method = peak.getCalcMintMethod(amount);
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
		const fallbackResponse = {
			fee: this.ibBTC.scale('0'),
			max: this.ibBTC.scale('0'),
			sett: this.ibBTC.scale('0'),
		};

		try {
			const peak = IbbtcVaultPeakFactory.createIbbtcVaultPeakForToken(this.store, outToken);
			const method = peak.getCalcRedeemMethod(amount);
			const { fee, max, sett } = await method.call();
			return { fee: new BigNumber(fee), max: new BigNumber(max), sett: new BigNumber(sett) };
		} catch (error) {
			process.env.NODE_ENV !== 'production' && console.error(error);
			queueNotification('There was an error calculating redeem amount. Please try again later', 'error');
			return fallbackResponse;
		}
	}

	async mintBBTC(inToken: TokenModel, amount: BigNumber): Promise<void> {
		const peak = IbbtcVaultPeakFactory.createIbbtcVaultPeakForToken(this.store, inToken);
		const method = await peak.getMintMethod(amount);
		await this.executeMethod(method, 'Mint submitted', `Successfully minted ${this.ibBTC.symbol}`);
	}

	async redeemBBTC(outToken: TokenModel, amount: BigNumber): Promise<void> {
		const peak = IbbtcVaultPeakFactory.createIbbtcVaultPeakForToken(this.store, outToken);
		const method = peak.getRedeemMethod(amount);
		await this.executeMethod(method, 'Redeem submitted', `Successfully redeemed ${outToken.symbol}`);
	}

	private async executeMethod(
		method: ContractSendMethod,
		infoMessage: string,
		successMessage: string,
	): Promise<void> {
		const { connectedAddress } = this.store.wallet;
		const { queueNotification } = this.store.uiState;
		const gasPrice = this.store.wallet.gasPrices[this.store.uiState.gasPrice];
		const options = await getSendOptions(method, connectedAddress, gasPrice);

		await method
			.send(options)
			.on('transactionHash', (_hash: string) => {
				queueNotification(infoMessage, 'info', _hash);
			})
			.on('receipt', () => {
				queueNotification(successMessage, 'success');
				this.init();
			})
			.on('error', (error: Error) => {
				this.init();
				queueNotification(error.message, 'error');
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
