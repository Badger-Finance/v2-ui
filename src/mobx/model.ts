import firebase from 'firebase';
import BigNumber from 'bignumber.js';
import _ from 'lodash';
import { AbiItem } from 'web3-utils';
import Web3 from 'web3';
import { LockAndMintParamsSimple, BurnAndReleaseParamsSimple } from '@renproject/interfaces';

import { reduceGeyserSchedule } from './reducers/contractReducers';
import { RootStore } from './store';
import { getNetworkDeploy } from '../mobx/utils/web3';
import { getTokens } from '../config/system/tokens';
import { getVaults } from '../config/system/vaults';
import { getGeysers } from '../config/system/geysers';
import { getRebase } from '../config/system/rebase';
import { getAirdrops } from 'config/system/airdrops';
import { NETWORK_IDS, NETWORK_LIST } from 'config/constants';
import { getRewards } from 'config/system/rewards';
import { ZERO, TEN } from 'config/constants';
import { CustomNotificationObject, EmitterListener, TransactionData } from 'bnc-notify';

export class Contract {
	store!: RootStore;
	public address!: string;

	constructor(store: RootStore, address: string) {
		this.store = store;
		this.address = address;
	}
}
export class Token extends Contract {
	public balance!: BigNumber;
	public decimals!: number;
	public totalSupply!: BigNumber;
	public symbol!: string;
	public name!: string;
	public ethValue!: BigNumber;
	public vaults!: Vault[];

	constructor(store: RootStore, address: string, decimals: number) {
		super(store, address);
		this.balance = new BigNumber(0);
		this.ethValue = new BigNumber(0);
		this.decimals = decimals;
		this.vaults = [];
	}

	balanceValue(): BigNumber {
		return this.balance.dividedBy(10 ** this.decimals).multipliedBy(this.ethValue);
	}

	update(payload: TokenPayload): void {
		if (!!payload.balanceOf) this.balance = payload.balanceOf;
		if (!!payload.decimals) this.decimals = payload.decimals;
		if (!!payload.symbol) this.symbol = payload.symbol;
		if (!!payload.ethValue) this.ethValue = payload.ethValue;
		if (!!payload.totalSupply) this.totalSupply = payload.totalSupply;
		if (!!payload.name) this.name = payload.name;
	}
}

export class Vault extends Token {
	public position!: number;
	public holdings!: BigNumber;
	public underlyingToken!: Token;
	public growth!: Growth[];
	public geyser!: Geyser;
	public pricePerShare!: BigNumber;
	public abi!: AbiItem;
	public super!: boolean;
	public vaultBalance!: BigNumber;

	constructor(store: RootStore, address: string, decimals: number, underlyingToken: Token, abi: AbiItem) {
		super(store, address, decimals);
		this.pricePerShare = new BigNumber(1);
		this.underlyingToken = underlyingToken;
		this.underlyingToken.vaults.push(this);
		this.decimals = 18;
		this.holdings = new BigNumber(0);
		this.vaultBalance = new BigNumber(0);
		this.abi = abi;
		this.super = false;
	}

	deposit(amount: BigNumber): void {
		this.store.contracts.deposit(this, amount);
	}

	withdraw(amount: BigNumber): void {
		this.store.contracts.withdraw(this, amount);
	}

	holdingsValue(): BigNumber {
		return this.holdings
			.multipliedBy(this.pricePerShare)
			.dividedBy(1e18)
			.multipliedBy(this.underlyingToken.ethValue);
	}

	balanceValue(): BigNumber {
		return this.balance
			.multipliedBy(this.pricePerShare)
			.dividedBy(1e18)
			.multipliedBy(this.underlyingToken.ethValue);
	}

	update(payload: TokenPayload): void {
		super.update(payload);
		if (!!payload.position) this.position = payload.position;
		if (!!payload.growth) this.growth = payload.growth;
		if (!!payload.balance) this.vaults = payload.balance;
		if (!!payload.getPricePerFullShare) this.pricePerShare = payload.getPricePerFullShare;
		if (!!payload.totalSupply) this.holdings = payload.totalSupply;
		if (!!payload.isSuperSett) this.super = payload.isSuperSett;
		if (!!payload.ethValue) this.ethValue = payload.ethValue;
	}
}

export class Geyser extends Contract {
	public vault!: Vault;
	public holdings!: BigNumber;
	public balance!: BigNumber;
	public rewards!: Growth[];
	public abi!: AbiItem;

	constructor(store: RootStore, address: string, vault: Vault, abi: AbiItem) {
		super(store, address);
		this.vault = vault;
		this.vault.geyser = this;
		this.holdings = new BigNumber(0);
		this.balance = new BigNumber(0);
		this.abi = abi;
	}

	stake(amount: BigNumber): void {
		this.store.contracts.stake(this.vault, amount);
	}

	unstake(amount: BigNumber): void {
		this.store.contracts.unstake(this.vault, amount);
	}

	holdingsValue(): BigNumber {
		return this.holdings
			.dividedBy(1e18)
			.multipliedBy(this.vault.pricePerShare)
			.multipliedBy(this.vault.underlyingToken.ethValue);
	}

	balanceValue(): BigNumber {
		return this.balance
			.dividedBy(1e18)
			.multipliedBy(this.vault.pricePerShare)
			.multipliedBy(this.vault.underlyingToken.ethValue);
	}

	update(payload: GeyserPayload): void {
		if (!!payload.totalStaked) this.holdings = payload.totalStaked;
		if (!!payload.totalStakedFor) this.balance = payload.totalStakedFor;
		if (!!payload.getUnlockSchedulesFor) {
			this.rewards = reduceGeyserSchedule(payload.getUnlockSchedulesFor, this.store);
		}
	}
}

export class TokenModel extends Contract {
	public name: string;
	public symbol: string;
	public decimals: number;
	public balance: BigNumber;
	public poolId?: number | undefined;
	public mintRate: string;
	public redeemRate: string;

	constructor(store: RootStore, data: TokenConfig) {
		super(store, Web3.utils.toChecksumAddress(data.address));
		this.name = data.name;
		this.symbol = data.symbol;
		this.decimals = data.decimals;
		this.poolId = data?.poolId;
		this.balance = ZERO;
		// This will be fetched and set at initialization using 1 unit of mint and redeem
		// to show current conversion rate from token to ibBTC and from ibBTC to token
		// by fetchConversionRates()
		this.mintRate = '0';
		this.redeemRate = '0';
	}

	public get formattedBalance(): string {
		return this.unscale(this.balance).toFixed(3);
	}

	public get icon(): string {
		return require(`assets/tokens/${this.symbol}.png`);
	}

	public formatAmount(amount: BigNumber | string): string {
		return this.unscale(new BigNumber(amount)).toFixed(3);
	}

	public scale(amount: BigNumber | string): BigNumber {
		return new BigNumber(amount).multipliedBy(TEN.pow(this.decimals));
	}

	public unscale(amount: BigNumber | string): BigNumber {
		return new BigNumber(amount).dividedBy(TEN.pow(this.decimals));
	}
}

interface TokenConfig {
	address: string;
	name: string;
	symbol: string;
	decimals: number;
	poolId?: number | undefined;
	mintRate?: BigNumber | string;
	redeemRate?: string;
}

export interface Growth {
	day: Amount;
	week: Amount;
	month: Amount;
	year: Amount;
}
export interface Amount {
	token: Token;
	amount: BigNumber;
}

export type SushiAPIResults = {
	pairs: {
		address: any;
		aprDay: number | string | BigNumber;
		aprMonthly: number | string | BigNumber;
		aprYear_without_lockup: number | string | BigNumber;
	}[];
};

export type ReduceAirdropsProps = {
	digg?: BigNumber;
	merkleProof?: any;
	bBadger?: BigNumber;
};

export type TokenRebaseStats = {
	totalSupply: BigNumber;
	decimals: number;
	lastRebaseTimestampSec: number;
	minRebaseTimeIntervalSec: number;
	rebaseLag: any;
	epoch: any;
	inRebaseWindow: boolean;
	rebaseWindowLengthSec: number;
	oracleRate: BigNumber;
	derivedEth: any;
	nextRebase: Date;
	pastRebase: any;
};

export type TokenPayload = {
	balanceOf: BigNumber;
	decimals: number;
	symbol: string;
	ethValue: BigNumber;
	totalSupply: BigNumber;
	name: string;
	position: number;
	growth: Growth[];
	balance: Vault[];
	getPricePerFullShare: BigNumber;
	isSuperSett: boolean;
};

export type GeyserPayload = {
	totalStaked: BigNumber;
	totalStakedFor: BigNumber;
	getUnlockSchedulesFor: Schedules;
};

export type Schedules = {
	[index: string]: string[][];
};

export type RebaseToStats = { nextRebase: Date; oracleRate: string; totalSupply: string | boolean };

export type ContractToStats = {
	stats: {
		tvl: BigNumber;
		portfolio: BigNumber;
		wallet: BigNumber;
		bDigg: any;
		deposits: BigNumber;
		badger: BigNumber;
		digg: BigNumber;
		vaultDeposits: BigNumber;
	};
};

export type ReducedAirdops = {
	digg?: {
		amount: BigNumber;
		token: any;
	};
	bBadger?: {
		amount: BigNumber | null;
		token: any;
	};
};

export type FormattedGeyserGrowth = { total: BigNumber; tooltip: string };

export type FormattedVaultGrowth = { roi: string; roiTooltip: string };

export type ReducedSushiROIResults = {
	day: BigNumber;
	week: BigNumber;
	month: BigNumber;
	year: BigNumber;
};

export type MethodConfigPayload = { [index: string]: string };

export type ReducedGrowthQueryConfig = { periods: number[]; growthQueries: any };

export type ReducedCurveResult = { address: any; virtualPrice: BigNumber; ethValue: BigNumber }[];

export type ReducedGrowth = { [x: string]: { day: any; week: any; month: any; year: any } };

export type TokenAddressessConfig = {
	underlying: any;
	sushi: string[];
};

export type TokenAddressess = {
	address: any;
	contract: string;
	type: string;
	subgraph: string;
};

export type ReducedContractConfig = {
	defaults: _.Dictionary<any>;
	batchCall: {
		namespace: string;
		addresses: string[];
		allReadMethods: boolean;
		groupByNamespace: boolean;
		logging: boolean;
	}[];
};

export type ContractMethodsConfig = {
	rewards: {
		method: any;
		tokens: any;
	};
	walletMethods: string[];
};

export type BatchConfig = {
	namespace: string;
	addresses: string[];
	allReadMethods: boolean;
	groupByNamespace: boolean;
	logging: boolean;
};

export type ReducedGraphResults = {
	address: string;
	ethValue: BigNumber;
	name: string;
	type: string;
};

export type GraphResultPrices = {
	[x: string]: {
		ethValue: BigNumber;
	};
};

export type TokenContract = {
	contract: string;
};

export type AirdropsConfig = {
	[index: string]: {
		tokenAbi: AbiItem[];
		tokenContract: string | { [index: string]: string };
		airdropContract: string;
		airdropAbi: AbiItem[];
	};
};

export type AirdropNetworkConfig = {
	airdropEndpoint: string;
	airdropsConfig: AirdropsConfig;
};

export type VaultNetworkConfig = {
	[index: string]:
		| {
				abi: AbiItem[];
				underlying: string;
				contracts: string[];
				fillers: {
					symbol?: string[];
					isFeatured?: boolean[];
					position?: number[];
					isSuperSett?: boolean[];
					symbolPrefix?: string[];
					onsenId?: string[];
					pairContract?: string[];
				};
				methods: {
					name: string;
					args?: string[];
				}[];
				growthEndpoints?: string[];
		  }
		| undefined;
};

export type GeyserNetworkConfig = {
	geyserBatches?: {
		abi: AbiItem[];
		underlying: string;
		methods: {
			name: string;
			args?: string[];
		}[];
		contracts: string[];
		fillers?: {
			isFeatured?: boolean[];
			isSuperSett?: boolean[];
			getStakingToken?: string[];
			onsenId?: string[];
		};
	}[];
};

export type RewardNetworkConfig = {
	endpoint: string;
	network: number;
	contract: string;
	abi: AbiItem[];
	tokens: string[];
};

export type TokenContractInfo = {
	abi: AbiItem[];
	methods: {
		name: string;
		args?: string[];
	}[];
	contracts: string[];
};

export type TokenNetworkConfig = {
	curveTokens?: {
		contracts: string[];
		priceEndpoints: string[];
		names: string[];
		vsToken: string;
	};
	priceEndpoints: string[];
	tokenBatches: TokenContractInfo[];
	decimals: { [index: string]: number };
	symbols: { [index: string]: string };
	names: { [index: string]: string };
	tokenMap: { [index: string]: string };
};

export type RebaseNetworkConfig = {
	digg: {
		addresses: string[];
		abi: AbiItem[];
		allReadMethods?: boolean;
		readMethods?: {
			name: string;
			args: (string | number)[];
		}[];
		groupByNamespace: boolean;
		logging?: boolean;
		namespace: string;
	}[];
	orchestrator: {
		contract: string;
		abi: AbiItem[];
	};
};

export type BadgerSystem = {
	[index: string]: string | { [index: string]: string };
};

export type DeployConfig = {
	[index: string]: any;
};

export type NetworkConstants = {
	[index: string]: {
		APP_URL: string;
		RPC_URL: string;
		TOKENS: {
			[index: string]: string;
		};
		START_BLOCK: number;
		START_TIME: Date;
		DEPLOY: DeployConfig | undefined;
	};
};

export type ClaimsSymbols = {
	[index: string]: {
		[index: string]: string;
	};
};

export interface GasPrices {
	[speed: string]: number;
}

export interface NotifyLink extends CustomNotificationObject {
	link: string;
}

export interface Network {
	name: string;
	networkId: number;
	fullName: string;
	tokens: TokenNetworkConfig;
	vaults: VaultNetworkConfig;
	geysers: GeyserNetworkConfig;
	rebase: RebaseNetworkConfig | undefined;
	airdrops: AirdropNetworkConfig | undefined;
	deploy: DeployConfig;
	rewards: RewardNetworkConfig | undefined;
	gasEndpoint: string;
	sidebarTokenLinks: {
		url: string;
		title: string;
	}[];
	settOrder: string[];
	getGasPrices: () => Promise<GasPrices>;
	getNotifyLink: EmitterListener;
}

export class BscNetwork implements Network {
	public readonly name = NETWORK_LIST.BSC;
	public readonly networkId = NETWORK_IDS.BSC;
	public readonly fullName = 'Binance Smart Chain';
	public readonly tokens = getTokens(NETWORK_LIST.BSC);
	public readonly vaults = getVaults(NETWORK_LIST.BSC);
	public readonly geysers = getGeysers(NETWORK_LIST.BSC);
	public readonly rebase = getRebase(NETWORK_LIST.BSC);
	public readonly airdrops = getAirdrops(NETWORK_LIST.BSC);
	public readonly deploy = getNetworkDeploy(NETWORK_LIST.BSC);
	public readonly rewards = getRewards(NETWORK_LIST.BSC);
	public readonly gasEndpoint = '';
	// Deterministic order for displaying setts on the sett list component
	public readonly settOrder = [
		this.deploy.sett_system.vaults['native.bDiggBtcb'],
		this.deploy.sett_system.vaults['native.bBadgerBtcb'],
		this.deploy.sett_system.vaults['native.pancakeBnbBtcb'],
	];
	public readonly sidebarTokenLinks = [
		{
			url: 'https://pancakeswap.info/pair/0xE1E33459505bB3763843a426F7Fd9933418184ae',
			title: 'PancakeSwap bDigg/BtcB',
		},
		{
			url: 'https://pancakeswap.info/pair/0x10f461ceac7a17f59e249954db0784d42eff5db5',
			title: 'PancakeSwap bBadger/BtcB',
		},
	];
	public async getGasPrices(): Promise<GasPrices> {
		return { standard: 10 };
	}
	public getNotifyLink(transaction: TransactionData): NotifyLink {
		return { link: `https://bscscan.com//tx/${transaction.hash}` };
	}
}

export class EthNetwork implements Network {
	public readonly name = NETWORK_LIST.ETH;
	public readonly networkId = NETWORK_IDS.ETH;
	public readonly fullName = 'Ethereum';
	public readonly tokens = getTokens(NETWORK_LIST.ETH);
	public readonly vaults = getVaults(NETWORK_LIST.ETH);
	public readonly geysers = getGeysers(NETWORK_LIST.ETH);
	public readonly rebase = getRebase(NETWORK_LIST.ETH);
	public readonly airdrops = getAirdrops(NETWORK_LIST.ETH);
	public readonly deploy = getNetworkDeploy(NETWORK_LIST.ETH);
	public readonly rewards = getRewards(NETWORK_LIST.ETH);
	public readonly gasEndpoint = 'https://www.gasnow.org/api/v3/gas/price?utm_source=badgerv2';
	// Deterministic order for displaying setts on the sett list component
	public readonly settOrder = [
		this.deploy.sett_system.vaults['native.digg'],
		this.deploy.sett_system.vaults['native.badger'],
		this.deploy.sett_system.vaults['native.sushiDiggWbtc'],
		this.deploy.sett_system.vaults['native.sushiBadgerWbtc'],
		this.deploy.sett_system.vaults['native.sushiWbtcEth'],
		this.deploy.sett_system.vaults['native.uniDiggWbtc'],
		this.deploy.sett_system.vaults['native.uniBadgerWbtc'],
		this.deploy.sett_system.vaults['native.renCrv'],
		this.deploy.sett_system.vaults['native.sbtcCrv'],
		this.deploy.sett_system.vaults['native.tbtcCrv'],
		this.deploy.sett_system.vaults['harvest.renCrv'],
	];
	public readonly sidebarTokenLinks = [
		{
			url: 'https://matcha.xyz/markets/BADGER',
			title: 'BADGER',
		},
		{
			url: 'https://info.uniswap.org/pair/0xcd7989894bc033581532d2cd88da5db0a4b12859',
			title: 'Uniswap BADGER/wBTC',
		},
		{
			url: 'https://app.sushiswap.fi/pair/0x110492b31c59716ac47337e616804e3e3adc0b4a',
			title: 'Sushiswap BADGER/wBTC',
		},
	];
	public async getGasPrices(): Promise<GasPrices> {
		const prices = await fetch('https://www.gasnow.org/api/v3/gas/price?utm_source=badgerv2');
		const result = await prices.json();
		return {
			rapid: result.data['rapid'] / 1e9,
			fast: result.data['fast'] / 1e9,
			standard: result.data['standard'] / 1e9,
			slow: result.data['slow'] / 1e9,
		};
	}

	public getNotifyLink(transaction: TransactionData): NotifyLink {
		return { link: `https://etherscan.io/tx/${transaction.hash}` };
	}
}
/**
 * Sett and geyser objects will be represented by the same
 * interface. The key difference between a sett and geyser
 * is the value sources which populate the entity. Geyser will
 * have emissions value sources while setts only have the
 * native underlying value source.
 */
export type Sett = {
	name: string;
	asset: string;
	value: number;
	tokens: TokenBalance[];
	ppfs: number;
	apy: number;
	vaultToken: string;
	underlyingToken: string;
	sources: ValueSource[];
	geyser?: Geyser;
};

export type ValueSource = {
	name: string;
	apy: number;
	performance: Performance;
};

export type TokenBalance = {
	address: string;
	name: string;
	symbol: string;
	decimals: number;
	balance: number;
	value: number;
};

export type PriceSummary = {
	[address: string]: BigNumber | undefined;
};

export interface SettSummary {
	name: string;
	asset: string;
	value: number;
	tokens: TokenBalance[];
}

export type ProtocolSummary = {
	totalValue: number;
	setts?: SettSummary[];
};

export type SettMap = { [contract: string]: Sett };

export type RenVMTransaction = {
	// ID is the pkey in the db.
	id: string;
	userAddr: string;
	// Nonce monotonically increases per user tx.
	nonce: number;
	encodedTx: string; // json encoded tx data.
	// NB: The web3Provider field is not encoded (for obvious reasons).
	params: LockAndMintParamsSimple | BurnAndReleaseParamsSimple;
	status: string;
	// Record if there was an error processing a tx.
	error: string;
	updated: firebase.firestore.Timestamp;
	created: firebase.firestore.Timestamp;
	deleted: boolean;
};

export interface NFT {
	tokenId: string;
	balance: string;
	poolBalance: string;
	totalSupply: string;
	root: string;
	name?: string;
	image?: string;
	redirectUrl?: string;
}

export interface SyntheticData {
	// Long name of the synhetic (includes expiration date)
	name: string;
	address: string;
	// Token address of the underlying collateral currency.
	collateralCurrency: string;
	// Token address of the synthetic token currency.
	tokenCurrency: string;
	globalCollateralizationRatio: BigNumber;
	totalPositionCollateral: BigNumber; // Total collateral supplied.
	totalTokensOutstanding: BigNumber; // Token debt issued.
	collateralRequirement: BigNumber;
	expirationTimestamp: BigNumber;
	cumulativeFeeMultiplier: BigNumber;
	// Min number of sponsor tokens to mint (will default to 100 tokens or ~$100).
	minSponsorTokens: BigNumber;
	// Amount of time (in seconds) a sponsor must wait to withdraw without liquidation
	// for "slow" withdrawals.
	withdrawalLiveness: BigNumber;
	// Amount of time (in seconds) a liquidator must wait to liquidate a sponsor
	// position without a dispute.
	liquidationLiveness: BigNumber;
	expiryPrice: BigNumber;
}
export interface SponsorData {
	liquidations: Liquidation[];
	position: Position;
	pendingWithdrawal: boolean;
}

export interface Liquidation {
	/*
	 * Following variables set upon creation of liquidation:
	 * Liquidated (and expired or not), Pending a Dispute, or Dispute has resolved
	 *  - 0 == Uninitialized
	 *  - 1 == NotDisputed
	 *  - 2 == Disputed
	 *  - 3 == DisputeSucceeded
	 *  - 4 == DisputeFailed
	 */
	state: BigNumber;
	liquidationTime: BigNumber; // Time when liquidation is initiated, needed to get price from Oracle
	tokensOutstanding: BigNumber; // Synthetic tokens required to be burned by liquidator to initiate dispute
	lockedCollateral: BigNumber; // Collateral locked by contract and released upon expiry or post-dispute
	sponsor: string; // Address of the liquidated position's sponsor
	liquidator: string; // Address who created this liquidation
	// Following variables determined by the position that is being liquidated:
	// Amount of collateral being liquidated, which could be different from
	// lockedCollateral if there were pending withdrawals at the time of liquidation
	liquidatedCollateral: BigNumber;
	// Unit value (starts at 1) that is used to track the fees per unit of collateral over the course of the liquidation.
	rawUnitCollateral: BigNumber;
	// Following variable set upon initiation of a dispute:
	disputer: string; // Person who is disputing a liquidation
	// Following variable set upon a resolution of a dispute:
	settlementPrice: BigNumber; // Final price as determined by an Oracle following a dispute
	finalFee: BigNumber;
}

export interface Position {
	tokensOutstanding: BigNumber;
	withdrawalRequestPassTimestamp: BigNumber;
	withdrawalRequestAmount: BigNumber;
	rawCollateral: BigNumber;
}
