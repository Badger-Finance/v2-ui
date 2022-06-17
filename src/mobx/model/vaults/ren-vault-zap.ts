import { Token } from '@badger-dao/sdk';
import addresses from 'config/ibBTC/addresses.json';
import RenVaultZapABI from 'config/system/abis/RenVaultZap.json';

import badgerPeakSwap from '../../../config/system/abis/BadgerBtcPeakSwap.json';
import { RootStore } from '../../RootStore';
import { IbbtcDepositTokenPoolIds } from '../../utils/ibbtc';
import { IbBTCMintZap } from './ibbtc-mint-zap';

export class RenVaultZap extends IbBTCMintZap {
	private zap: any;

	constructor(store: RootStore, token: Token) {
		super(store, token, addresses.mainnet.contracts.RenVaultZap.address, RenVaultZapABI.abi as AbiItem[]);
		const { web3Instance } = this.store.wallet;
		if (!web3Instance) throw new Error('Web3 instance is not initialized');
		this.zap = new web3Instance.eth.Contract(RenVaultZapABI.abi as AbiItem[], this.address);
	}

	getCalcMintMethod(amount: BigNumber): ContractSendMethod {
		return this.zap.methods.calcMint(IbbtcDepositTokenPoolIds[this.token.address], toHex(amount));
	}

	getCalcRedeemMethod(amount: BigNumber): ContractSendMethod {
		return this.zap.methods.calcRedeem(IbbtcDepositTokenPoolIds[this.token.address], toHex(amount));
	}

	async getMintMethod(amount: BigNumber): Promise<ContractSendMethod> {
		const merkleProof = this.store.user.bouncerProof || [];
		return this.zap.methods.mint(IbbtcDepositTokenPoolIds[this.token.address], toHex(amount), merkleProof);
	}

	getRedeemMethod(amount: BigNumber): ContractSendMethod {
		return this.zap.methods.redeem(IbbtcDepositTokenPoolIds[this.token.address], toHex(amount));
	}

	async bBTCToSett(amount: BigNumber): Promise<BigNumber> {
		const { web3Instance } = this.store.wallet;
		if (!web3Instance) throw new Error('Web3 instance is not initialized');
		const settToken = new web3Instance.eth.Contract(vaultConfig.abi as AbiItem[], this.token.address);
		const { swap: swapAddress } = await this.zap.methods.pools(IbbtcDepositTokenPoolIds[this.token.address]).call();
		const swapContract = new web3Instance.eth.Contract(badgerPeakSwap.abi as AbiItem[], swapAddress);

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
