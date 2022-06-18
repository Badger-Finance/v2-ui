import { BigNumber } from 'ethers';

import { IbBTCMintZap } from './ibbtc-mint-zap';

export class GeneralVaultZap extends IbBTCMintZap {
	calcMint(amount: BigNumber): Promise<BigNumber> {
		throw new Error('Method not implemented.');
	}
	calcRedeem(amount: BigNumber): Promise<BigNumber> {
		throw new Error('Method not implemented.');
	}
	mint(amount: BigNumber): Promise<BigNumber> {
		throw new Error('Method not implemented.');
	}
	redeem(amount: BigNumber): Promise<BigNumber> {
		throw new Error('Method not implemented.');
	}
	bBTCToSett(amount: BigNumber): Promise<BigNumber> {
		throw new Error('Method not implemented.');
	}

	// constructor(store: RootStore, token: Token) {
	// 	super(store, token, ibbtcConfig.mainnet.contracts.GeneralVaultZap.address, GeneralVaultZapABI.abi as AbiItem[]);
	// 	const { web3Instance } = this.store.wallet;
	// 	if (!web3Instance) throw new Error('Web3 instance is not initialized');
	// 	this.zap = new web3Instance.eth.Contract(GeneralVaultZapABI.abi as AbiItem[], this.address);
	// }

	// getCalcMintMethod(amount: BigNumber): ContractSendMethod {
	// 	return this.zap.methods.calcMint(toHex(amount), IbbtcDepositTokenPoolIds[this.token.address]);
	// }

	// async getMintMethod(amount: BigNumber, slippage: BigNumber): Promise<ContractSendMethod> {
	// 	const output = await this.getCalcMintMethod(amount).call();
	// 	const slippagePercentage = new BigNumber(100).minus(slippage);
	// 	const minOut = new BigNumber(output).multipliedBy(slippagePercentage).dividedToIntegerBy(100);
	// 	return this.zap.methods.mint(toHex(amount), IbbtcDepositTokenPoolIds[this.token.address], toHex(minOut));
	// }

	// // this method is an abstract method, but not supporting this path any longer
	// /* eslint-disable-next-line @typescript-eslint/no-unused-vars */
	// getCalcRedeemMethod(_amount: BigNumber): ContractSendMethod {
	// 	throw new Error(IBBTC_METHOD_NOT_SUPPORTED);
	// }

	// // this method is an abstract method, but not supporting this path any longer
	// /* eslint-disable-next-line @typescript-eslint/no-unused-vars */
	// getRedeemMethod(_amount: BigNumber): ContractSendMethod {
	// 	throw new Error(IBBTC_METHOD_NOT_SUPPORTED);
	// }

	// // this method is an abstract method, but not supporting this path any longer
	// /* eslint-disable-next-line @typescript-eslint/no-unused-vars */
	// async bBTCToSett(_amount: BigNumber): Promise<BigNumber> {
	// 	throw new Error(IBBTC_METHOD_NOT_SUPPORTED);
	// }
}
