import { ETH_DEPLOY } from 'mobx/model/network/eth.network';
import { LOCAL_DEPLOY } from 'mobx/model/network/local.network';
import { BigNumber } from 'ethers';
import { ethers } from 'ethers';
import { DEBUG } from 'config/environment';
import { Token } from '@badger-dao/sdk';

export enum BondType {
	Liquidity = 'Liquidity',
	Reserve = 'Reserve',
}

export interface IBond {
	bondType: BondType;
	bondAddress: string;
}

export interface CitadelBond {
	address: string;
	bondToken: Token;
	bondAddress: string;
	bondType: BondType;
	price: BigNumber;
	start: BigNumber;
	ended: boolean;
	finalized: boolean;
	userPurchased: BigNumber;
	totalPurchased: BigNumber;
	totalSold: BigNumber;
	claimed: boolean;
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

function resovleBondAddress(address?: string): string {
	return address ? address : ethers.constants.AddressZero;
}

export const allBonds: IBond[] = [
	...(DEBUG
		? [
				{
					bondType: BondType.Reserve,
					bondAddress: resovleBondAddress(LOCAL_DEPLOY.citadel?.testSale),
				},
				{
					bondType: BondType.Reserve,
					bondAddress: resovleBondAddress(LOCAL_DEPLOY.citadel?.testSale2),
				},
		  ]
		: [
				{ bondType: BondType.Reserve, bondAddress: resovleBondAddress(ETH_DEPLOY.citadel?.wbtcSale) },
				{ bondType: BondType.Reserve, bondAddress: resovleBondAddress(ETH_DEPLOY.citadel?.cvxSale) },
				{
					bondType: BondType.Liquidity,
					bondAddress: resovleBondAddress(ETH_DEPLOY.citadel?.bveCVXSale),
				},
				{
					bondType: BondType.Reserve,
					bondAddress: resovleBondAddress(ETH_DEPLOY.citadel?.bcrvibBTCSale),
				},
		  ]),
];
