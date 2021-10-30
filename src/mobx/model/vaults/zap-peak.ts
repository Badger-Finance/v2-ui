import addresses from 'config/ibBTC/addresses.json';
import { IbbtcVaultPeak, PeakType } from './ibbtc-vault-peak';
import { RootStore } from '../../RootStore';
import { toHex } from '../../utils/helpers';
import { IbbtcOptionToken } from '../tokens/ibbtc-option-token';
import { ZapPeak__factory, ZapPeak as ZapPeakContract } from 'contracts';
import { BigNumber } from 'ethers';

export class ZapPeak implements IbbtcVaultPeak {
	private peakContract: ZapPeakContract;
	address: string;
	type: PeakType;
	referenceToken: IbbtcOptionToken;

	constructor(store: RootStore, referenceToken: IbbtcOptionToken) {
		this.address = addresses.mainnet.contracts.ZapPeak.address;
		this.peakContract = ZapPeak__factory.connect(this.address, store.wallet.provider);
		this.referenceToken = referenceToken;
		this.type = 'zap';
	}

	getCalcMintMethod(amount: BigNumber): ContractSendMethod {
		return this.peakContract.methods.calcMint(this.referenceToken.address, toHex(amount));
	}

	async getMintMethod(amount: BigNumber, slippage: BigNumber): Promise<ContractSendMethod> {
		const { poolId, idx, bBTC } = await this.getCalcMintMethod(amount).call();
		const slippagePercentage = new BigNumber(100).minus(slippage);
		const minOut = new BigNumber(bBTC).multipliedBy(slippagePercentage).dividedToIntegerBy(100);
		return this.peakContract.methods.mint(this.referenceToken.address, toHex(amount), poolId, idx, toHex(minOut));
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
