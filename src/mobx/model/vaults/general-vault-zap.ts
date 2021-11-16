import Web3 from 'web3';
import { ContractSendMethod } from 'web3-eth-contract';
import { AbiItem } from 'web3-utils';
import BigNumber from 'bignumber.js';
import GeneralVaultZapABI from 'config/system/abis/GeneralVaultZap.json';
import addresses from 'config/ibBTC/addresses.json';
import { IbBTCMintZap, IBBTC_METHOD_NOT_SUPPORTED } from './ibbtc-mint-zap';
import { RootStore } from '../../RootStore';
import { toHex } from '../../utils/helpers';
import { IbbtcOptionToken } from '../tokens/ibbtc-option-token';

export class GeneralVaultZap extends IbBTCMintZap {
	private zap: any;

	constructor(store: RootStore, token: IbbtcOptionToken) {
		super(store, token, addresses.mainnet.contracts.GeneralVaultZap.address, GeneralVaultZapABI.abi as AbiItem[]);
		const web3 = new Web3(this.store.onboard.wallet?.provider);
		this.zap = new web3.eth.Contract(GeneralVaultZapABI.abi as AbiItem[], this.address);
	}

	getCalcMintMethod(amount: BigNumber): ContractSendMethod {
		return this.zap.methods.calcMint(toHex(amount), this.token.poolId);
	}

	async getMintMethod(amount: BigNumber, slippage: BigNumber): Promise<ContractSendMethod> {
		const output = await this.getCalcMintMethod(amount).call();
		const slippagePercentage = new BigNumber(100).minus(slippage);
		const minOut = new BigNumber(output).multipliedBy(slippagePercentage).dividedToIntegerBy(100);
		console.log({ amt: amount.toString(), min: minOut.toString(), bBTC: output.toString() });
		return this.zap.methods.mint(toHex(amount), this.token.poolId, minOut);
	}

	// this method is an abstract method, but not supporting this path any longer
	/* eslint-disable-next-line @typescript-eslint/no-unused-vars */
	getCalcRedeemMethod(_amount: BigNumber): ContractSendMethod {
		throw new Error(IBBTC_METHOD_NOT_SUPPORTED);
	}

	// this method is an abstract method, but not supporting this path any longer
	/* eslint-disable-next-line @typescript-eslint/no-unused-vars */
	getRedeemMethod(_amount: BigNumber): ContractSendMethod {
		throw new Error(IBBTC_METHOD_NOT_SUPPORTED);
	}

	// this method is an abstract method, but not supporting this path any longer
	/* eslint-disable-next-line @typescript-eslint/no-unused-vars */
	async bBTCToSett(_amount: BigNumber): Promise<BigNumber> {
		throw new Error(IBBTC_METHOD_NOT_SUPPORTED);
	}
}
