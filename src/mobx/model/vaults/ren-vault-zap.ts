import Web3 from 'web3';
import { ContractSendMethod } from 'web3-eth-contract';
import { AbiItem } from 'web3-utils';
import RenVaultZapABI from 'config/system/abis/RenVaultZap.json';
import addresses from 'config/ibBTC/addresses.json';
import { IbBTCMintZap } from './ibbtc-mint-zap';
import { RootStore } from '../../RootStore';
import { toHex } from '../../utils/helpers';
import BigNumber from 'bignumber.js';
import settConfig from '../../../config/system/abis/Sett.json';
import badgerPeakSwap from '../../../config/system/abis/BadgerBtcPeakSwap.json';
import { IbbtcOptionToken } from '../tokens/ibbtc-option-token';
import { IbbtcDepositTokenPoolIds } from '../../utils/ibbtc';
import { Token } from '@badger-dao/sdk';

// TODO: Remove if ever actually unused
// "RenVaultZap": {
// 	"supportedTokens": ["bcrvRenBTC"],
// 	"address": "0x41671BA1abcbA387b9b2B752c205e22e916BE6e3"
// },

export class RenVaultZap extends IbBTCMintZap {
	private zap: any;

	constructor(store: RootStore, token: Token) {
		super(store, token, addresses.mainnet.contracts.RenVaultZap.address, RenVaultZapABI.abi as AbiItem[]);
		const web3 = new Web3(this.store.onboard.wallet?.provider);
		this.zap = new web3.eth.Contract(RenVaultZapABI.abi as AbiItem[], this.address);
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
		const web3 = new Web3(this.store.onboard.wallet?.provider);
		const settToken = new web3.eth.Contract(settConfig.abi as AbiItem[], this.token.address);
		const { swap: swapAddress } = await this.zap.methods.pools(IbbtcDepositTokenPoolIds[this.token.address]).call();
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
