import { IbbtcVaultPeak } from './model/vaults/ibbtc-vault-peak';
import { RootStore } from './store';
import addresses from 'config/ibBTC/addresses.json';
import { ZapPeak } from './model/vaults/zap-peak';
import { YearnPeak } from './model/vaults/yearn-peak';
import { BadgerPeak } from './model/vaults/badger-peak';
import { IbbtcOptionToken } from './model/tokens/ibbtc-option-token';

export class IbbtcVaultPeakFactory {
	static createIbbtcVaultPeakForToken(store: RootStore, token: IbbtcOptionToken): IbbtcVaultPeak {
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
