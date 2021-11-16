import Web3 from 'web3';
import { ContractSendMethod } from 'web3-eth-contract';
import { AbiItem } from 'web3-utils';
import BigNumber from 'bignumber.js';
import BadgerYearnWbtcPeak from 'config/system/abis/BadgerYearnWbtcPeak.json';
import addresses from 'config/ibBTC/addresses.json';
import yearnConfig from '../../../config/system/abis/YearnWrapper.json';
import { IbBTCMintZap, PeakType } from './ibbtc-mint-zap';
import { RootStore } from '../../RootStore';
import { toHex } from '../../utils/helpers';
import { IbbtcOptionToken } from '../tokens/ibbtc-option-token';

export class GeneralVaultZap implements IbBTCMintZap {
	address: string;
	type: PeakType;
	referenceToken: IbbtcOptionToken;
	private peakContract: any;

	constructor(private store: RootStore, referenceToken: IbbtcOptionToken) {
		const web3 = new Web3(this.store.onboard.wallet?.provider);
		this.referenceToken = referenceToken;
		this.address = addresses.mainnet.contracts.GeneralVaultZap.address;
		this.type = 'yearn';
		this.peakContract = new web3.eth.Contract(BadgerYearnWbtcPeak.abi as AbiItem[], this.address);
	}

	getCalcMintMethod(amount: BigNumber): ContractSendMethod {
		return this.peakContract.methods.calcMint(toHex(amount));
	}

	getCalcRedeemMethod(amount: BigNumber): ContractSendMethod {
		return this.peakContract.methods.calcRedeem(toHex(amount));
	}

	async getMintMethod(amount: BigNumber): Promise<ContractSendMethod> {
		const merkleProof = this.store.user.bouncerProof || [];
		return this.peakContract.methods.mint(toHex(amount), merkleProof);
	}

	getRedeemMethod(amount: BigNumber): ContractSendMethod {
		return this.peakContract.methods.redeem(toHex(amount));
	}

	async bBTCToSett(amount: BigNumber): Promise<BigNumber> {
		const web3 = new Web3(this.store.onboard.wallet?.provider);
		const yearnToken = new web3.eth.Contract(yearnConfig.abi as AbiItem[], this.referenceToken.address);
		const yearnTokenPricePerShare = await yearnToken.methods.pricePerShare().call();

		return amount.dividedToIntegerBy(100).dividedToIntegerBy(yearnTokenPricePerShare);
	}
}
