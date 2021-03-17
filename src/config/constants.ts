import Web3 from 'web3';
import BigNumber from 'bignumber.js';
import importedErc20 from '../config/system/abis/ERC20.json';
import { getNetworkDeploy } from '../mobx/utils/web3';
import { token as BADGER_ADDRESS, digg_system, sett_system } from './deployments/mainnet.json';
import { NetworkConstants, ClaimsSymbols } from '../mobx/model';

export enum NETWORK_LIST {
	BSC = 'bsc',
	MATIC = 'matic',
	FTM = 'ftm',
	XDAI = 'xdai',
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
		TOKENS: {
			WBTC_ADDRESS: '0x2260fac5e5542a773aa44fbcfedf7c193bc2c599',
			WBTC_ADDRESS_LOWER: '0x2260fac5e5542a773aa44fbcfedf7c193bc2c599',
			XSUSHI_ADDRESS: '0x8798249c2e607446efb7ad49ec89dd1865ff4272',
			FARM_ADDRESS: '0xa0246c9032bC3A600820415aE600c6388619A14D',
			USDC_ADDRESS: '0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48',
			RENBTC_ADDRESS: '0xEB4C2781e4ebA804CE9a9803C67d0893436bB27D',
			BADGER_ADDRESS: BADGER_ADDRESS,
			DIGG_ADDRESS: digg_system['uFragments'],
			BBADGER_ADDRESS: sett_system.vaults['native.badger'],
			BDIGG_ADDRESS: sett_system.vaults['native.digg'],
		},
		START_BLOCK: 11381216,
		START_TIME: new Date('Dec 03 2020 06:11:35 PM UTC'),
		DEPLOY: getNetworkDeploy(NETWORK_LIST.ETH),
	},
	[NETWORK_LIST.BSC]: {
		APP_URL: 'https://bsc.badger.finance/',
		// TODO: Update this with a more reliable node
		RPC_URL: 'https://bsc.red/',
		TOKENS: {},
		START_BLOCK: 11381216,
		START_TIME: new Date('Dec 03 2020 06:11:35 PM UTC'),
		DEPLOY: getNetworkDeploy(NETWORK_LIST.BSC),
	},
};

export const CLAIMS_SYMBOLS: ClaimsSymbols = {
	[NETWORK_LIST.ETH]: {
		[NETWORK_CONSTANTS[NETWORK_LIST.ETH].TOKENS.FARM_ADDRESS.toLowerCase()]: 'Farm',
		[NETWORK_CONSTANTS[NETWORK_LIST.ETH].TOKENS.XSUSHI_ADDRESS.toLowerCase()]: 'xSushi',
		[NETWORK_CONSTANTS[NETWORK_LIST.ETH].TOKENS.USDC_ADDRESS.toLowerCase()]: 'USDC',
		[NETWORK_CONSTANTS[NETWORK_LIST.ETH].TOKENS.BADGER_ADDRESS.toLowerCase()]: 'Badger',
		[NETWORK_CONSTANTS[NETWORK_LIST.ETH].TOKENS.DIGG_ADDRESS.toLowerCase()]: 'Digg',
		[NETWORK_CONSTANTS[NETWORK_LIST.ETH].TOKENS.BBADGER_ADDRESS.toLowerCase()]: 'bBadger',
		[NETWORK_CONSTANTS[NETWORK_LIST.ETH].TOKENS.BDIGG_ADDRESS.toLowerCase()]: 'bDigg',
	},
};

export const CONTACT_EMAIL = 'hello@badger.finance';
export const ERC20 = importedErc20;
export const APP_NAME = 'badgerDAO';
export const PORTIS_APP_ID = 'cbf7534d-170d-4903-943f-e607dc588b7f';
export const EMPTY_DATA = '0x';
export const ZERO_CURRENCY = '0.00000';
export const SITE_VERSION = 'v2.5.0';
export const WC_BRIDGE = 'https://wc-bridge.badger.finance/';
const toBool = (val: string | undefined): boolean => (val ? val === 'true' : false);
export const FLAGS = {
	IBBTC_FLAG: toBool(process.env.REACT_APP_IBBTC_FLAG),
	BRIDGE_FLAG: toBool(process.env.REACT_APP_BRIDGE_FLAG),
};
export const ZERO = new BigNumber(0);
export const TEN = new BigNumber(10);
export const MAX = Web3.utils.toTwosComplement(-1);
export const BADGER_ADAPTER = require('config/system/abis/BadgerAdapter.json');
export const CURVE_EXCHANGE = require('config/system/abis/CurveExchange.json');
export const BTC_GATEWAY = require('config/system/abis/BtcGateway.json');

export const CURVE_WBTC_RENBTC_TRADING_PAIR_ADDRESS = '0x93054188d876f558f4a66B2EF1d97d16eDf0895B';
export const RENVM_GATEWAY_ADDRESS = '0xe4b679400F0f267212D5D812B95f58C83243EE71';
