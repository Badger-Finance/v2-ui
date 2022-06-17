import { Currency, Network } from '@badger-dao/sdk';
import { NETWORK_IDS } from 'config/constants';
import { toRecord } from 'web3/config/token-config';
import { Deploy } from 'web3/interface/deploy';
import { ProtocolTokens } from 'web3/interface/protocol-token';

import deploy from '../../../config/deployments/local.json';
import { BadgerVault } from '../vaults/badger-vault';
import { Network as NetworkModel } from './network';

export class Local extends NetworkModel {
	constructor() {
		super(
			'https://etherscan.io',
			'https://www.gasnow.org/',
			'Local',
			Network.Local,
			NETWORK_IDS.LOCAL,
			Currency.ETH,
			LOCAL_DEPLOY,
			localVaultDefinitions,
		);
	}

	get settOrder(): string[] {
		return [];
	}
}

export const LOCAL_DEPLOY = deploy as Deploy;

const localVaultDefinitions: BadgerVault[] = [];

export const localVaults = localVaultDefinitions;

export const localRewards = [
	{
		address: LOCAL_DEPLOY.tokens.test,
		decimals: 18,
	},
];

const localTokens = localVaults.flatMap((vault) => [vault.depositToken, vault.vaultToken]).concat(localRewards);

export const localProtocolTokens: ProtocolTokens = toRecord(localTokens, 'address');
