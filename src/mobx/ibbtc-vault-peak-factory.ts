import { IbbtcVaultPeak } from './model/ibbtc-vault-peak';
import { TokenModel } from './model';
import { RootStore } from './store';
import addresses from 'config/ibBTC/addresses.json';
import { ZapPeak } from './model/zap-peak';
import { YearnPeak } from './model/yearn-peak';
import { BadgerPeak } from './model/badger-peak';

export class IbbtcVaultPeakFactory {
	static createIbbtcVaultPeakForToken(store: RootStore, token: TokenModel): IbbtcVaultPeak {
		if (addresses.mainnet.contracts.ZapPeak.supportedTokens.includes(token.symbol)) {
			return new ZapPeak(store, token);
		}

		if (addresses.mainnet.contracts.yearnWBTCPeak.supportedTokens.includes(token.symbol)) {
			return new YearnPeak(store, token);
		}

		if (addresses.mainnet.contracts.BadgerSettPeak.supportedTokens.includes(token.symbol)) {
			return new BadgerPeak(store, token);
		}

		throw new Error(`Unrecognized peak type for token => ${token.symbol}`);
	}
}
