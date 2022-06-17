import { Network } from '@badger-dao/sdk';
import { NETWORK_IDS } from 'config/constants';
import { Currency } from 'config/enums/currency.enum';
import { toRecord } from 'web3/config/token-config';
import { Deploy } from 'web3/interface/deploy';
import { ProtocolTokens } from 'web3/interface/protocol-token';

import deploy from '../../../config/deployments/avalanche.json';
import { BadgerVault } from '../vaults/badger-vault';
import { Network as NetworkModel } from './network';

export class Avalanche extends NetworkModel {
	constructor() {
		super(
			'https://snowtrace.io/',
			'https://snowtrace.io/gastracker',
			'Avalanche',
			Network.Avalanche,
			NETWORK_IDS.AVAX,
			Currency.AVAX,
			AVAX_DEPLOY,
			avaxVaults,
		);
	}
}

export const AVAX_DEPLOY: Deploy = deploy;

export const avaxVaults: BadgerVault[] = [
	{
		depositToken: {
			address: AVAX_DEPLOY.tokens['WBTC'],
			decimals: 18,
		},
		vaultToken: {
			address: AVAX_DEPLOY.sett_system.vaults['BWBTC'],
			decimals: 18,
		},
	},
];

const avaxTokens = avaxVaults.flatMap((vault) => [vault.depositToken, vault.vaultToken]);

export const avaxProtocolTokens: ProtocolTokens = toRecord(avaxTokens, 'address');
