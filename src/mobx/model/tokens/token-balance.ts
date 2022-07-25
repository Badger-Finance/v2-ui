import { formatBalance, Token } from '@badger-dao/sdk';
import { DIGG_ADDRESS, DIGG_SHARES_PER_FRAGMENT } from '@badger-dao/sdk/lib/digg/digg.service';
import { BigNumber, BigNumberish, ethers } from 'ethers';
import { numberWithCommas } from 'mobx/utils/helpers';

export class TokenBalance {
  readonly token: Token;
  public tokenBalance: BigNumber;
  public balance: number;
  public price: number;

  constructor(token: Token, balance: BigNumberish, price: number) {
    this.token = token;

    if (token.address === DIGG_ADDRESS) {
      balance = BigNumber.from(balance).div(DIGG_SHARES_PER_FRAGMENT);
    }

    this.tokenBalance = BigNumber.from(balance);
    this.price = price;
    this.balance = formatBalance(balance, token.decimals);
  }

  static fromString(tokenBalance: TokenBalance, balance: string): TokenBalance {
    const { token, price } = tokenBalance;
    const amount = ethers.utils.parseUnits(balance, token.decimals);
    return new TokenBalance(token, amount, price);
  }

  static fromBalance(tokenBalance: TokenBalance, balance: number): TokenBalance {
    const { token, price } = tokenBalance;
    const amount = ethers.utils.parseUnits(String(balance), token.decimals);
    return new TokenBalance(token, amount, price);
  }

  static fromBigNumber(tokenBalance: TokenBalance, balance: BigNumber): TokenBalance {
    const { token, price } = tokenBalance;
    return new TokenBalance(token, balance, price);
  }

  hasBalance(): boolean {
    return this.balance > 0;
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
    const decimals = precision ?? this.token.decimals;
    if (this.balance > 0 && this.balance < this.minBalance(decimals)) {
      return `< 0.${'0'.repeat(Math.max(decimals - 1, 0))}1`;
    }

    const result = ethers.utils.formatUnits(this.tokenBalance, this.token.decimals);

    if (decimals === this.token.decimals) {
      return result;
    }

    return Number(result).toFixed(decimals);
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
    if (this.tokenBalance.eq(0) || scalar === 1) {
      return this;
    }
    const baseScalar = Math.pow(10, this.token.decimals);
    const tokenBalance = this.tokenBalance.mul((baseScalar * scalar).toString()).div(baseScalar.toString());
    const price = scalePrice ? this.price / scalar : this.price;
    return new TokenBalance(this.token, tokenBalance, price);
  }

  scaledBalanceDisplay(percent: number): string {
    const scaledBalance = this.scale(percent / 100);
    return scaledBalance.balanceDisplay();
  }

  private minBalance(decimals: number): number {
    return Number(`0.${'0'.repeat(Math.max(decimals - 1, 0))}1`);
  }
}
