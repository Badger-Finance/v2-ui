import addresses from 'config/ibBTC/addresses.json';
import { IbbtcVaultPeak, MintResult, PeakType, RedeemResult } from './ibbtc-vault-peak';
import { RootStore } from '../../RootStore';
import { IbbtcOptionToken } from '../tokens/ibbtc-option-token';
import { ZapPeak__factory, ZapPeak as ZapPeakContract } from 'contracts';
import { BigNumber, ContractTransaction } from 'ethers';

export class ZapPeak implements IbbtcVaultPeak {
	private peakContract: ZapPeakContract;
	readonly address: string;
	readonly type: PeakType;
	readonly referenceToken: IbbtcOptionToken;

	constructor(store: RootStore, referenceToken: IbbtcOptionToken) {
		this.address = addresses.mainnet.contracts.ZapPeak.address;
		this.referenceToken = referenceToken;
		this.type = PeakType.Zap;
		this.peakContract = ZapPeak__factory.connect(this.address, store.wallet.provider);
	}

	async calculateMint(amount: BigNumber): Promise<MintResult> {
		return this.peakContract.calcMint(this.referenceToken.address, amount);
	}

	async mint(amount: BigNumber, slippage: BigNumber): Promise<ContractTransaction> {
		const { poolId, idx, bBTC } = await this.calculateMint(amount);
		const slippagePercentage = BigNumber.from(100).sub(slippage);
		const minOut = bBTC.mul(slippagePercentage).div(100);
		return this.peakContract.mint(this.referenceToken.address, amount, poolId!, idx!, minOut);
	}

	async calculateRedeem(_amount: BigNumber): Promise<RedeemResult> {
		throw new Error('Calc Redeem not available on the Zap Peak');
	}

	async redeem(): Promise<ContractTransaction> {
		throw new Error('Redeem not available on the Zap Peak');
	}

	async bBTCToSett(): Promise<BigNumber> {
		throw new Error('bBTC to Sett not available on the Zap Peak');
	}
}
