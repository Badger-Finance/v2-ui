import { NETWORK_IDS } from 'config/constants';
import { toRecord } from 'web3/config/token-config';
import { Deploy } from 'web3/interface/deploy';
import { ProtocolTokens } from 'web3/interface/protocol-token';
import { GasPrices } from '../system-config/gas-prices';
import { BadgerSett } from '../vaults/badger-sett';
import { Network } from './network';
import deploy from '../../../config/deployments/xdai.json';
import { ChainNetwork } from 'config/enums/chain-network.enum';
import { Currency } from 'config/enums/currency.enum';

export class xDai extends Network {
	constructor() {
		super(
			'https://blockscout.com/xdai/mainnet/',
			'https://blockscout.com/xdai/mainnet/',
			'xDai',
			ChainNetwork.xDai,
			NETWORK_IDS.XDAI,
			Currency.XDAI,
			XDAI_DEPLOY,
			xDaiSetts,
		);
	}

	async updateGasPrices(): Promise<GasPrices> {
		const prices = await fetch('https://blockscout.com/xdai/mainnet/api/v1/gas-price-oracle');
		const result = await prices.json();
		return {
			fast: result['fast'],
			average: result['average'],
			slow: result['slow'],
		};
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
