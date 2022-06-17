import { Token } from '@badger-dao/sdk';
import { BigNumber } from 'ethers';
import { RootStore } from 'mobx/RootStore';

export const IBBTC_METHOD_NOT_SUPPORTED = 'ibBTC may only be redeemed for Badger renBTC Vault Tokens';

export enum ZapType {
	Token = 'token',
	GeneralVault = 'general_vault',
	RenVault = 'ren_vault',
}

export abstract class IbBTCMintZap {
	constructor(protected store: RootStore, protected token: Token, public address: string, protected abi: AbiItem[]) {}
	abstract getCalcMintMethod(amount: BigNumber): ContractSendMethod;
	abstract getCalcRedeemMethod(amount: BigNumber): ContractSendMethod;
	abstract getRedeemMethod(amount: BigNumber): ContractSendMethod;
	abstract getMintMethod(amount: BigNumber, slippage: BigNumber): Promise<ContractSendMethod>;
	abstract bBTCToSett(amount: BigNumber): Promise<BigNumber>;
}
