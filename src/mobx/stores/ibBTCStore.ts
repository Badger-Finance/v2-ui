import { RootStore } from 'mobx/RootStore';
import { extendObservable, action } from 'mobx';
import { ZERO, MAX } from 'config/constants';
import addresses from 'config/ibBTC/addresses.json';
import { getSendOptions } from 'mobx/utils/web3';
import { IbbtcVaultPeakFactory } from '../ibbtc-vault-peak-factory';
import { getNetworkFromProvider } from 'mobx/utils/helpers';
import { IbbtcOptionToken } from '../model/tokens/ibbtc-option-token';
import { ibBTCFees } from '../model/fees/ibBTCFees';
import { DEBUG, FLAGS } from 'config/environment';
import { Network } from '@badger-dao/sdk';
import { Ibbtc__factory, VaultV1__factory } from 'contracts';
import { PeakCore__factory } from 'contracts/factories/PeakCore__factory';
import { BigNumber, ethers } from 'ethers';
import { Erc20__factory } from 'contracts/factories/Erc20__factory';

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
		this.mintFeePercent = ZERO;
		this.redeemFeePercent = ZERO;

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
		if (this.initialized || network !== Network.Ethereum) {
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
			const { user, wallet } = this.store;
			if (!wallet.connectedAddress) {
				return ZERO;
			}
			return user.getTokenBalance(token.address).tokenBalance;
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
				token.mintRate = ethers.utils.formatUnits(bBTC.add(fee), 6);
			} catch (error) {
				token.mintRate = '0.000';
			}
		},
	);

	fetchRedeemRate = action(
		async (token: IbbtcOptionToken): Promise<void> => {
			try {
				const redeemRate = await this.getRedeemConversionRate(token);
				token.redeemRate = ethers.utils.formatUnits(redeemRate, 6);
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

		if (!amount || amount.lte(0)) {
			queueNotification('Please enter a valid amount', 'error');
			return false;
		}

		if (amount.gt(token.balance)) {
			queueNotification(`You have insufficient balance of ${token.symbol}`, 'error');
			return false;
		}

		if (this.isZapToken(token) && slippage?.lte(0)) {
			queueNotification('Please enter a valid slippage value', 'error');
			return false;
		}

		return true;
	}

	async getRedeemConversionRate(token: IbbtcOptionToken): Promise<BigNumber> {
		const { provider } = this.store.wallet;
		if (!provider) return ZERO;

		const ibbtc = Ibbtc__factory.connect(this.ibBTC.address, provider);
		const pricePerFullShare = await ibbtc.pricePerShare();

		return IbbtcVaultPeakFactory.createIbbtcVaultPeakForToken(this.store, token).bBTCToSett(pricePerFullShare);
	}

	async getFees(): Promise<ibBTCFees> {
		const { provider } = this.store.wallet;
		if (!provider) {
			return {
				mintFeePercent: ZERO,
				redeemFeePercent: ZERO,
			};
		}

		const ibbtc = Ibbtc__factory.connect(this.ibBTC.address, provider);
		const coreAddress = await ibbtc.core();
		const core = PeakCore__factory.connect(coreAddress, provider);
		const [mintFeePercent, redeemFeePercent] = await Promise.all([core.mintFee(), core.redeemFee()]);

		if (mintFeePercent && redeemFeePercent) {
			return {
				mintFeePercent: mintFeePercent.div(100),
				redeemFeePercent: redeemFeePercent.div(100),
			};
		} else {
			return {
				mintFeePercent: ZERO,
				redeemFeePercent: ZERO,
			};
		}
	}

	async getAllowance(underlyingAsset: IbbtcOptionToken, spender: string): Promise<BigNumber> {
		const { provider, connectedAddress } = this.store.wallet;
		const token = Erc20__factory.connect(underlyingAsset.address, provider);
		const method = token.functions.transfer;
		return token.allowance(connectedAddress, spender);
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

		const price = gasPrices ? gasPrices[gasPrice] : 0;
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
			const { bBTC, fee } = await peak.calculateMint(amount);
			return { bBTC: BigNumber.from(bBTC), fee: BigNumber.from(fee) };
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
			return { fee: BigNumber.from(fee), max: BigNumber.from(max), sett: BigNumber.from(sett) };
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

	private async approve(token: IbbtcOptionToken, spender: string, amount: BigNumber | string = MAX) {
		const { provider } = this.store.wallet;

		if (token.symbol === this.config.contracts.tokens.WBTC.symbol) {
			const tokenContract = Erc20__factory.connect(token.address, provider);
			await tokenContract.approve(spender, amount);
			return;
		}

		const vault = VaultV1__factory.connect(token.address, provider);
		await vault.increaseAllowance(spender, amount);
		return;
	}

	private async fetchIbbtApyFromTimestamp(timestamp: number): Promise<string | null> {
		const { provider } = this.store.wallet;
		const { currentBlock } = this.store.network;
		if (!provider || !currentBlock) {
			return null;
		}
		const secondsPerYear = 31536000;
		const ibbtc = Ibbtc__factory.connect(this.ibBTC.address, provider);
		const currentPricePerFullShare = await ibbtc.pricePerShare();

		try {
			const targetBlock = currentBlock - Math.floor(timestamp / 15);
			const oldPricePerFullShare = await ibbtc.pricePerShare({ blockTag: targetBlock });
			const ppsGrowth = currentPricePerFullShare.sub(oldPricePerFullShare).div(oldPricePerFullShare);
			const growthPerSecond = ppsGrowth.mul((secondsPerYear / timestamp).toFixed());
			return ethers.utils.formatUnits(growthPerSecond.mul(1e5), 3);
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
