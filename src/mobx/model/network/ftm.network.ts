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
			'https://ftmscan.com',
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
			address: FTM_DEPLOY.tokens['solidly.boo-xboo'],
			decimals: 18,
		},
		vaultToken: {
			address: FTM_DEPLOY.sett_system.vaults['native.boo-xboo'],
			decimals: 18,
		},
	},
	{
		depositToken: {
			address: FTM_DEPLOY.tokens['solidly.wbtc-renbtc'],
			decimals: 18,
		},
		vaultToken: {
			address: FTM_DEPLOY.sett_system.vaults['native.wbtc-renbtc'],
			decimals: 18,
		},
	},
	{
		depositToken: {
			address: FTM_DEPLOY.tokens['solidly.wftm-sex'],
			decimals: 18,
		},
		vaultToken: {
			address: FTM_DEPLOY.sett_system.vaults['native.wftm-sex'],
			decimals: 18,
		},
	},
	{
		depositToken: {
			address: FTM_DEPLOY.tokens['solidly.solid-solidsex'],
			decimals: 18,
		},
		vaultToken: {
			address: FTM_DEPLOY.sett_system.vaults['native.solid-solidsex'],
			decimals: 18,
		},
	},
	{
		depositToken: {
			address: FTM_DEPLOY.tokens['solidly.weve-usdc'],
			decimals: 18,
		},
		vaultToken: {
			address: FTM_DEPLOY.sett_system.vaults['native.weve-usdc'],
			decimals: 18,
		},
	},
];

const ftmTokens = ftmVaults.flatMap((vault) => [vault.depositToken, vault.vaultToken]);

export const ftmProtocolTokens: ProtocolTokens = toRecord(ftmTokens, 'address');
