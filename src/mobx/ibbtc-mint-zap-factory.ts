import { IbBTCMintZap } from './model/vaults/ibbtc-mint-zap';
import { RootStore } from './RootStore';
import addresses from 'config/ibBTC/addresses.json';
import { TokenZap } from './model/vaults/token-zap';
import { GeneralVaultZap } from './model/vaults/general-vault-zap';
import { RenVaultZap } from './model/vaults/ren-vault-zap';
import { IbbtcOptionToken } from './model/tokens/ibbtc-option-token';

export class IbBTCMintZapFactory {
	private static tokenZap?: TokenZap;
	private static generalVaultZap?: GeneralVaultZap;
	private static renVaultZap?: RenVaultZap;

	static getIbBTCZap(store: RootStore, token: IbbtcOptionToken): IbBTCMintZap {
		if (addresses.mainnet.contracts.TokenZap.supportedTokens.includes(token.symbol)) {
			if (!this.tokenZap) {
				this.tokenZap = new TokenZap(store, token);
			}
			console.log('Using TokenZap');
			return this.tokenZap;
		}

		if (addresses.mainnet.contracts.GeneralVaultZap.supportedTokens.includes(token.symbol)) {
			if (!this.generalVaultZap) {
				this.generalVaultZap = new GeneralVaultZap(store, token);
			}
			console.log('Using GeneralVaultZap');
			return this.generalVaultZap;
		}

		if (addresses.mainnet.contracts.RenVaultZap.supportedTokens.includes(token.symbol)) {
			if (!this.renVaultZap) {
				this.renVaultZap = new RenVaultZap(store, token);
			}
			console.log('Using RenVaultZap');
			return this.renVaultZap;
		}

		throw new Error(`Unrecognized peak type for token => ${token.symbol}`);
	}
}
