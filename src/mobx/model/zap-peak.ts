import Web3 from 'web3';
import { ContractSendMethod } from 'web3-eth-contract';
import { AbiItem } from 'web3-utils';
import BigNumber from 'bignumber.js';

import zapConfig from 'config/system/abis/ZapPeak.json';
import addresses from 'config/ibBTC/addresses.json';
import { IbbtcVaultPeak, PeakType } from './ibbtc-vault-peak';
import { RootStore } from '../store';
import { toHex } from '../utils/helpers';
import { TokenModel } from '../model';

export class ZapPeak implements IbbtcVaultPeak {
	address: string;
	type: PeakType;
	referenceToken: TokenModel;
	private store: RootStore;
	private peakContract: any;

	constructor(store: RootStore, referenceToken: TokenModel) {
		const web3 = new Web3(store.wallet.provider);
		this.store = store;
		this.referenceToken = referenceToken;
		this.address = addresses.mainnet.contracts.ZapPeak.address;
		this.type = 'zap';
		this.peakContract = new web3.eth.Contract(zapConfig.abi as AbiItem[], this.address);
	}

	getCalcMintMethod(amount: BigNumber): ContractSendMethod {
		return this.peakContract.methods.calcMint(this.referenceToken.address, toHex(amount));
	}

	getMintMethod(amount: BigNumber): ContractSendMethod {
		return this.peakContract.methods.mint(
			this.referenceToken.poolId,
			this.referenceToken.curvePoolIndex,
			toHex(amount),
			'fee',
		);
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
