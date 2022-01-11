import { ETH_DEPLOY } from 'mobx/model/network/eth.network';

export interface IBond {
	token: string;
	address: string;
}

export const allBonds: IBond[] = [
	{ token: 'WBTC', address: ETH_DEPLOY.tokens.wBTC },
	{ token: 'CVX', address: ETH_DEPLOY.tokens.cvx },
	{ token: 'bcrvibBTC', address: ETH_DEPLOY.sett_system.vaults['native.ibbtcCrv'] },
	{ token: 'bveCVX', address: ETH_DEPLOY.sett_system.vaults['native.icvx'] },
];
