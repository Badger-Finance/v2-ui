import { Network } from '../mobx/model/network/network';
import { NETWORK_IDS } from './constants';
import { ETH_DEPLOY } from '../mobx/model/network/eth.network';

type Config = {
	[networkId: Network['id']]: Record<string, string>;
};

const MAINNET_VAULTS = ETH_DEPLOY.sett_system.vaults;

export const DEPRECATED_VAULTS_MIGRATIONS: Config = {
	[NETWORK_IDS.ETH]: {
		[MAINNET_VAULTS['native.pbtcCrv']]: MAINNET_VAULTS['native.ibbtcCrv'],
		[MAINNET_VAULTS['native.bbtcCrv']]: MAINNET_VAULTS['native.ibbtcCrv'],
		[MAINNET_VAULTS['native.sbtcCrv']]: MAINNET_VAULTS['native.ibbtcCrv'],
		[MAINNET_VAULTS['native.hbtcCrv']]: MAINNET_VAULTS['native.ibbtcCrv'],
		[MAINNET_VAULTS['native.obtcCrv']]: MAINNET_VAULTS['native.ibbtcCrv'],
		[MAINNET_VAULTS['native.tbtcCrv']]: MAINNET_VAULTS['native.ibbtcCrv'],
		[MAINNET_VAULTS['native.cvx']]: MAINNET_VAULTS['native.icvx'],
		[MAINNET_VAULTS['native.sushiibBTCwBTC']]: MAINNET_VAULTS['native.ibbtcCrv'],
		[MAINNET_VAULTS['native.uniBadgerWbtc']]: MAINNET_VAULTS['native.badgerCrv'],
		[MAINNET_VAULTS['native.fPmBtcHBtc']]: MAINNET_VAULTS['native.ibbtcCrv'],
		[MAINNET_VAULTS['native.imBtc']]: MAINNET_VAULTS['native.ibbtcCrv'],
		[MAINNET_VAULTS['harvest.renCrv']]: MAINNET_VAULTS['native.ibbtcCrv'],
		[MAINNET_VAULTS['native.badger']]: MAINNET_VAULTS['native.badgerCrv'],
		[MAINNET_VAULTS['native.uniDiggWbtc']]: MAINNET_VAULTS['native.sushiDiggWbtc'],
		[MAINNET_VAULTS['native.tricryptoCrv']]: MAINNET_VAULTS['native.tricryptoCrv2'],
	},
};
