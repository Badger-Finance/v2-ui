import { BigNumber, ContractTransaction } from 'ethers';
import { IbbtcOptionToken } from '../tokens/ibbtc-option-token';

export enum PeakType {
	Badger = 'badger',
	Yearn = 'yearn',
	Zap = 'zap',
}

export interface MintResult {
	poolId?: BigNumber;
	idx?: BigNumber;
	bBTC: BigNumber;
	fee: BigNumber;
}

export interface RedeemResult {
	sett: BigNumber;
	fee: BigNumber;
	max: BigNumber;
}

export interface IbbtcVaultPeak {
	address: string;
	type: PeakType;
	referenceToken: IbbtcOptionToken;
	calculateMint(amount: BigNumber): Promise<MintResult>;
	calculateRedeem(amount: BigNumber): Promise<RedeemResult>;
	redeem(amount: BigNumber): Promise<ContractTransaction>;
	mint(amount: BigNumber, slippage: BigNumber): Promise<ContractTransaction>;
	bBTCToSett(amount: BigNumber): Promise<BigNumber>;
}
