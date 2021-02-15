import BigNumber from 'bignumber.js';
import Web3 from 'web3';

const TEN = new BigNumber(10);
const ZERO = new BigNumber(0);

export class TokenModel {
	public name: string;
	public address: string;
	public symbol: string;
	public decimals: number;
	public balance: BigNumber;

	constructor(data: { address: string; name: string; symbol: string; decimals: number }) {
		this.address = Web3.utils.toChecksumAddress(data.address);
		this.name = data.name;
		this.symbol = data.symbol;
		this.decimals = data.decimals;
		this.balance = new BigNumber(0);
	}

	public get isCurvy(): boolean {
		return this.symbol ? this.symbol.includes('crv') : false;
	}

	public get bBTC(): boolean {
		return this.symbol === 'DUSD';
	}

	public get formattedBalance(): string {
		return this.scale(this.balance).toFixed(3);
	}

	public get icon(): string {
		return require(`assets/tokens/${this.symbol}.png`);
	}

	public scale(amount: BigNumber | string): BigNumber {
		return new BigNumber(amount).multipliedBy(TEN.pow(this.decimals));
	}

	public unscale(amount: BigNumber | string): BigNumber {
		return new BigNumber(amount).dividedBy(TEN.pow(this.decimals));
	}
}
