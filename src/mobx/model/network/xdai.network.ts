import { NETWORK_IDS } from 'config/constants';
import { toRecord } from 'web3/config/token-config';
import { Deploy } from 'web3/interface/deploy';
import { ProtocolTokens } from 'web3/interface/protocol-token';
import { BadgerVault } from '../vaults/badger-vault';
import { Network as NetworkModel } from './network';
import deploy from '../../../config/deployments/xdai.json';
import { Currency } from 'config/enums/currency.enum';
import { Network } from '@badger-dao/sdk';

export class xDai extends NetworkModel {
	constructor() {
		super(
			'https://blockscout.com/xdai/mainnet/',
			'https://blockscout.com/xdai/mainnet/',
			'xDai',
			Network.xDai,
			NETWORK_IDS.XDAI,
			Currency.XDAI,
			XDAI_DEPLOY,
			xDaiVaults,
		);
	}
}

export const XDAI_DEPLOY: Deploy = deploy;

export const xDaiVaults: BadgerVault[] = [
	{
		depositToken: {
			address: XDAI_DEPLOY.tokens['SLP-WBTC-WETH'],
			decimals: 18,
		},
		vaultToken: {
			address: XDAI_DEPLOY.sett_system.vaults['BSLP-WBTC-WETH'],
			decimals: 18,
		},
	},
];

const xDaiTokens = xDaiVaults.flatMap((vault) => [vault.depositToken, vault.vaultToken]);

export const xDaiProtocolTokens: ProtocolTokens = toRecord(xDaiTokens, 'address');
