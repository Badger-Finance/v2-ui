import Web3 from 'web3';
import { ContractSendMethod } from 'web3-eth-contract';
import { AbiItem } from 'web3-utils';
import BigNumber from 'bignumber.js';
import zapConfig from 'config/system/abis/ZapPeak.json';
import addresses from 'config/ibBTC/addresses.json';
import { IbBTCMintZap, PeakType } from './ibbtc-mint-zap';
import { RootStore } from '../../RootStore';
import { toHex } from '../../utils/helpers';
import { IbbtcOptionToken } from '../tokens/ibbtc-option-token';

export class TokenZap implements IbBTCMintZap {
	address: string;
	type: PeakType;
	referenceToken: IbbtcOptionToken;
	private peakContract: any;

	constructor(private store: RootStore, referenceToken: IbbtcOptionToken) {
		const web3 = new Web3(this.store.onboard.wallet?.provider);
		this.referenceToken = referenceToken;
		this.address = addresses.mainnet.contracts.TokenZap.address;
		this.type = 'zap';
		this.peakContract = new web3.eth.Contract(zapConfig.abi as AbiItem[], this.address);
	}

	getCalcMintMethod(amount: BigNumber): ContractSendMethod {
		return this.peakContract.methods.calcMint(this.referenceToken.address, toHex(amount));
	}

	async getMintMethod(amount: BigNumber, slippage: BigNumber): Promise<ContractSendMethod> {
		const { idx, bBTC } = await this.getCalcMintMethod(amount).call();
		const slippagePercentage = new BigNumber(100).minus(slippage);
		const minOut = new BigNumber(bBTC).multipliedBy(slippagePercentage).dividedToIntegerBy(100);
		// pool id 0 is the ren pool id
		return this.peakContract.methods.mint(this.referenceToken.address, toHex(amount), 0, idx, toHex(minOut));
	}

	getCalcRedeemMethod(): ContractSendMethod {
		throw new Error('Calc Redeem not available on the Zap Peak');
	}

	getRedeemMethod(): ContractSendMethod {
		throw new Error('Redeem not available on the Zap Peak');
	}

	async bBTCToSett(): Promise<BigNumber> {
		throw new Error('bBTC to Sett not available on the Zap Peak');
	}
}
