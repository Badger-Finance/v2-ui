import BigNumber from 'bignumber.js';
import RewardsStore from 'mobx/stores/rewardsStore';
import { inCurrency, minBalance } from 'mobx/utils/helpers';
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
		this.balance = balance.dividedBy(Math.pow(10, token.decimals));
	}

	/**
	 * Create a token balance from a string balance of appropriate decimals.
	 * i.e.
	 *   Given token A as a defined TokenBalance.
	 *   TokenBalance.fromBalance(A, A.balanceDisplay()) = A;
	 * Above does not hold true given a balance display of balance below a
	 * a requested precision threshold (< 0.001 balance display).
	 * Does not work with digg share conversion - only fragments support.
	 */
	static fromBalance(tokenBalance: TokenBalance, balance: string): TokenBalance {
		const { token, store, price } = tokenBalance;
		const scalar = new BigNumber(Math.pow(10, token.decimals));
		const amount = new BigNumber(balance).multipliedBy(scalar);
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
		if (this.balance.gt(0) && this.balance.lt(minBalance(decimals))) {
			return `< 0.${'0'.repeat(decimals - 1)}1`;
		}
		return this.balance.toFixed(decimals);
	}

	balanceValueDisplay(currency: string): string {
		return inCurrency(this.value, currency);
	}

	scale(scalar: BigNumber): TokenBalance {
		const tokenBalance = this.tokenBalance.multipliedBy(scalar);
		return new TokenBalance(this.store, this.token, tokenBalance, this.price);
	}

	scaledBalanceDisplay(percent: number): string {
		const scaledBalance = this.scale(new BigNumber(percent / 100));
		return scaledBalance.balanceDisplay();
	}
}
