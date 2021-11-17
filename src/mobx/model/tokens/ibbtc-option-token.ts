import { Contract } from '../contract/contract';
import BigNumber from 'bignumber.js';
import { RootStore } from '../../RootStore';
import { TokenConfig } from './token-config';
import Web3 from 'web3';
import { TEN, ZERO } from '../../../config/constants';

export class IbbtcOptionToken extends Contract {
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
		return this.unscale(this.balance).toFixed(6);
	}

	public get icon(): any {
		return `/assets/icons/${this.symbol.toLowerCase()}.png`;
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
