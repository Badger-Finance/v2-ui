import Web3 from 'web3';
import BigNumber from 'bignumber.js';
import importedErc20 from '../config/system/abis/ERC20.json';
import importedBscErc20 from '../config/system/abis/BscErc20.json';
import { tokens, sett_system } from './deployments/mainnet.json';
import { NetworkConstants, ClaimsSymbols } from '../mobx/model';
import { getNetworkDeploy } from 'mobx/utils/network';

export enum NETWORK_LIST {
	BSC = 'bsc',
	// MATIC = 'matic',
	// FTM = 'ftm',
	// XDAI = 'xdai',
	ETH = 'eth',
}

export enum NETWORK_IDS {
	ETH = 1,
	BSC = 56,
	MATIC = 137,
	FTM = 250,
	XDAI = 100,
}

export const NETWORK_CONSTANTS: NetworkConstants = {
	[NETWORK_LIST.ETH]: {
		APP_URL: 'https://app.badger.finance/',
		RPC_URL: 'https://eth-mainnet.alchemyapi.io/v2/ZPhpI9buZLLAvjR44hryTAhiC5V-HueZ',
		START_BLOCK: 11381216,
		START_TIME: new Date('Dec 03 2020 06:11:35 PM UTC'),
		DEPLOY: getNetworkDeploy(NETWORK_LIST.ETH),
	},
	[NETWORK_LIST.BSC]: {
		APP_URL: 'https://bsc.badger.finance/',
		RPC_URL: 'https://bsc-node.badger.guru/',
		START_BLOCK: 11381216,
		START_TIME: new Date('Dec 03 2020 06:11:35 PM UTC'),
		DEPLOY: getNetworkDeploy(NETWORK_LIST.BSC),
	},
};

export const CLAIMS_SYMBOLS: ClaimsSymbols = {
	[NETWORK_LIST.BSC]: {},
	[NETWORK_LIST.ETH]: {
		[tokens.farm]: 'Farm',
		[tokens.xsushi]: 'xSushi',
		[tokens.usdc]: 'USDC',
		[tokens.badger]: 'Badger',
		[tokens.digg]: 'Digg',
		[sett_system.vaults['native.badger']]: 'bBadger',
		[sett_system.vaults['native.digg']]: 'bDigg',
	},
};

export const CONTACT_EMAIL = 'hello@badger.finance';
export const ERC20 = importedErc20;
export const BSC_ERC20 = importedBscErc20;
export const APP_NAME = 'badgerDAO';
export const PORTIS_APP_ID = 'cbf7534d-170d-4903-943f-e607dc588b7f';
export const EMPTY_DATA = '0x';
export const ZERO_CURRENCY = '0.00000';
export const SITE_VERSION = 'v2.5.3';
export const WC_BRIDGE = 'https://wc-bridge.badger.finance/';

const toBool = (val: string | undefined): boolean => (val ? val === 'true' : false);

export const FLAGS = {
	IBBTC_FLAG: toBool(process.env.REACT_APP_IBBTC_FLAG),
	BRIDGE_FLAG: toBool(process.env.REACT_APP_BRIDGE_FLAG),
	WBTC_FLAG: toBool(process.env.REACT_APP_BRIDGE_WBTC),
	GEYSER_FLAG: toBool(process.env.REACT_APP_GEYSER_ENABLED),
	EXPERIMENTAL_VAULTS: toBool(process.env.REACT_APP_EXPERIMENTAL_VAULTS),
};

export const ZERO = new BigNumber(0);
export const TEN = new BigNumber(10);
export const MAX = Web3.utils.toTwosComplement(-1);

export const CURVE_WBTC_RENBTC_TRADING_PAIR_ADDRESS = '0x93054188d876f558f4a66B2EF1d97d16eDf0895B';
export const RENVM_GATEWAY_ADDRESS = '0xe4b679400F0f267212D5D812B95f58C83243EE71';
export const RENVM_NETWORK = 'mainnet';
