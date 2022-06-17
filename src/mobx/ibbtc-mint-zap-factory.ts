import { Token } from '@badger-dao/sdk';
import addresses from 'config/ibBTC/addresses.json';

import { GeneralVaultZap } from './model/vaults/general-vault-zap';
import { IbBTCMintZap } from './model/vaults/ibbtc-mint-zap';
import { RenVaultZap } from './model/vaults/ren-vault-zap';
import { TokenZap } from './model/vaults/token-zap';

export class IbBTCMintZapFactory {
	private static tokenZaps: Record<string, TokenZap> = {};
	private static generalVaultZaps: Record<string, GeneralVaultZap> = {};
	private static renVaultZaps: Record<string, RenVaultZap> = {};

	static getIbBTCZap(token: Token): IbBTCMintZap {
		if (addresses.mainnet.contracts.TokenZap.supportedTokens.includes(token.address)) {
			if (!this.tokenZaps[token.address]) {
				this.tokenZaps[token.address] = new TokenZap();
			}
			return this.tokenZaps[token.address];
		}

		if (addresses.mainnet.contracts.GeneralVaultZap.supportedTokens.includes(token.address)) {
			if (!this.generalVaultZaps[token.address]) {
				this.generalVaultZaps[token.address] = new GeneralVaultZap();
			}
			return this.generalVaultZaps[token.address];
		}

		if (addresses.mainnet.contracts.RenVaultZap.supportedTokens.includes(token.address)) {
			if (!this.renVaultZaps[token.address]) {
				this.renVaultZaps[token.address] = new RenVaultZap();
			}
			return this.renVaultZaps[token.address];
		}

		throw new Error(`Unrecognized peak type for token => ${token.symbol}`);
	}
}
