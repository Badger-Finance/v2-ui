import Web3 from 'web3';
import { ContractSendMethod } from 'web3-eth-contract';
import { AbiItem } from 'web3-utils';

import BadgerBtcPeak from 'config/system/abis/BadgerBtcPeak.json';
import addresses from 'config/ibBTC/addresses.json';
import { IbbtcVaultPeak, PeakType } from './ibbtc-vault-peak';
import { RootStore } from '../../RootStore';
import { toHex } from '../../utils/helpers';
import BigNumber from 'bignumber.js';
import settConfig from '../../../config/system/abis/Sett.json';
import badgerPeakSwap from '../../../config/system/abis/BadgerBtcPeakSwap.json';
import { IbbtcOptionToken } from '../tokens/ibbtc-option-token';

export class BadgerPeak implements IbbtcVaultPeak {
	address: string;
	type: PeakType;
	referenceToken: IbbtcOptionToken;

	private store: RootStore;
	private peakContract: any;

	constructor(store: RootStore, referenceToken: IbbtcOptionToken) {
		this.store = store;
		this.referenceToken = referenceToken;
		const web3 = new Web3(this.store.wallet.provider);
		this.address = addresses.mainnet.contracts.BadgerSettPeak.address;
		this.type = 'badger';
		this.peakContract = new web3.eth.Contract(BadgerBtcPeak.abi as AbiItem[], this.address);
	}

	getCalcMintMethod(amount: BigNumber): ContractSendMethod {
		return this.peakContract.methods.calcMint(this.referenceToken.poolId, toHex(amount));
	}

	getCalcRedeemMethod(amount: BigNumber): ContractSendMethod {
		return this.peakContract.methods.calcRedeem(this.referenceToken.poolId, toHex(amount));
	}

	async getMintMethod(amount: BigNumber): Promise<ContractSendMethod> {
		const merkleProof = this.store.user.bouncerProof || [];
		return this.peakContract.methods.mint(this.referenceToken.poolId, toHex(amount), merkleProof);
	}

	getRedeemMethod(amount: BigNumber): ContractSendMethod {
		return this.peakContract.methods.redeem(this.referenceToken.poolId, toHex(amount));
	}

	async bBTCToSett(amount: BigNumber): Promise<BigNumber> {
		const web3 = new Web3(this.store.wallet.provider);
		const settToken = new web3.eth.Contract(settConfig.abi as AbiItem[], this.referenceToken.address);
		const { swap: swapAddress } = await this.peakContract.methods.pools(this.referenceToken.poolId).call();
		const swapContract = new web3.eth.Contract(badgerPeakSwap.abi as AbiItem[], swapAddress);

		const [settTokenPricePerFullShare, swapVirtualPrice] = await Promise.all([
			settToken.methods.getPricePerFullShare().call(),
			swapContract.methods.get_virtual_price().call(),
		]);

		return amount
			.multipliedBy(1e36)
			.dividedToIntegerBy(settTokenPricePerFullShare)
			.dividedToIntegerBy(swapVirtualPrice);
	}
}
