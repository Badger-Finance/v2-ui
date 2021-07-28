import { NETWORK_IDS, NETWORK_LIST } from 'config/constants';
import { toRecord } from 'web3/config/token-config';
import { Deploy } from 'web3/interface/deploy';
import { ProtocolTokens } from 'web3/interface/protocol-token';
import { GasPrices } from '../system-config/gas-prices';
import { BadgerSett } from '../vaults/badger-sett';
import { Network } from './network';
import deploy from '../../../config/deployments/xdai.json';

export class xDai extends Network {
	constructor() {
		super(
			'https://blockscout.com/xdai/mainnet/',
			'xDai',
			NETWORK_LIST.XDAI,
			NETWORK_IDS.XDAI,
			'XDAI',
			XDAI_DEPLOY,
			xDaiSetts,
		);
	}

	async updateGasPrices(): Promise<GasPrices> {
		return { rapid: 10, fast: 5, standard: 2, slow: 1 };
	}
}

export const XDAI_DEPLOY: Deploy = deploy;

export const xDaiSetts: BadgerSett[] = [
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

const xDaiTokens = xDaiSetts.flatMap((sett) => [sett.depositToken, sett.vaultToken]);

export const xDaiProtocolTokens: ProtocolTokens = toRecord(xDaiTokens, 'address');
