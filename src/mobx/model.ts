import BigNumber from 'bignumber.js';
import _ from 'lodash';
import { reduceGeyserSchedule } from './reducers/contractReducers';
import { RootStore } from './store';
import Web3 from 'web3';
import { AbiItem } from 'web3-utils';

import { ZERO, TEN } from 'config/constants';

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
		if (!!payload.getUnlockSchedulesFor)
			this.rewards = reduceGeyserSchedule(payload.getUnlockSchedulesFor, this.store);
	}
}

export class TokenModel extends Contract {
	public name: string;
	public symbol: string;
	public decimals: number;
	public balance: BigNumber;
	public poolId?: number | undefined;
	public mintRate: BigNumber | string;
	public redeemRate: BigNumber | string;

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
		this.mintRate = '0.999';
		this.redeemRate = '0.999';
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
	redeemRate?: BigNumber | string;
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
	array: string[];
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
		badgerGrowth: string;
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
