import BigNumber from 'bignumber.js';
import _ from 'lodash';
import { reduceGeyserSchedule } from './reducers/contractReducers';
import { RootStore } from './store';

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

	balanceValue() {
		return this.balance.dividedBy(10 ** this.decimals).multipliedBy(this.ethValue);
	}

	update(payload: any) {
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
	public abi!: any;
	public super!: boolean;

	constructor(store: RootStore, address: string, decimals: number, underlyingToken: Token, abi: any) {
		super(store, address, decimals);
		this.pricePerShare = new BigNumber(1);
		this.underlyingToken = underlyingToken;
		this.underlyingToken.vaults.push(this);
		this.decimals = 18;
		this.holdings = new BigNumber(0);
		this.abi = abi;
		this.super = false;
	}

	deposit(amount: BigNumber) {
		this.store.contracts.deposit(this, amount);
	}

	withdraw(amount: BigNumber) {
		this.store.contracts.withdraw(this, amount);
	}

	holdingsValue() {
		return this.holdings
			.multipliedBy(this.pricePerShare)
			.dividedBy(1e18)
			.multipliedBy(this.underlyingToken.ethValue);
	}
	balanceValue() {
		return this.balance
			.multipliedBy(this.pricePerShare)
			.dividedBy(1e18)
			.multipliedBy(this.underlyingToken.ethValue);
	}

	update(payload: any) {
		super.update(payload);
		if (!!payload.position) this.position = payload.position;
		if (!!payload.growth) this.growth = payload.growth;
		if (!!payload.getPricePerFullShare)
			this.pricePerShare = payload.getPricePerFullShare.dividedBy(10 ** this.decimals);
		if (!!payload.totalSupply) this.holdings = payload.totalSupply;
		if (!!payload.isSuperSett) this.super = payload.isSuperSett;
	}
}

export class Geyser extends Contract {
	public vault!: Vault;
	public holdings!: BigNumber;
	public balance!: BigNumber;
	public rewards!: Growth;
	public abi!: any;

	constructor(store: RootStore, address: string, vault: Vault, abi: any) {
		super(store, address);
		this.vault = vault;
		this.vault.geyser = this;
		this.holdings = new BigNumber(0);
		this.balance = new BigNumber(0);
		this.abi = abi;
	}

	stake(amount: BigNumber) {
		this.store.contracts.stake(this.vault, amount);
	}

	unstake(amount: BigNumber) {
		this.store.contracts.unstake(this.vault, amount);
	}

	holdingsValue() {
		return this.holdings
			.dividedBy(1e18)
			.multipliedBy(this.vault.pricePerShare)
			.multipliedBy(this.vault.underlyingToken.ethValue);
	}

	balanceValue() {
		return this.balance
			.dividedBy(1e18)
			.multipliedBy(this.vault.pricePerShare)
			.multipliedBy(this.vault.underlyingToken.ethValue);
	}

	update(payload: any) {
		if (!!payload.totalStaked) this.holdings = payload.totalStaked;
		if (!!payload.totalStakedFor) this.balance = payload.totalStakedFor;
		if (!!payload.getUnlockSchedulesFor)
			this.rewards = reduceGeyserSchedule(payload.getUnlockSchedulesFor, this.store);
	}
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
