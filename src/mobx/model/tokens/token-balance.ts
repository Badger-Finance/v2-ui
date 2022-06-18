import { Currency, formatBalance, Token } from '@badger-dao/sdk';
import { BigNumber, BigNumberish } from 'ethers';
import { minBalance, numberWithCommas } from 'mobx/utils/helpers';

export class TokenBalance {
	readonly token: Token;
	public tokenBalance: BigNumber;
	public balance: number;
	public price: number;

	constructor(token: Token, balance: BigNumberish, price: number) {
		this.token = token;
		this.tokenBalance = BigNumber.from(balance);
		this.price = price;
		this.balance = formatBalance(balance, token.decimals);
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
		const scalar = BigNumber.from(Math.pow(10, token.decimals).toString());
		const amount = BigNumber.from(balance).mul(scalar);
		return new TokenBalance(token, amount, price);
	}

	static fromBigNumber(tokenBalance: TokenBalance, balance: BigNumber): TokenBalance {
		const { token, price } = tokenBalance;
		return new TokenBalance(token, balance, price);
	}

	hasBalance(tokenBalance?: TokenBalance): boolean {
		if (!tokenBalance) {
			return false;
		}
		return tokenBalance.balance > 0;
	}

	get value(): number {
		return this.balance * this.price;
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
		if (this.balance > 0 && this.balance < minBalance(decimals)) {
			return `< 0.${'0'.repeat(decimals - 1)}1`;
		}

		return this.balance.toFixed(decimals);
	}

	balanceValueDisplay(precision?: number): string {
		if (this.price === 0) {
			// cap to 8 decimals by default because the spaces for price converted values are usually too small to fit
			// the balances with full token decimals
			return `${this.balanceDisplay(precision ?? 8)} ${this.token.symbol}`;
		}

		return `$${numberWithCommas(this.value.toFixed(precision))}`;
	}

	/**
	 * Scale token balance by a given scalar.
	 * Conversions to bTokens can utilize this function with scalePrice
	 * to effectively convert balances using ppfs as the given scalar.
	 */
	scale(scalar: number, scalePrice?: boolean): TokenBalance {
		if (this.tokenBalance.eq(0)) {
			return this;
		}
		const tokenBalance = this.tokenBalance.mul(scalar);
		const price = scalePrice ? this.price / scalar : this.price;
		return new TokenBalance(this.token, tokenBalance, price);
	}

	scaledBalanceDisplay(percent: number): string {
		const scaledBalance = this.scale(percent / 100);
		return scaledBalance.balanceDisplay();
	}
}
