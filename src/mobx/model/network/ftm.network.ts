import { NETWORK_IDS } from 'config/constants';
import { toRecord } from 'web3/config/token-config';
import { Deploy } from 'web3/interface/deploy';
import { ProtocolTokens } from 'web3/interface/protocol-token';
import { BadgerVault } from '../vaults/badger-vault';
import { Network as NetworkModel } from './network';
import deploy from '../../../config/deployments/ftm.json';
import { Currency } from 'config/enums/currency.enum';
import { Network } from '@badger-dao/sdk';

export class Fantom extends NetworkModel {
	constructor() {
		super(
			'https://ftmscam.io/',
			'https://ftmscan.com/gastracker',
			'Fantom',
			Network.Fantom,
			NETWORK_IDS.FTM,
			Currency.FTM,
			FTM_DEPLOY,
			ftmVaults,
		);
	}
}

export const FTM_DEPLOY: Deploy = deploy;

export const ftmVaults: BadgerVault[] = [
	{
		depositToken: {
			address: FTM_DEPLOY.tokens['solidly.usdc-dai'],
			decimals: 18,
		},
		vaultToken: {
			address: FTM_DEPLOY.sett_system.vaults['native.usdc-dai'],
			decimals: 18,
		},
	},
];

const ftmTokens = ftmVaults.flatMap((vault) => [vault.depositToken, vault.vaultToken]);

export const ftmProtocolTokens: ProtocolTokens = toRecord(ftmTokens, 'address');
