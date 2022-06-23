import { BigNumber } from 'ethers';

export enum ZapType {
  RenVault = 'ren_vault',
}

export abstract class IbBTCMintZap {
  abstract bBTCToSett(amount: BigNumber): Promise<BigNumber>;
}
