import { ETH_DEPLOY } from 'mobx/model/network/eth.network';

export enum BondType {
	Liquidity = 'Liquidity',
	Reserve = 'Reserve',
}

export interface IBond {
	token: string;
	address: string;
	bondType: BondType;
}

export const allBonds: IBond[] = [
	{ token: 'WBTC', address: ETH_DEPLOY.tokens.wBTC, bondType: BondType.Reserve },
	{ token: 'CVX', address: ETH_DEPLOY.tokens.cvx, bondType: BondType.Liquidity },
	{ token: 'bcrvibBTC', address: ETH_DEPLOY.sett_system.vaults['native.ibbtcCrv'], bondType: BondType.Reserve },
	{ token: 'bveCVX', address: ETH_DEPLOY.sett_system.vaults['native.icvx'], bondType: BondType.Reserve },
];

export enum Beneficiary {
	Olympus = 'Olympus',
	Redacted = 'Redacted',
	Frax = 'Frax',
	Alchemix = 'Alchemix',
	Tokemak = 'Tokemak',
	Abracadabra = 'Abracadabra',
	Convex = 'Convex',
}

export enum SaleStatus {
	Pending = 'Pending',
	Open = 'Open',
	Closed = 'Closed',
}
