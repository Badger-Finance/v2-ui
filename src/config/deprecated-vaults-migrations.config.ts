import { Network } from '../mobx/model/network/network';
import { NETWORK_IDS } from './constants';
import { ETH_DEPLOY } from '../mobx/model/network/eth.network';

type Config = {
	[networkId: Network['id']]: Record<string, string>;
};

export const DEPRECATED_VAULTS_MIGRATIONS: Config = {
	[NETWORK_IDS.ETH]: {
		[ETH_DEPLOY.sett_system.vaults['native.badger']]: ETH_DEPLOY.sett_system.vaults['native.badgerCrv'],
		[ETH_DEPLOY.sett_system.vaults['harvest.renCrv']]: ETH_DEPLOY.sett_system.vaults['native.ibbtcCrv'],
		[ETH_DEPLOY.sett_system.vaults['native.uniDiggWbtc']]: ETH_DEPLOY.sett_system.vaults['native.ibbtcCrv'],
		[ETH_DEPLOY.sett_system.vaults['native.tricryptoCrv']]: ETH_DEPLOY.sett_system.vaults['native.tricryptoCrv2'],
	},
};
