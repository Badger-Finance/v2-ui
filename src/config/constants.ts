import Web3 from 'web3';
import BigNumber from 'bignumber.js';
import importedErc20 from '../config/system/abis/ERC20.json';
import importedSett from '../config/system/abis/Sett.json';
import importedGeyser from '../config/system/abis/BadgerGeyser.json';
import importedBscErc20 from '../config/system/abis/BscErc20.json';
import importedYearnSett from '../config/system/abis/YearnWrapper.json';
import importedGuestList from '../config/system/abis/GuestList.json';
import { AbiItem } from 'web3-utils';
import { PartialAttemptOptions } from '@lifeomic/attempt';
import { BurnAndReleaseStatus } from '@renproject/ren/build/main/burnAndRelease';
import { DepositStatus } from '@renproject/ren/build/main/lockAndMint';
import { Wallets } from './enums/wallets.enum';
import { Network } from '@badger-dao/sdk';
import { Currency } from './enums/currency.enum';

/* App Configurations */

export const DEFAULT_CURRENCY = Currency.USD;
export const MAX_LAYOUT_WIDTH = 1024;
export const DEFAULT_NETWORK = Network.Ethereum;

export const burnStatusDict: Record<BurnAndReleaseStatus, string> = {
	pending: 'Transaction Pending.',
	burned: 'Tokens Burned.',
	released: 'Tokens Released.',
	reverted: 'Transaction Reverted.',
};

export const burnStatusIndex: Record<BurnAndReleaseStatus, number> = {
	pending: 0,
	burned: 1,
	released: 2,
	reverted: 3,
};

export const depositStatusDict: Record<DepositStatus, string> = {
	detected: 'Transaction Detected.',
	confirmed: 'Transaction Confirmed.',
	signed: 'Transaction Signed.',
	reverted: 'Transaction Reverted.',
	submitted: 'Transaction Submitted.',
};

export const RPC_WALLETS: { [index: string]: boolean } = {
	[Wallets.Ledger]: true,
	[Wallets.WalletConnect]: true,
	[Wallets.WalletLink]: true,
	[Wallets.Trezor]: true,
	[Wallets.Portis]: true,
	[Wallets.CoinbaseWallet]: true,
};

export enum NETWORK_IDS {
	ETH = 1,
	BSC = 56,
	MATIC = 137,
	XDAI = 100,
	ARB = 42161,
}

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
export const SITE_VERSION = 'v2.9.9';
export const WC_BRIDGE = 'https://wc-bridge.badger.finance/';
export const REN_FEES_ENDPOINT = 'https://lightnode-mainnet.herokuapp.com/ren_queryBlockState';
export const BLOCKNATIVE_API_KEY = 'af74a87b-cd08-4f45-83ff-ade6b3859a07';

export const ZERO = new BigNumber(0);
export const TEN = new BigNumber(10);
export const MAX = Web3.utils.toTwosComplement(-1);
export const MAX_FEE = 1e4;

export const CURVE_WBTC_RENBTC_TRADING_PAIR_ADDRESS = '0x93054188d876f558f4a66B2EF1d97d16eDf0895B';
export const RENVM_GATEWAY_ADDRESS = '0xe4b679400F0f267212D5D812B95f58C83243EE71';
export const RENVM_NETWORK = 'mainnet';
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
export const ESTIMATED_REWARDS_FREQUENCY = process.env.REACT_APP_REWARDS_FREQUENCY || 2; // in hours
