import { Currency } from 'config/enums/currency.enum';
import { BigNumber, ethers } from 'ethers';
import { inCurrency, minBalance } from 'mobx/utils/helpers';
import { BadgerToken } from './badger-token';

export class TokenBalance {
	readonly token: BadgerToken;
	public tokenBalance: BigNumber;
	public balance: BigNumber;
	public price: BigNumber;

	constructor(token: BadgerToken, balance: BigNumber, price: BigNumber) {
		this.token = token;
		this.tokenBalance = balance;
		this.price = price;
		this.balance = balance.div(Math.pow(10, token.decimals));
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
		const { token, price } = tokenBalance;
		const scalar = BigNumber.from(Math.pow(10, token.decimals));
		const amount = BigNumber.from(balance).mul(scalar);
		return new TokenBalance(token, amount, price);
	}

	static hasBalance(tokenBalance?: TokenBalance): boolean {
		if (!tokenBalance) {
			return false;
		}
		return tokenBalance.balance.gt(0);
	}

	get value(): BigNumber {
		return this.balance.mul(this.price);
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
		return ethers.utils.formatUnits(this.balance, decimals);
	}

	balanceValueDisplay(currency: Currency): string | undefined {
		return inCurrency(this.value, currency);
	}

	/**
	 * Scale token balance by a given scalar.
	 * Conversions to bTokens can utilize this function with scalePrice
	 * to effectively convert balances using ppfs as the given scalar.
	 */
	scale(scalar: BigNumber, scalePrice?: boolean): TokenBalance {
		if (this.tokenBalance.eq(0)) {
			return this;
		}
		const tokenBalance = this.tokenBalance.mul(scalar);
		const price = scalePrice ? this.price.div(scalar) : this.price;
		return new TokenBalance(this.token, tokenBalance, price);
	}

	scaledBalanceDisplay(percent: number): string {
		const scaledBalance = this.scale(BigNumber.from(percent / 100));
		return scaledBalance.balanceDisplay();
	}
}
