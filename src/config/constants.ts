import Web3 from 'web3';
import BigNumber from 'bignumber.js';
import importedErc20 from '../config/system/abis/ERC20.json';
import importedSett from '../config/system/abis/Sett.json';
import importedGeyser from '../config/system/abis/BadgerGeyser.json';
import importedBscErc20 from '../config/system/abis/BscErc20.json';
import importedYearnSett from '../config/system/abis/YearnWrapper.json';
import importedGuestList from '../config/system/abis/GuestList.json';
import { tokens, sett_system } from './deployments/mainnet.json';
import { NetworkConstants, ClaimsSymbols, LeaderboardRank } from '../mobx/model';
import { getNetworkDeploy } from 'mobx/utils/network';
import { AbiItem } from 'web3-utils';
import { PartialAttemptOptions } from '@lifeomic/attempt';

export const RPC_WALLETS: { [index: string]: boolean } = {
	ledger: true,
	WalletConnect: true,
	walletLink: true,
	trezor: true,
	lattice: true,
};

export enum NETWORK_LIST {
	ETH = 'eth',
	BSC = 'bsc',
	// MATIC = 'matic',
	// FTM = 'ftm',
	// XDAI = 'xdai',
}

export enum NETWORK_IDS {
	ETH = 1,
	BSC = 56,
	// MATIC = 137,
	// FTM = 250,
	// XDAI = 100,
}

export const NETWORK_CONSTANTS: NetworkConstants = {
	[NETWORK_LIST.ETH]: {
		APP_URL: 'https://app.badger.finance/',
		RPC_URL: 'https://spring-delicate-paper.quiknode.pro/d1fafe068249a34a1b2c9dc4b36ad92fbcf9fb8c/',
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
		[tokens.defiDollar]: 'Defi Dollar',
		[sett_system.vaults['native.cvx']]: 'bCVX',
		[sett_system.vaults['native.cvxCrv']]: 'bcvxCRV',
	},
};

export const CONTACT_EMAIL = 'hello@badger.finance';
export const ERC20 = importedErc20;
export const ERC20_ABI = importedErc20.abi as AbiItem[];
export const SETT_ABI = importedSett.abi as AbiItem[];
export const YEARN_ABI = importedYearnSett.abi as AbiItem[];
export const GEYSER_ABI = importedGeyser.abi as AbiItem[];
export const GUEST_LIST_ABI = importedGuestList.abi as AbiItem[];
export const BSC_ERC20 = importedBscErc20;
export const APP_NAME = 'badgerDAO';
export const PORTIS_APP_ID = 'cbf7534d-170d-4903-943f-e607dc588b7f';
export const EMPTY_DATA = '0x';
export const ZERO_CURRENCY = '0.00000';
export const SITE_VERSION = 'v2.8.3';
export const WC_BRIDGE = 'https://wc-bridge.badger.finance/';

const toBool = (val: string | undefined): boolean => (val ? val.toLowerCase() === 'true' : false);

export const FLAGS = {
	WBTC_FLAG: toBool(process.env.REACT_APP_BRIDGE_WBTC),
	GEYSER_FLAG: toBool(process.env.REACT_APP_GEYSER_ENABLED),
	BOOST_V2: toBool(process.env.REACT_APP_BOOST_V2),
	IBBTC_OPTIONS_FLAG: toBool(process.env.REACT_APP_IBBTC_OPTIONS_FLAG),
	STABILIZATION_SETTS: toBool(process.env.REACT_APP_STABILIZATION_SETTS),
	BOOST_OPTIMIZER: toBool(process.env.REACT_APP_BOOST_OPTIMIZER),
};

export const ZERO = new BigNumber(0);
export const TEN = new BigNumber(10);
export const MAX = Web3.utils.toTwosComplement(-1);

export const CURVE_WBTC_RENBTC_TRADING_PAIR_ADDRESS = '0x93054188d876f558f4a66B2EF1d97d16eDf0895B';
export const RENVM_GATEWAY_ADDRESS = '0xe4b679400F0f267212D5D812B95f58C83243EE71';
export const RENVM_NETWORK = 'mainnet';
export const DEBUG = process.env.NODE_ENV !== 'production';
export const ZERO_ADDR = '0x0000000000000000000000000000000000000000';

// time constants
export const ONE_MIN_MS = 60 * 1000;
export const baseRetryOptions = {
	// delay defaults to 200 ms.
	// delay grows exponentially by factor each attempt.
	factor: 1.5,
	// delay grows up until max delay.
	maxDelay: 1000,
	// maxAttempts to make before giving up.
	maxAttempts: 3,
};
export const defaultRetryOptions: PartialAttemptOptions<void> = baseRetryOptions;
export const getDefaultRetryOptions = <T>(): PartialAttemptOptions<T> => baseRetryOptions;

export const LEADERBOARD_RANKS: LeaderboardRank[] = [
	{
		name: 'Frenzy Badger',
		boostRangeStart: 2.6,
		boostRangeEnd: 3,
	},
	{
		name: 'Hyper Badger',
		boostRangeStart: 2.2,
		boostRangeEnd: 2.6,
	},
	{
		name: 'Hero Badger',
		boostRangeStart: 1.8,
		boostRangeEnd: 2.2,
	},
	{
		name: 'Neo Badger',
		boostRangeStart: 1.4,
		boostRangeEnd: 1.8,
	},
	{
		name: 'Basic Badger',
		boostRangeStart: 1,
		boostRangeEnd: 1.4,
	},
];
