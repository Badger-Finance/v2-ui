import { IbBTCMintZap } from './model/vaults/ibbtc-mint-zap';
import { RootStore } from './RootStore';
import addresses from 'config/ibBTC/addresses.json';
import { TokenZap } from './model/vaults/token-zap';
import { GeneralVaultZap } from './model/vaults/general-vault-zap';
import { RenVaultZap } from './model/vaults/ren-vault-zap';
import { IbbtcOptionToken } from './model/tokens/ibbtc-option-token';

export class IbBTCMintZapFactory {
	private static tokenZaps: Record<string, TokenZap> = {};
	private static generalVaultZaps: Record<string, GeneralVaultZap> = {};
	private static renVaultZaps: Record<string, RenVaultZap> = {};

	static getIbBTCZap(store: RootStore, token: IbbtcOptionToken): IbBTCMintZap {
		if (addresses.mainnet.contracts.TokenZap.supportedTokens.includes(token.symbol)) {
			if (!this.tokenZaps[token.address]) {
				this.tokenZaps[token.address] = new TokenZap(store, token);
			}
			return this.tokenZaps[token.address];
		}

		if (addresses.mainnet.contracts.GeneralVaultZap.supportedTokens.includes(token.symbol)) {
			if (!this.generalVaultZaps[token.address]) {
				this.generalVaultZaps[token.address] = new GeneralVaultZap(store, token);
			}
			return this.generalVaultZaps[token.address];
		}

		if (addresses.mainnet.contracts.RenVaultZap.supportedTokens.includes(token.symbol)) {
			if (!this.renVaultZaps[token.address]) {
				this.renVaultZaps[token.address] = new RenVaultZap(store, token);
			}
			return this.renVaultZaps[token.address];
		}

		throw new Error(`Unrecognized peak type for token => ${token.symbol}`);
	}
}
