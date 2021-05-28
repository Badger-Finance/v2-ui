import { ContractSendMethod } from 'web3-eth-contract';
import BigNumber from 'bignumber.js';
import { TokenModel } from '../model';

export type PeakType = 'badger' | 'yearn' | 'zap';

export interface IbbtcVaultPeak {
	address: string;
	type: PeakType;
	referenceToken: TokenModel;
	getCalcMintMethod(amount: BigNumber): ContractSendMethod;
	getCalcRedeemMethod(amount: BigNumber): ContractSendMethod;
	getMintMethod(amount: BigNumber): ContractSendMethod;
	getRedeemMethod(amount: BigNumber): ContractSendMethod;
	bBTCToSett(amount: BigNumber): Promise<BigNumber>;
}
