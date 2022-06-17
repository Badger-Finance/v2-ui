import { Token } from '@badger-dao/sdk';
import { BigNumber } from 'ethers';
import { RootStore } from 'mobx/stores/RootStore';

export const IBBTC_METHOD_NOT_SUPPORTED = 'ibBTC may only be redeemed for Badger renBTC Vault Tokens';

export enum ZapType {
	Token = 'token',
	GeneralVault = 'general_vault',
	RenVault = 'ren_vault',
}

export abstract class IbBTCMintZap {
	// constructor(protected store: RootStore, protected token: Token, public address: string, protected abi: AbiItem[]) {}
	abstract calcMint(amount: BigNumber): Promise<BigNumber>;
	abstract calcRedeem(amount: BigNumber): Promise<BigNumber>;
	abstract mint(amount: BigNumber): Promise<BigNumber>;
	abstract redeem(amount: BigNumber): Promise<BigNumber>;
	abstract bBTCToSett(amount: BigNumber): Promise<BigNumber>;
}
