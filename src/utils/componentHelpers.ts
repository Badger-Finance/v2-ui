import mainnetDeploy from '../config/deployments/mainnet.json';
import { Sett, SettData } from '@badger-dao/sdk';
import { Network } from '../mobx/model/network/network';

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
	if (!address) return '';
	return address.slice(0, 6) + '...' + address.slice(address.length - 6, address.length);
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

export const isSettVaultIbbtc = (sett: Sett): boolean => {
	return sett.settToken === mainnetDeploy.sett_system.vaults['native.ibbtcCrv'];
};

export function shouldDisplayEarnings(sett: Sett, data: SettData): boolean {
	// possible to have negative earned value (digg) :sadge:
	if (data.earnedValue <= 0) {
		return false;
	}
	// search for the vault source, always "Vault Compounding"
	const vaultSource = sett.sources.find((s) => s.name.includes('Compounding'));
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
