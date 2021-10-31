import { Contract } from '../contract/contract';
import { RootStore } from '../../RootStore';
import { TokenConfig } from './token-config';
import { TEN, ZERO } from '../../../config/constants';
import { BigNumber, BigNumberish, ethers } from 'ethers';

export class IbbtcOptionToken extends Contract {
	public name: string;
	public symbol: string;
	public decimals: number;
	public balance: BigNumber;
	public poolId?: number | undefined;
	public mintRate: string;
	public redeemRate: string;

	constructor(store: RootStore, data: TokenConfig) {
		super(store, ethers.utils.getAddress(data.address));
		this.name = data.name;
		this.symbol = data.symbol;
		this.decimals = data.decimals;
		this.poolId = data.poolId;
		this.balance = ZERO;
		// This will be fetched and set at initialization using 1 unit of mint and redeem
		// to show current conversion rate from token to ibBTC and from ibBTC to token
		// by fetchConversionRates()
		this.mintRate = '0.000';
		this.redeemRate = '0.000';
	}

	public get formattedBalance(): string {
		return this.formatAmount(this.balance);
	}

	public get icon(): any {
		return `/assets/icons/${this.symbol.toLowerCase()}.png`;
	}

	public formatAmount(amount: BigNumberish): string {
		return ethers.utils.formatUnits(this.unscale(amount).mul(1000), 3);
	}

	public scale(amount: BigNumberish): BigNumber {
		return TEN.pow(this.decimals).mul(amount);
	}

	public unscale(amount: BigNumberish): BigNumber {
		return BigNumber.from(amount).div(TEN.pow(this.decimals));
	}
}
