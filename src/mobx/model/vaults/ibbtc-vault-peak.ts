import { BigNumber } from 'ethers';
import { ContractSendMethod } from 'web3-eth-contract';
import { IbbtcOptionToken } from '../tokens/ibbtc-option-token';

export type PeakType = 'badger' | 'yearn' | 'zap';

export interface IbbtcVaultPeak {
	address: string;
	type: PeakType;
	referenceToken: IbbtcOptionToken;
	getCalcMintMethod(amount: BigNumber): ContractSendMethod;
	getCalcRedeemMethod(amount: BigNumber): ContractSendMethod;
	getRedeemMethod(amount: BigNumber): ContractSendMethod;
	getMintMethod(amount: BigNumber, slippage: BigNumber): Promise<ContractSendMethod>;
	bBTCToSett(amount: BigNumber): Promise<BigNumber>;
}
