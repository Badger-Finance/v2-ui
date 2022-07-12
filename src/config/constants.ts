import { Network } from '@badger-dao/sdk';
import { BigNumber, ethers } from 'ethers';

import { Wallets } from './enums/wallets.enum';

/* App Configurations */

export const TOOLTIP_LEAVE_TOUCH_DELAY = 1500;
export const MAX_LAYOUT_WIDTH = 1183; // 1135px (width on mocks) + 24px of padding on each side
export const DEFAULT_NETWORK = Network.Ethereum;

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
  LOCAL = 1337,
  BSC = 56,
  MATIC = 137,
  ARB = 42161,
  AVAX = 43114,
  FTM = 250,
}

export const NETWORK_IDS_TO_NAMES = {
  [NETWORK_IDS.ETH]: Network.Ethereum,
  [NETWORK_IDS.LOCAL]: Network.Local,
  [NETWORK_IDS.BSC]: Network.BinanceSmartChain,
  [NETWORK_IDS.MATIC]: Network.Polygon,
  [NETWORK_IDS.ARB]: Network.Arbitrum,
  [NETWORK_IDS.AVAX]: Network.Avalanche,
  [NETWORK_IDS.FTM]: Network.Fantom,
};

export const CONTACT_EMAIL = 'hello@badger.finance';

export const APP_NAME = 'BadgerDAO App';
export const PORTIS_APP_ID = 'cbf7534d-170d-4903-943f-e607dc588b7f';
export const EMPTY_DATA = '0x';
export const ZERO_CURRENCY = '0.00000';
// https://semver.org/#is-v123-a-semantic-version
export const SITE_VERSION = '2.17.0';
export const BLOCKNATIVE_API_KEY = process.env.REACT_APP_BLOCKNATIVE_API_KEY;

export const ZERO = ethers.constants.Zero;
export const TEN = BigNumber.from(10);
export const MAX_FEE = 1e4;
export const MAX = ethers.constants.MaxUint256;
export const METAMASK_REJECTED__SIGNATURE_ERROR_CODE = 4001;

export const CURVE_WBTC_RENBTC_TRADING_PAIR_ADDRESS = '0x93054188d876f558f4a66B2EF1d97d16eDf0895B';

// time constants
export const ONE_MIN_MS = 60 * 1000;
export const ONE_HOUR_MS = ONE_MIN_MS * 60;
export const ONE_DAY_MS = ONE_HOUR_MS * 24;

export const ESTIMATED_REWARDS_FREQUENCY = process.env.REACT_APP_REWARDS_FREQUENCY || 2; // in hours

// App Notification Constants

// https://stackoverflow.com/questions/7616461/generate-a-hash-from-string-in-javascript
function stringHash(input?: string): string | undefined {
  if (!input) {
    return;
  }
  let hash = 0,
    i,
    chr;
  if (input.length === 0) return hash.toString();
  for (i = 0; i < input.length; i++) {
    chr = input.charCodeAt(i);
    hash = (hash << 5) - hash + chr;
    hash |= 0; // Convert to 32bit integer
  }
  return hash.toString();
}

// Message should be defined or explicitly undefined.
export const APP_NEWS_MESSAGE = 'Limited Time Bootstrapping emissions on  graviAURA: ';
// Text & URL should be defined or explicitly undefined.
export const APP_NEWS_URL_TEXT = 'Learn More';
export const APP_NEWS_URL = 'https://badger.com/gravity-news/graviaura-bootstrapping';
export const APP_NEWS_STORAGE_HASH = stringHash(APP_NEWS_MESSAGE);
