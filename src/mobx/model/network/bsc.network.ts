import { NETWORK_IDS } from 'config/constants';
import { Network as NetworkModel } from './network';
import deploy from '../../../config/deployments/bsc.json';
import { ProtocolTokens } from 'web3/interface/protocol-token';
import { toRecord } from 'web3/config/token-config';
import { Deploy } from 'web3/interface/deploy';
import { BadgerVault } from '../vaults/badger-vault';
import { Currency } from 'config/enums/currency.enum';
import { Network } from '@badger-dao/sdk';

export class BinanceSmartChain extends NetworkModel {
	constructor() {
		super(
			'https://bscscan.com',
			'https://bscscan.com/gastracker',
			'Binance Smart Chain',
			Network.BinanceSmartChain,
			NETWORK_IDS.BSC,
			Currency.BNB,
			BSC_DEPLOY,
			bscVaults,
		);
	}
}

export const BSC_DEPLOY: Deploy = deploy;

export const bscVaults: BadgerVault[] = [
	{
		depositToken: {
			address: BSC_DEPLOY.tokens['pancake.BTCB-BNB'],
			decimals: 18,
		},
		vaultToken: {
			address: BSC_DEPLOY.sett_system.vaults['native.pancakeBnbBtcb'],
			decimals: 18,
		},
	},
	{
		depositToken: {
			address: BSC_DEPLOY.tokens['pancake.bBADGER-BTCB'],
			decimals: 18,
		},
		vaultToken: {
			address: BSC_DEPLOY.sett_system.vaults['native.bBadgerBtcb'],
			decimals: 18,
		},
	},
	{
		depositToken: {
			address: BSC_DEPLOY.tokens['pancake.bDIGG-BTCB'],
			decimals: 18,
		},
		vaultToken: {
			address: BSC_DEPLOY.sett_system.vaults['native.bDiggBtcb'],
			decimals: 18,
		},
	},
];

const bscTokens = bscVaults.flatMap((vault) => [vault.depositToken, vault.vaultToken]);

export const bscProtocolTokens: ProtocolTokens = toRecord(bscTokens, 'address');
