import addresses from 'config/ibBTC/addresses.json';
import { IbbtcVaultPeak, MintResult, PeakType, RedeemResult } from './ibbtc-vault-peak';
import { RootStore } from '../../RootStore';
import { IbbtcOptionToken } from '../tokens/ibbtc-option-token';
import { BigNumber, ContractTransaction } from 'ethers';
import { BadgerBtcPeak, BadgerBtcPeak__factory, BadgerPeakSwap__factory, VaultV1__factory } from 'contracts';
import { ZERO } from 'config/constants';

export class BadgerPeak implements IbbtcVaultPeak {
	private peakContract: BadgerBtcPeak;
	private poolId: number;
	readonly address: string;
	readonly type: PeakType;

	constructor(private store: RootStore, public referenceToken: IbbtcOptionToken) {
		this.address = addresses.mainnet.contracts.BadgerSettPeak.address;
		this.type = PeakType.Badger;
		this.peakContract = BadgerBtcPeak__factory.connect(this.address, store.wallet.provider);
		if (!referenceToken.poolId) {
			throw new Error('Badger Peak required pool ID');
		}
		this.poolId = referenceToken.poolId;
	}

	async calculateMint(amount: BigNumber): Promise<MintResult> {
		return this.peakContract.calcMint(this.poolId, amount);
	}

	async calculateRedeem(amount: BigNumber): Promise<RedeemResult> {
		return this.peakContract.calcRedeem(this.poolId, amount);
	}

	async mint(amount: BigNumber): Promise<ContractTransaction> {
		const merkleProof = this.store.user.bouncerProof || [];
		return this.peakContract.mint(this.poolId, amount, merkleProof);
	}

	async redeem(amount: BigNumber): Promise<ContractTransaction> {
		return this.peakContract.redeem(this.poolId, amount);
	}

	async bBTCToSett(amount: BigNumber): Promise<BigNumber> {
		if (!this.referenceToken.poolId) {
			return ZERO;
		}
		const { provider } = this.store.wallet;
		const vault = VaultV1__factory.connect(this.referenceToken.address, provider);
		const { swap: swapAddress } = await this.peakContract.pools(this.referenceToken.poolId);
		const swapContract = BadgerPeakSwap__factory.connect(swapAddress, provider);

		const [settTokenPricePerFullShare, swapVirtualPrice] = await Promise.all([
			vault.getPricePerFullShare(),
			swapContract.get_virtual_price(),
		]);

		return amount.mul(1e36).div(settTokenPricePerFullShare).div(swapVirtualPrice);
	}
}
