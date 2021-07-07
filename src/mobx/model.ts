import firebase from 'firebase';
import BigNumber from 'bignumber.js';
import { AbiItem } from 'web3-utils';
import Web3 from 'web3';
import { CustomNotificationObject, EmitterListener, TransactionData } from 'bnc-notify';
import { LockAndMintParamsSimple, BurnAndReleaseParamsSimple } from '@renproject/interfaces';
import { RootStore } from './store';
import { getAirdrops } from 'config/system/airdrops';
import { getRebase } from '../config/system/rebase';
import { getRewards } from 'config/system/rewards';
import { SidebarLink, sidebarPricingLinks, sidebarTokenLinks } from 'config/ui/links';
import { NETWORK_IDS, NETWORK_LIST, ZERO, TEN, FLAGS } from 'config/constants';
import { getStrategies } from '../config/system/strategies';
import { getNetworkDeploy } from './utils/network';
import { BadgerSett } from './model/badger-sett';
import { BatchCallRequest } from 'web3/interface/batch-call-request';
import { ethSetts, ethProtocolTokens, getEthereumBatchRequests, getNetworkBatchRequests } from 'web3/config/eth-config';
import { bscSetts, bscProtocolTokens } from 'web3/config/bsc-config';
import { ProtocolTokens } from 'web3/interface/protocol-token';
import { TokenBalance } from './model/token-balance';

export class Contract {
	store!: RootStore;
	public address!: string;

	constructor(store: RootStore, address: string) {
		this.store = store;
		this.address = address;
	}
}

export interface StrategyConfig {
	name: string;
	address: string;
	fees: FeeConfig;
	strategyLink: string;
}

export interface StrategyNetworkConfig {
	[vaultAddress: string]: StrategyConfig;
}

export interface FeeConfig {
	[feeName: string]: BigNumber;
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
		this.mintRate = '0.000';
		this.redeemRate = '0.000';
	}

	public get formattedBalance(): string {
		return this.unscale(this.balance).toFixed(3);
	}

	public get icon(): any {
		return `/assets/icons/${this.symbol.toLowerCase()}.svg`;
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

export interface BadgerTree {
	cycle: string;
	timeSinceLastCycle: string;
	sharesPerFragment: BigNumber | undefined;
	proof: RewardMerkleClaim | undefined;
	claims: TokenBalance[];
	amounts: TokenBalance[];
	claimableAmounts: string[];
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

export interface RewardMerkleClaim {
	index: string;
	cycle: string;
	boost: BigNumber;
	user: string;
	tokens: string[];
	cumulativeAmounts: string[];
	proof: string[];
	node: string;
}

export type TreeClaimData = [string[], string[]];

export type ReduceAirdropsProps = {
	digg?: BigNumber;
	merkleProof?: any;
	bBadger?: BigNumber;
};

export type Schedules = {
	[index: string]: string[][];
};

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

export type MethodConfigPayload = { [index: string]: string };

export type ReducedCurveResult = { address: any; virtualPrice: BigNumber; ethValue: BigNumber }[];

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
	defaults: Record<any, any>;
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
	active: boolean;
	endpoint: string;
	token: string;
	tokenAbi: AbiItem[];
	airdropContract: string;
	airdropAbi: AbiItem[];
};

export type VaultNetworkConfig = {
	[index: string]:
		| {
				abi: AbiItem[];
				underlying: string;
				contracts: string[];
				fillers: {
					[index: string]: string[] | boolean[] | number[];
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
		START_BLOCK: number;
		START_TIME: Date;
		DEPLOY: DeployConfig;
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
	setts: BadgerSett[];
	batchRequests: (setts: SettMap, address: string) => BatchCallRequest[];
	tokens: ProtocolTokens;
	rebase: RebaseNetworkConfig | undefined;
	airdrops: AirdropNetworkConfig[];
	deploy: DeployConfig;
	rewards: RewardNetworkConfig | undefined;
	currency: string;
	gasEndpoint: string;
	sidebarTokenLinks: SidebarLink[];
	sidebarPricingLinks: SidebarLink[];
	settOrder: string[];
	getGasPrices: () => Promise<GasPrices>;
	getNotifyLink: EmitterListener;
	isWhitelisted: { [index: string]: boolean };
	cappedDeposit: { [index: string]: boolean };
	uncappedDeposit: { [index: string]: boolean };
	newVaults: { [index: string]: string[] };
	strategies: StrategyNetworkConfig;
	getFees: (vaultAddress: string) => string[];
}

const _getFees = (strategy: StrategyConfig) => {
	const feeList: string[] = [];
	if (!strategy) return [];
	// fees are stored in BIPs on the contract, dividing by 10**2 makes them readable %
	Object.keys(strategy.fees).forEach((key) => {
		const value = strategy.fees[key];
		if (value.gt(0)) {
			feeList.push(`${key}:  ${value.dividedBy(10 ** 2).toString()}%`);
		}
	});
	return feeList;
};

export class BscNetwork implements Network {
	readonly name = NETWORK_LIST.BSC;
	readonly networkId = NETWORK_IDS.BSC;
	readonly fullName = 'Binance Smart Chain';
	readonly setts = bscSetts;
	readonly batchRequests = getNetworkBatchRequests;
	readonly tokens = bscProtocolTokens;
	readonly rebase = getRebase(NETWORK_LIST.BSC);
	readonly airdrops = getAirdrops(NETWORK_LIST.BSC);
	readonly deploy = getNetworkDeploy(NETWORK_LIST.BSC);
	readonly rewards = getRewards(NETWORK_LIST.BSC);
	readonly currency = 'BNB';
	readonly gasEndpoint = '';
	// Deterministic order for displaying setts on the sett list component
	readonly settOrder = [
		this.deploy.sett_system.vaults['native.bDiggBtcb'],
		this.deploy.sett_system.vaults['native.bBadgerBtcb'],
		this.deploy.sett_system.vaults['native.pancakeBnbBtcb'],
		this.deploy.sett_system.vaults['yearn.wBtc'],
	];
	public readonly sidebarTokenLinks = sidebarTokenLinks(NETWORK_LIST.BSC);
	public readonly sidebarPricingLinks = sidebarPricingLinks;
	public async getGasPrices(): Promise<GasPrices> {
		return { standard: 5 };
	}
	public getNotifyLink(transaction: TransactionData): NotifyLink {
		return { link: `https://bscscan.com//tx/${transaction.hash}` };
	}
	readonly isWhitelisted = {};
	readonly cappedDeposit = {};
	readonly uncappedDeposit = {};
	readonly newVaults = {};
	readonly strategies = getStrategies(NETWORK_LIST.BSC);
	public getFees(vaultAddress: string): string[] {
		return _getFees(this.strategies[vaultAddress]);
	}
}

export class EthNetwork implements Network {
	readonly name = NETWORK_LIST.ETH;
	readonly networkId = NETWORK_IDS.ETH;
	readonly fullName = 'Ethereum';
	readonly setts = ethSetts;
	readonly batchRequests = getEthereumBatchRequests;
	readonly tokens = ethProtocolTokens;
	readonly rebase = getRebase(NETWORK_LIST.ETH);
	readonly airdrops = getAirdrops(NETWORK_LIST.ETH);
	readonly deploy = getNetworkDeploy(NETWORK_LIST.ETH);
	readonly rewards = getRewards(NETWORK_LIST.ETH);
	readonly currency = 'ETH';
	readonly gasEndpoint = 'https://www.gasnow.org/api/v3/gas/price?utm_source=badgerv2';
	// Deterministic order for displaying setts on the sett list component
	readonly settOrder = [
		this.deploy.sett_system.vaults['native.sushiibBTCwBTC'],
		this.deploy.sett_system.vaults['yearn.wBtc'],
		this.deploy.sett_system.vaults['native.digg'],
		this.deploy.sett_system.vaults['native.badger'],
		this.deploy.sett_system.vaults['native.sushiDiggWbtc'],
		this.deploy.sett_system.vaults['native.sushiBadgerWbtc'],
		this.deploy.sett_system.vaults['native.sushiWbtcEth'],
		this.deploy.sett_system.vaults['native.uniDiggWbtc'],
		this.deploy.sett_system.vaults['native.uniBadgerWbtc'],
		this.deploy.sett_system.vaults['native.cvxCrv'],
		this.deploy.sett_system.vaults['native.cvx'],
		this.deploy.sett_system.vaults['native.tricryptoCrv'],
		this.deploy.sett_system.vaults['native.sbtcCrv'],
		this.deploy.sett_system.vaults['native.renCrv'],
		this.deploy.sett_system.vaults['native.tbtcCrv'],
		this.deploy.sett_system.vaults['native.hbtcCrv'],
		this.deploy.sett_system.vaults['native.pbtcCrv'],
		this.deploy.sett_system.vaults['native.obtcCrv'],
		this.deploy.sett_system.vaults['native.bbtcCrv'],
		this.deploy.sett_system.vaults['harvest.renCrv'],
		...(FLAGS.STABILIZATION_SETTS ? [this.deploy.sett_system.vaults['experimental.digg']] : []),
	];
	public readonly sidebarTokenLinks = sidebarTokenLinks(NETWORK_LIST.ETH);
	public readonly sidebarPricingLinks = sidebarPricingLinks;
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
	readonly isWhitelisted = {};
	readonly cappedDeposit = {};
	readonly uncappedDeposit = {
		[this.deploy.sett_system.vaults['yearn.wBtc']]: true,
	};
	readonly newVaults = {};
	readonly strategies = getStrategies(NETWORK_LIST.ETH);
	public getFees(vaultAddress: string): string[] {
		return _getFees(this.strategies[vaultAddress]);
	}
}

export type UserPermissions = {
	viewSettShop: boolean;
};

export type Eligibility = {
	isEligible: boolean;
};

export type BouncerProof = {
	address: string;
	proof: string[];
};

export interface BoostMultipliers {
	[contract: string]: number;
}

export interface Account {
	id: string;
	boost: number;
	boostRank: number;
	multipliers: BoostMultipliers;
	depositLimits: AccountLimits;
	// currently unused below
	value: number;
	earnedValue: number;
	balances: SettBalance[];
}

export interface SettBalance {
	id: string;
	name: string;
	asset: string;
	balance: SettTokenBalance[];
	value: number;
	earnedTokens: SettTokenBalance[];
	earnedValue: number;
}

export interface AccountLimits {
	[contract: string]: DepositLimit;
}

export interface DepositLimit {
	available: number;
	limit: number;
}

export enum Protocol {
	Curve = 'curve',
	Sushiswap = 'sushiswap',
	Uniswap = 'uniswap',
	Pancakeswap = 'pancakeswap',
	Yearn = 'yearn',
	Harvest = 'harvest',
}

export enum SettState {
	Open = 'open',
	Guarded = 'guarded',
	Experimental = 'experimental',
}

export interface Sett extends SettSummary {
	apr: number;
	asset: string;
	boostable: boolean;
	experimental: boolean;
	hasBouncer: boolean;
	maxApr?: number;
	minApr?: number;
	ppfs: number;
	sources: ValueSource[];
	state: SettState;
	tokens: SettTokenBalance[];
	underlyingToken: string;
	vaultToken: string;
}

export interface SettAffiliateData {
	availableDepositLimit?: number;
	protocol: Protocol;
	depositLimit?: number;
}

export type ValueSource = {
	name: string;
	apy: number;
	apr: number;
	performance: Performance;
	boostable: boolean;
	harvestable: boolean;
	minApr: number;
	maxApr: number;
};

export type Performance = {
	oneDay?: number;
	threeDay?: number;
	sevenDay?: number;
	thirtyDay?: number;
};

export type SettTokenBalance = {
	address: string;
	name: string;
	symbol: string;
	decimals: number;
	balance: number;
	value: number;
};

export type PriceSummary = {
	[address: string]: BigNumber;
};

export interface SettSummary {
	name: string;
	value: number;
	balance: number;
}

export type ProtocolSummary = {
	totalValue: number;
	setts?: SettSummary[];
};

export type SettMap = { [contract: string]: Sett };

export type RenVMTransaction = {
	// ID is the pkey in the db.
	id: string;
	user: string;
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

export interface ExchangeRates {
	usd: number;
	cad: number;
	btc: number;
	bnb: number;
}

export interface BDiggExchangeRates extends ExchangeRates {
	eth: number;
}

export interface ibBTCFees {
	mintFeePercent: BigNumber;
	redeemFeePercent: BigNumber;
}

export interface LeaderBoardEntry {
	rank: number;
	address: string;
	stakeRatio: string;
	boost: string;
}

export interface LeaderBoardData {
	data: LeaderBoardEntry[];
	page: number;
	size: number;
	count: number;
	maxPage: number;
}

export interface MintLimits {
	userLimit: BigNumber;
	allUsersLimit: BigNumber;
	individualLimit: BigNumber;
	globalLimit: BigNumber;
}
