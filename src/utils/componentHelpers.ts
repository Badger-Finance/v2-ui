import { Token, VaultData, VaultDTO, VaultState } from '@badger-dao/sdk';
import { VaultType } from '@badger-dao/sdk/lib/api/enums';

import mainnetDeploy from '../config/deployments/mainnet.json';
import { MAX_BOOST_RANK } from '../config/system/boost-ranks';
import { Network } from '../mobx/model/network/network';
import UserStore from '../mobx/stores/UserStore';
import { calculateUserBoost } from './boost-ranks';

export const restrictToRange = (num: number, min: number, max: number): number => Math.min(Math.max(num, min), max);

export const debounce = (n: number, fn: (...params: any[]) => any, immediate = false): any => {
	let timer: any = undefined;
	return function (this: any, ...args: any[]) {
		if (timer === undefined && immediate) {
			fn.apply(this, args);
		}
		clearTimeout(timer);
		timer = setTimeout(() => fn.apply(this, args), n);
		return timer;
	};
};

export const shortenAddress = (address: string, displayDigitsNumber = 3): string => {
	return (
		address.slice(0, displayDigitsNumber) +
		'..' +
		address.slice(address.length - displayDigitsNumber, address.length)
	);
};

/**
 * Calculates the percentage of a given point within a range
 */
export const percentageBetweenRange = (point: number, upperLimit: number, lowerLimit: number): number => {
	if (point < lowerLimit) {
		return 0;
	}

	if (point >= upperLimit) {
		return 100;
	}
	return ((point - lowerLimit) / (upperLimit - lowerLimit)) * 100;
};

export const roundWithPrecision = (value: number, precision: number): number => {
	const decimalsCriteria = Math.pow(10, precision);
	return Math.round((value + Number.EPSILON) * decimalsCriteria) / decimalsCriteria;
};

export const formatStrategyFee = (fee: number): string => `${(fee / 100).toString()}%`;

export const isVaultVaultIbbtc = (vault: VaultDTO): boolean => {
	return vault.vaultToken === mainnetDeploy.sett_system.vaults['native.ibbtcCrv'];
};

export function shouldDisplayEarnings(vault: VaultDTO, data: VaultData): boolean {
	// possible to have negative earned value (digg) :sadge:
	if (data.earnedValue <= 0) {
		return false;
	}
	// search for the vault source, always "Vault Compounding"
	const vaultSource = vault.sources.find((s) => s.name.includes('Compounding'));
	if (!vaultSource) {
		return false;
	}

	return vaultSource.apr > 0;
}

export const getFormattedNetworkName = (network: Network): string => {
	return network.name
		.split(' ')
		.map((word) => word.slice(0, 1).toUpperCase() + word.slice(1))
		.join(' ');
};

export function getUserVaultBoost(vault: VaultDTO, boost: number, apr = false): number {
	if (vault.state === VaultState.Discontinued || vault.sources.length === 0) {
		return 0;
	}

	const maxBoost = calculateUserBoost(MAX_BOOST_RANK.stakeRatioBoundary);

	return (apr ? vault.sources : vault.sourcesApy)
		.map((source) => {
			if (!source.boostable) {
				return source.apr;
			}
			return source.minApr + (boost / maxBoost) * (source.maxApr - source.minApr);
		})
		.reduce((total, apr) => total + apr, 0);
}

export const limitVaultType = (vaults: VaultDTO[], type: VaultType, max = 3): VaultDTO[] => {
	return vaults
		.sort((a, b) => b.value - a.value) // sort by TVL
		.filter((vault) => vault.type === type)
		.slice(0, max);
};

export function useFormatExampleList(userStore: UserStore): (vaults: VaultDTO[]) => string {
	return (vaults: VaultDTO[]) =>
		vaults
			.map((vault) => userStore.getTokenBalance(vault.underlyingToken).token.symbol)
			.sort((a, b) => a.length - b.length) // sort with the shortest name
			.join(', ');
}

export function getTokenIconPath(token: Token): string {
	const fileName = token.symbol.replaceAll('/', '-');
	return `/assets/icons/${fileName.toLowerCase()}.svg`;
}

export const isValidCalculatedValue = (value: number) => isFinite(value) && !isNaN(value);
