import { ETH_DEPLOY } from 'mobx/model/network/eth.network';
import { BigNumber } from 'ethers';

export enum BondType {
	Liquidity = 'Liquidity',
	Reserve = 'Reserve',
}

export interface IBond {
	token: string;
	address: string;
	bondType: BondType;
	bondAddress: string;
}

export interface CitadelBond {
	token: string;
	address: string;
	price?: BigNumber;
	ended?: boolean;
	finalized?: boolean;
	bondType: BondType;
}

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

export const allBonds: IBond[] = [
	{ token: 'WBTC', address: ETH_DEPLOY.tokens.wBTC, bondType: BondType.Reserve, bondAddress: '' },
	{ token: 'CVX', address: ETH_DEPLOY.tokens.cvx, bondType: BondType.Reserve, bondAddress: '' },
	{
		token: 'bcrvibBTC',
		address: ETH_DEPLOY.sett_system.vaults['native.ibbtcCrv'],
		bondType: BondType.Liquidity,
		bondAddress: '',
	},
	{
		token: 'bveCVX',
		address: ETH_DEPLOY.sett_system.vaults['native.icvx'],
		bondType: BondType.Reserve,
		bondAddress: '',
	},
];
