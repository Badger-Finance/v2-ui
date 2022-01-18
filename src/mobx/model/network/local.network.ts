import { NETWORK_IDS } from 'config/constants';
import { toVaultConfig } from 'web3/config/config-utils';
import { Deploy } from 'web3/interface/deploy';
import { BadgerVault } from '../vaults/badger-vault';
import { Network as NetworkModel } from './network';
import deploy from '../../../config/deployments/local.json';
import { toRecord } from 'web3/config/token-config';
import { ProtocolTokens } from 'web3/interface/protocol-token';
import { Currency } from 'config/enums/currency.enum';
import { Network } from '@badger-dao/sdk';

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
			localaultDefinitions,
		);
	}
	get settOrder(): string[] {
		return [];
	}
}

export const LOCAL_DEPLOY = deploy as Deploy;

const localaultDefinitions: BadgerVault[] = [];

export const localaults = toVaultConfig(localaultDefinitions);

export const localRewards = [
	{
		address: LOCAL_DEPLOY.tokens.test,
		decimals: 8,
	},
];

const localTokens = localaults.flatMap((vault) => [vault.depositToken, vault.vaultToken]).concat(localRewards);

export const localProtocolTokens: ProtocolTokens = toRecord(localTokens, 'address');
