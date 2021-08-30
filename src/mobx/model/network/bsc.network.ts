import { NETWORK_IDS, NETWORK_LIST } from 'config/constants';
import { GasPrices } from '../system-config/gas-prices';
import { Network } from './network';
import deploy from '../../../config/deployments/bsc.json';
import { ProtocolTokens } from 'web3/interface/protocol-token';
import { toRecord } from 'web3/config/token-config';
import { Deploy } from 'web3/interface/deploy';
import { BadgerSett } from '../vaults/badger-sett';

export class BinanceSmartChain extends Network {
	constructor() {
		super(
			'https://bscscan.com',
			'Binance Smart Chain',
			NETWORK_LIST.BSC,
			NETWORK_IDS.BSC,
			'BNB',
			BSC_DEPLOY,
			bscSetts,
		);
	}

	async updateGasPrices(): Promise<GasPrices> {
		const prices = await fetch('https://bscgas.info/gas');
		const result = await prices.json();
		return {
			rapid: result['instant'],
			fast: result['fast'],
			standard: result['standard'],
			slow: result['slow'],
		};
	}
}

export const BSC_DEPLOY: Deploy = deploy;

export const bscSetts: BadgerSett[] = [
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

const bscTokens = bscSetts.flatMap((sett) => [sett.depositToken, sett.vaultToken]);

export const bscProtocolTokens: ProtocolTokens = toRecord(bscTokens, 'address');
