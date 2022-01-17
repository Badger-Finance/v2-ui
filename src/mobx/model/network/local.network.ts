import { NETWORK_IDS } from 'config/constants';
import { toVaultConfig } from 'web3/config/config-utils';
import { Deploy } from 'web3/interface/deploy';
import { BadgerVault } from '../vaults/badger-vault';
import { Network as NetworkModel } from './network';
import deploy from '../../../config/deployments/mainnet.json';
import { toRecord } from 'web3/config/token-config';
import { ProtocolTokens } from 'web3/interface/protocol-token';
import { FLAGS } from 'config/environment';
import { Currency } from 'config/enums/currency.enum';
import { AdvisoryType } from '../vaults/advisory-type';
import { Network } from '@badger-dao/sdk';

export class Local extends NetworkModel {
	constructor() {
		super(
			'https://etherscan.io',
			'https://www.gasnow.org/',
			'Local',
			Network.Ethereum,
			NETWORK_IDS.LOCAL,
			Currency.ETH,
			ETH_DEPLOY,
			ethVaultDefinitions,
		);
	}
	get settOrder(): string[] {
		return [];
	}
}

export const ETH_DEPLOY = deploy as Deploy;

const ethVaultDefinitions: BadgerVault[] = [];

export const ethVaults = toVaultConfig(ethVaultDefinitions);

export const ethRewards = [];

const ethTokens = ethVaults.flatMap((vault) => [vault.depositToken, vault.vaultToken]).concat(ethRewards);

export const ethProtocolTokens: ProtocolTokens = toRecord(ethTokens, 'address');
