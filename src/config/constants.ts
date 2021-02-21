import importedErc20 from '../config/system/abis/ERC20.json';
import { token as BADGER_ADDRESS, digg_system, sett_system } from './deployments/mainnet.json';

export const INFURA_KEY = '32d16e34f8af476e9ef63b34ba2a16cc';
export const APP_URL = 'https://app.badger.finance/';
export const CONTACT_EMAIL = 'hello@badger.finance';
export const RPC_URL = 'https://eth-mainnet.alchemyapi.io/v2/ZPhpI9buZLLAvjR44hryTAhiC5V-HueZ';
export const APP_NAME = 'badgerDAO';
export const PORTIS_APP_ID = 'cbf7534d-170d-4903-943f-e607dc588b7f';

export const WBTC_ADDRESS = '0x2260fac5e5542a773aa44fbcfedf7c193bc2c599';
export const XSUSHI_ADDRESS = '0x8798249c2e607446efb7ad49ec89dd1865ff4272';
export const FARM_ADDRESS = '0xa0246c9032bC3A600820415aE600c6388619A14D';
export const USDC_ADDRESS = '0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48';
export const ERC20 = importedErc20;
export const START_BLOCK = 11381216;
export const START_TIME = new Date('Dec 03 2020 06:11:35 PM UTC');
export const EMPTY_DATA = '0x';
export const ZERO_CURRENCY = '0.00000';
export const CLAIMS_SYMBOLS = {
	[FARM_ADDRESS.toLowerCase()]: 'Farm',
	[XSUSHI_ADDRESS.toLowerCase()]: 'xSushi',
	[USDC_ADDRESS.toLowerCase()]: 'USDC',
	[BADGER_ADDRESS.toLowerCase()]: 'Badger',
	[digg_system['uFragments'].toLowerCase()]: 'Digg',
	[sett_system.vaults['native.badger'].toLowerCase()]: 'bBadger',
	[sett_system.vaults['native.digg'].toLowerCase()]: 'bDigg',
};

// export const MIN_ETH_BALANCE = new BigNumber(0.01 * 1e18);
