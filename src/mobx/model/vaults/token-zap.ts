import { Token } from '@badger-dao/sdk';
import addresses from 'config/ibBTC/addresses.json';
import zapConfig from 'config/system/abis/ZapPeak.json';
import { BigNumber } from 'ethers';

import { IBBTC_METHOD_NOT_SUPPORTED, IbBTCMintZap } from './ibbtc-mint-zap';

export class TokenZap extends IbBTCMintZap {
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
	// private zap: any;

	// constructor(store: RootStore, token: Token) {
	// 	super(store, token, addresses.mainnet.contracts.TokenZap.address, zapConfig.abi as AbiItem[]);
	// 	const { web3Instance } = this.store.wallet;
	// 	if (!web3Instance) throw new Error('Web3 instance is not initialized');
	// 	this.zap = new web3Instance.eth.Contract(zapConfig.abi as AbiItem[], this.address);
	// }

	// getCalcMintMethod(amount: BigNumber): ContractSendMethod {
	// 	return this.zap.methods.calcMint(this.token.address, toHex(amount));
	// }

	// async getMintMethod(amount: BigNumber, slippage: BigNumber): Promise<ContractSendMethod> {
	// 	const { poolId, idx, bBTC } = await this.getCalcMintMethod(amount).call();
	// 	const slippagePercentage = new BigNumber(100).minus(slippage);
	// 	const minOut = new BigNumber(bBTC).multipliedBy(slippagePercentage).dividedToIntegerBy(100);
	// 	return this.zap.methods.mint(this.token.address, toHex(amount), poolId, idx, toHex(minOut));
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
