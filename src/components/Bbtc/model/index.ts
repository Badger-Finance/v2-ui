import BigNumber from 'bignumber.js';
import Web3 from 'web3';
import { Contract } from 'mobx/model';
import { RootStore } from 'mobx/store';

const TEN = new BigNumber(10);
const ZERO = new BigNumber(0);

interface TokenConfig {
	address: string;
	name: string;
	symbol: string;
	decimals: number;
	poolId?: number | undefined;
}

export class TokenModel extends Contract {
	public name: string;
	public symbol: string;
	public decimals: number;
	public balance: BigNumber;
	public poolId?: number | undefined;

	constructor(store: RootStore, data: TokenConfig) {
		super(store, Web3.utils.toChecksumAddress(data.address));
		this.name = data.name;
		this.symbol = data.symbol;
		this.decimals = data.decimals;
		this.poolId = data?.poolId;
		this.balance = ZERO;
	}

	public get formattedBalance(): string {
		return this.unscale(this.balance).toFixed(3);
	}

	public get icon(): string {
		return require(`assets/tokens/${this.symbol}.png`);
	}

	public set Balance(balance: BigNumber) {
		this.balance = balance;
	}

	public scale(amount: BigNumber | string): BigNumber {
		return new BigNumber(amount).multipliedBy(TEN.pow(this.decimals));
	}

	public unscale(amount: BigNumber | string): BigNumber {
		return new BigNumber(amount).dividedBy(TEN.pow(this.decimals));
	}
}
