import BigNumber from 'bignumber.js';
import RewardsStore from 'mobx/stores/rewardsStore';
import { inCurrency } from 'mobx/utils/helpers';
import { ETH_DEPLOY } from 'web3/config/eth-config';
import { BadgerToken } from './badger-token';

export class TokenBalance {
	private store: RewardsStore;
	readonly token: BadgerToken;
	public tokenBalance: BigNumber;
	public balance: BigNumber;
	public price: BigNumber;

	constructor(store: RewardsStore, token: BadgerToken, balance: BigNumber, price: BigNumber) {
		this.store = store;
		this.token = token;
		this.tokenBalance = balance;
		this.price = price;
		this.balance = this.formatBalance(store, token, balance);
	}

	/**
	 * Create a token balance from a string balance of appropriate decimals.
	 * i.e.
	 *   Given token A as a defined TokenBalance.
	 *   TokenBalance.fromBalance(A, A.balanceDisplay()) = A;
	 * Above does not hold true given a balance display of balance below a
	 * a requested precision threshold (< 0.001 balance display).
	 */
	static fromBalance(tokenBalance: TokenBalance, balance: string): TokenBalance {
		const { token, store, price } = tokenBalance;
		let divisor = new BigNumber(1);
		const isDigg = token.address === ETH_DEPLOY.tokens.digg;
		if (isDigg && store.badgerTree.sharesPerFragment) {
			divisor = store.badgerTree.sharesPerFragment;
		}
		const scalar = new BigNumber(Math.pow(10, token.decimals));
		const amount = new BigNumber(balance).multipliedBy(scalar).dividedBy(divisor);
		return new TokenBalance(store, token, amount, price);
	}

	get value(): BigNumber {
		return this.balance.multipliedBy(this.price);
	}

	/**
	 * Return a string display value for a given precision. Defaults to token decimals.
	 * i.e.
	 *  0 => 0.0 (1 decimal)
	 *  0.0001 => < 0.001 (3 decimals)
	 *  0.0001 => 0.00010 (5 decimals)
	 * @param precision decimal count for display purposes
	 * @returns string representation of balance
	 */
	balanceDisplay(precision?: number): string {
		const decimals = precision || this.token.decimals;
		const min = `0.${'0'.repeat(decimals - 1)}1`;
		const minBalance = this.store.balanceFromString(this.token.address, min);
		if (this.balance.gt(0) && this.balance.lt(minBalance.balance)) {
			return `< ${min}`;
		}
		return this.balance.toFixed(decimals);
	}

	scaledBalanceDisplay(percent?: number): string {
		const scalar = percent ? percent / 100 : 1;
		const scaledBalance = this.balance.multipliedBy(scalar);
		return scaledBalance.toFixed(this.token.decimals, BigNumber.ROUND_HALF_FLOOR);
	}

	balanceValueDisplay(currency: string): string {
		return inCurrency(this.value, currency);
	}

	scale(scalar: BigNumber): TokenBalance {
		const tokenBalance = this.tokenBalance.multipliedBy(scalar);
		const price = this.price.dividedBy(scalar);
		return new TokenBalance(this.store, this.token, tokenBalance, price);
	}

	private formatBalance(store: RewardsStore, token: BadgerToken, balance: BigNumber): BigNumber {
		const decimalDivisor = Math.pow(10, token.decimals);
		let divisor = new BigNumber(1);
		const isDigg = token.address === ETH_DEPLOY.tokens.digg;
		if (isDigg && store.badgerTree.sharesPerFragment) {
			divisor = store.badgerTree.sharesPerFragment;
		}
		return balance.dividedBy(decimalDivisor).dividedBy(divisor);
	}
}
