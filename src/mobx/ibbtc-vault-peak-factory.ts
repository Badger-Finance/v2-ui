import { IbBTCMintZap } from './model/vaults/ibbtc-mint-zap';
import { RootStore } from './RootStore';
import addresses from 'config/ibBTC/addresses.json';
import { TokenZap } from './model/vaults/token-zap';
import { GeneralVaultZap } from './model/vaults/general-vault-zap';
import { RenVaultZap } from './model/vaults/ren-vault-zap';
import { IbbtcOptionToken } from './model/tokens/ibbtc-option-token';

export class IbbtcVaultPeakFactory {
	private static tokenZap?: TokenZap;
	private static generalVaultZap?: GeneralVaultZap;
	private static renVaultZap?: RenVaultZap;

	static createIbbtcVaultPeakForToken(store: RootStore, token: IbbtcOptionToken): IbBTCMintZap {
		if (addresses.mainnet.contracts.TokenZap.supportedTokens.includes(token.symbol)) {
			if (!this.tokenZap) {
				this.tokenZap = new TokenZap(store, token);
			}
			return this.tokenZap;
		}

		if (addresses.mainnet.contracts.GeneralVaultZap.supportedTokens.includes(token.symbol)) {
			if (!this.generalVaultZap) {
				this.generalVaultZap = new GeneralVaultZap(store, token);
			}
			return this.generalVaultZap;
		}

		if (addresses.mainnet.contracts.RenVaultZap.supportedTokens.includes(token.symbol)) {
			if (!this.renVaultZap) {
				this.renVaultZap = new RenVaultZap(store, token);
			}
			return this.renVaultZap;
		}

		throw new Error(`Unrecognized peak type for token => ${token.symbol}`);
	}
}
