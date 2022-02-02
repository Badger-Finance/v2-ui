import mainnetDeploy from '../config/deployments/mainnet.json';
import { Vault, VaultData, VaultState } from '@badger-dao/sdk';
import { Network } from '../mobx/model/network/network';
import { MAX_BOOST_LEVEL } from '../config/system/boost-ranks';
import { VaultType } from '@badger-dao/sdk/lib/api/enums';
import UserStore from '../mobx/stores/UserStore';

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

export const shortenAddress = (address: string): string => {
	return address.slice(0, 4) + '..' + address.slice(address.length - 4, address.length);
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

export const roundWithDecimals = (value: number, decimals: number): number => {
	const decimalsCriteria = Math.pow(10, decimals);
	return Math.round((value + Number.EPSILON) * decimalsCriteria) / decimalsCriteria;
};

export const formatStrategyFee = (fee: number): string => `${(fee / 100).toString()}%`;

export const isVaultVaultIbbtc = (vault: Vault): boolean => {
	return vault.vaultToken === mainnetDeploy.sett_system.vaults['native.ibbtcCrv'];
};

export function shouldDisplayEarnings(vault: Vault, data: VaultData): boolean {
	// possible to have negative earned value (digg) :sadge:
	if (data.earnedValue <= 0) {
		return false;
	}
	// search for the vault source, always "Vault Compounding"
	const vaultSource = vault.sources.find((s) => s.name.includes('Compounding'));
	if (!vaultSource) {
		return false;
	}
	const perf = vaultSource.performance;
	return perf.oneDay > 0 || perf.threeDay > 0 || perf.sevenDay > 0 || perf.thirtyDay > 0;
}

export const getFormattedNetworkName = (network: Network): string => {
	return network.name
		.split(' ')
		.map((word) => word.slice(0, 1).toUpperCase() + word.slice(1))
		.join(' ');
};

export function getUserVaultBoost(vault: Vault, boost: number): number | null {
	if (!vault.boost.enabled || !vault.minApr || vault.state === VaultState.Deprecated || vault.sources.length === 0) {
		return null;
	}

	return vault.sources
		.map((source) => {
			if (!source.boostable) {
				return source.apr;
			}
			return source.minApr + (boost / MAX_BOOST_LEVEL.multiplier) * (source.maxApr - source.minApr);
		})
		.reduce((total, apr) => total + apr, 0);
}

export const limitVaultType = (vaults: Vault[], type: VaultType, max = 3): Vault[] => {
	return vaults
		.sort((a, b) => b.value - a.value) // sort by TVL
		.filter((vault) => vault.type === type)
		.slice(0, max);
};

export function useFormatExampleList(userStore: UserStore): (vaults: Vault[]) => string {
	return (vaults: Vault[]) =>
		vaults
			.map((vault) => userStore.getTokenBalance(vault.underlyingToken).token.symbol)
			.sort((a, b) => a.length - b.length) // sort with the shortest name
			.join(', ');
}

export function getVaultIconPath(vault: Vault, network: Network): string {
	return `/assets/icons/${vault.vaultAsset.toLowerCase()}-${network.symbol}.svg`;
}
