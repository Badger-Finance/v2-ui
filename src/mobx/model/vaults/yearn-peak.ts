import addresses from 'config/ibBTC/addresses.json';
import { IbbtcVaultPeak, MintResult, PeakType, RedeemResult } from './ibbtc-vault-peak';
import { RootStore } from '../../RootStore';
import { IbbtcOptionToken } from '../tokens/ibbtc-option-token';
import { BigNumber, ContractTransaction } from 'ethers';
import { YearnBtcPeak, YearnBtcPeak__factory } from 'contracts';
import { YearnWrapper__factory } from 'contracts/factories/YearnWrapper__factory';

export class YearnPeak implements IbbtcVaultPeak {
	private store: RootStore;
	private peakContract: YearnBtcPeak;
	readonly address: string;
	readonly type: PeakType;
	readonly referenceToken: IbbtcOptionToken;

	constructor(store: RootStore, referenceToken: IbbtcOptionToken) {
		this.store = store;
		this.referenceToken = referenceToken;
		this.address = addresses.mainnet.contracts.yearnWBTCPeak.address;
		this.type = PeakType.Yearn;
		this.peakContract = YearnBtcPeak__factory.connect(this.address, this.store.wallet.provider);
	}

	async calculateMint(amount: BigNumber): Promise<MintResult> {
		return this.peakContract.calcMint(amount);
	}

	async calculateRedeem(amount: BigNumber): Promise<RedeemResult> {
		return this.peakContract.calcRedeem(amount);
	}

	async mint(amount: BigNumber): Promise<ContractTransaction> {
		const merkleProof = this.store.user.bouncerProof || [];
		return this.peakContract.mint(amount, merkleProof);
	}

	async redeem(amount: BigNumber): Promise<ContractTransaction> {
		return this.peakContract.redeem(amount);
	}

	async bBTCToSett(amount: BigNumber): Promise<BigNumber> {
		const wrapper = YearnWrapper__factory.connect(this.referenceToken.address, this.store.wallet.provider);
		const yearnTokenPricePerShare = await wrapper.pricePerShare();
		return amount.div(100).div(yearnTokenPricePerShare);
	}
}
