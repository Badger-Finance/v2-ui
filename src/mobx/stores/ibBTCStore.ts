import { RootStore } from 'mobx/RootStore';
import { extendObservable, action } from 'mobx';
import BigNumber from 'bignumber.js';
import { ContractSendMethod } from 'web3-eth-contract';
import { AbiItem } from 'web3-utils';
import Web3 from 'web3';
import { ZERO, MAX, ERC20_ABI } from 'config/constants';
import settConfig from 'config/system/abis/Sett.json';
import ibBTCConfig from 'config/system/abis/ibBTC.json';
import addresses from 'config/ibBTC/addresses.json';
import coreConfig from 'config/system/abis/BadgerBtcPeakCore.json';
import { getSendOptions } from 'mobx/utils/web3';
import { IbbtcVaultPeakFactory } from '../ibbtc-vault-peak-factory';
import { getNetworkFromProvider } from 'mobx/utils/helpers';
import { IbbtcOptionToken } from '../model/tokens/ibbtc-option-token';
import { ibBTCFees } from '../model/fees/ibBTCFees';
import { DEBUG, FLAGS } from 'config/environment';
import { ChainNetwork } from 'config/enums/chain-network.enum';

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
	private initialized = false;

	public tokens: Array<IbbtcOptionToken> = [];
	public ibBTC: IbbtcOptionToken;
	public apyUsingLastDay?: string | null;
	public apyUsingLastWeek?: string | null;
	public mintFeePercent?: BigNumber;
	public redeemFeePercent?: BigNumber;

	constructor(store: RootStore) {
		this.store = store;
		this.config = addresses.mainnet;
		const token_config = this.config.contracts.tokens;

		this.ibBTC = new IbbtcOptionToken(this.store, token_config['ibBTC']);

		this.tokens = FLAGS.IBBTC_OPTIONS_FLAG
			? [
					new IbbtcOptionToken(this.store, token_config['bcrvRenWSBTC']),
					new IbbtcOptionToken(this.store, token_config['bcrvRenWBTC']),
					new IbbtcOptionToken(this.store, token_config['btbtc/sbtcCrv']),
					new IbbtcOptionToken(this.store, token_config['byvWBTC']),
					new IbbtcOptionToken(this.store, token_config['renBTC']),
					new IbbtcOptionToken(this.store, token_config['WBTC']),
			  ]
			: [
					new IbbtcOptionToken(this.store, token_config['bcrvRenWSBTC']),
					new IbbtcOptionToken(this.store, token_config['bcrvRenWBTC']),
					new IbbtcOptionToken(this.store, token_config['btbtc/sbtcCrv']),
					new IbbtcOptionToken(this.store, token_config['byvWBTC']),
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
	}

	// just to have the same pattern as redeem options, currently all peaks can mint
	get mintOptions(): IbbtcOptionToken[] {
		return this.tokens;
	}

	// currently the zap contract does not support redeem
	get redeemOptions(): IbbtcOptionToken[] {
		return this.tokens.filter(({ symbol }) => !this.config.contracts.ZapPeak.supportedTokens.includes(symbol));
	}

	init(): void {
		const { connectedAddress } = this.store.wallet;
		// M50: by default the network ID is set to ethereum.  We should check the provider to ensure the
		// connected wallet is using ETH network, not the site.
		const network = getNetworkFromProvider(this.store.wallet.provider);
		if (this.initialized || network !== ChainNetwork.Ethereum) {
			return;
		}

		if (!connectedAddress) {
			this.resetBalances();
			return;
		}
		Promise.all([
			this.fetchTokensBalances(),
			this.fetchIbbtcApy(),
			this.fetchConversionRates(),
			this.fetchFees(),
		]).catch((err) => {
			if (DEBUG) {
				console.error(err);
			}
			return;
		});
		this.initialized = true;
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
		const dayOldBlock = 86400; // [Seconds in a day]
		const weekOldBlock = dayOldBlock * 7;
		const apyFromLastDay = await this.fetchIbbtApyFromTimestamp(dayOldBlock);
		const apyFromLastWeek = await this.fetchIbbtApyFromTimestamp(weekOldBlock);

		this.apyUsingLastDay = apyFromLastDay !== null ? `${apyFromLastDay}%` : null;
		this.apyUsingLastWeek = apyFromLastWeek !== null ? `${apyFromLastWeek}%` : null;
	});

	fetchBalance = action(
		async (token: IbbtcOptionToken): Promise<BigNumber> => {
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
		async (token: IbbtcOptionToken): Promise<void> => {
			try {
				const { bBTC, fee } = await this.calcMintAmount(token, token.scale('1'));
				token.mintRate = this.ibBTC.unscale(bBTC.plus(fee)).toFixed(6, BigNumber.ROUND_HALF_FLOOR);
			} catch (error) {
				token.mintRate = '0.000';
			}
		},
	);

	fetchRedeemRate = action(
		async (token: IbbtcOptionToken): Promise<void> => {
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

	isZapToken(token: IbbtcOptionToken): boolean {
		return this.config.contracts.ZapPeak.supportedTokens.includes(token.symbol);
	}

	isValidAmount(token: IbbtcOptionToken, amount: BigNumber, slippage?: BigNumber): boolean {
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

	async getRedeemConversionRate(token: IbbtcOptionToken): Promise<BigNumber> {
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

	async getAllowance(underlyingAsset: IbbtcOptionToken, spender: string): Promise<BigNumber> {
		const { provider, connectedAddress } = this.store.wallet;
		const web3 = new Web3(provider);
		const tokenContract = new web3.eth.Contract(settConfig.abi as AbiItem[], underlyingAsset.address);
		const allowance = await tokenContract.methods.allowance(connectedAddress, spender).call();
		return new BigNumber(allowance);
	}

	async increaseAllowance(
		underlyingAsset: IbbtcOptionToken,
		spender: string,
		amount: BigNumber | string = MAX,
	): Promise<void> {
		const { queueNotification, gasPrice } = this.store.uiState;
		const { connectedAddress } = this.store.wallet;
		const { gasPrices } = this.store.network;
		const method = this.getApprovalMethod(underlyingAsset, spender, amount);

		queueNotification(`Sign the transaction to allow Badger to spend your ${underlyingAsset.symbol}`, 'info');

		const price = gasPrices[gasPrice];
		const options = await getSendOptions(method, connectedAddress, price);
		await method
			.send(options)
			.on('transactionHash', (_hash: string) => {
				queueNotification(`Transaction submitted.`, 'info', _hash);
			})
			.on('receipt', () => {
				queueNotification(`${underlyingAsset.symbol} allowance increased.`, 'success');
			})
			.on('error', (error: Error) => {
				throw error;
			});
	}

	async mint(inToken: IbbtcOptionToken, amount: BigNumber, slippage: BigNumber): Promise<void> {
		const { queueNotification } = this.store.uiState;
		try {
			const peak = IbbtcVaultPeakFactory.createIbbtcVaultPeakForToken(this.store, inToken);
			const allowance = await this.getAllowance(inToken, peak.address);

			// make sure we have allowance
			if (amount.gt(allowance)) {
				await this.increaseAllowance(inToken, peak.address);
			}

			await this.mintBBTC(inToken, amount, slippage);
		} catch (error) {
			process.env.NODE_ENV !== 'production' && console.error(error);
			queueNotification(`There was an error minting ${this.ibBTC.symbol}. Please try again later.`, 'error');
		}
	}
	async redeem(outToken: IbbtcOptionToken, amount: BigNumber): Promise<void> {
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

	async calcMintAmount(inToken: IbbtcOptionToken, amount: BigNumber): Promise<MintAmountCalculation> {
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

	async calcRedeemAmount(outToken: IbbtcOptionToken, amount: BigNumber): Promise<RedeemAmountCalculation> {
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

	async mintBBTC(inToken: IbbtcOptionToken, amount: BigNumber, slippage: BigNumber): Promise<void> {
		const peak = IbbtcVaultPeakFactory.createIbbtcVaultPeakForToken(this.store, inToken);
		const method = await peak.getMintMethod(amount, slippage);
		await this.executeMethod(method, 'Mint submitted', `Successfully minted ${this.ibBTC.symbol}`);
	}

	async redeemBBTC(outToken: IbbtcOptionToken, amount: BigNumber): Promise<void> {
		const peak = IbbtcVaultPeakFactory.createIbbtcVaultPeakForToken(this.store, outToken);
		const method = peak.getRedeemMethod(amount);
		await this.executeMethod(method, 'Redeem submitted', `Successfully redeemed ${outToken.symbol}`);
	}

	private getApprovalMethod(token: IbbtcOptionToken, spender: string, amount: BigNumber | string = MAX) {
		const { provider } = this.store.wallet;
		const web3 = new Web3(provider);

		if (token.symbol === this.config.contracts.tokens.WBTC.symbol) {
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
	): Promise<void> {
		const { connectedAddress } = this.store.wallet;
		const { queueNotification, gasPrice } = this.store.uiState;
		const { gasPrices } = this.store.network;
		const price = gasPrices[gasPrice];
		const options = await getSendOptions(method, connectedAddress, price);
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
				throw error;
			});
	}

	private async fetchIbbtApyFromTimestamp(timestamp: number): Promise<string | null> {
		const { provider } = this.store.wallet;
		const { currentBlock } = this.store.network;
		if (!provider || !currentBlock) {
			return null;
		}
		const secondsPerYear = new BigNumber(31536000);
		const web3 = new Web3(provider);
		const ibBTC = new web3.eth.Contract(ibBTCConfig.abi as AbiItem[], this.ibBTC.address);
		const currentPPS = new BigNumber(await ibBTC.methods.pricePerShare().call());

		try {
			const targetBlock = currentBlock - Math.floor(timestamp / 15);
			const oldPPS = new BigNumber(await ibBTC.methods.pricePerShare().call({}, targetBlock));
			const ppsGrowth = currentPPS.minus(oldPPS).dividedBy(oldPPS);
			const growthPerSecond = ppsGrowth.multipliedBy(secondsPerYear.dividedBy(timestamp));
			return growthPerSecond.multipliedBy(1e2).toFixed(3);
		} catch (error) {
			process.env.NODE_ENV !== 'production' &&
				console.error(
					`Error while getting ibBTC APY from block ${currentBlock - Math.floor(timestamp / 15)}: ${error}`,
				);
			return null;
		}
	}
}

export default IbBTCStore;
