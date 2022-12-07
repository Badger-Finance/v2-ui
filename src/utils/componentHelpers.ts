import { Token, VaultData, VaultDTOV3, VaultState } from '@badger-dao/sdk';
import { VaultType } from '@badger-dao/sdk/lib/api/enums';

import mainnetDeploy from '../config/deployments/mainnet.json';
import { MAX_BOOST_RANK } from '../config/system/boost-ranks';
import { Chain } from '../mobx/model/network/chain';
import UserStore from '../mobx/stores/UserStore';
import { calculateUserBoost } from './boost-ranks';
import { BoostedRewards } from './enums/boosted-rewards.enum';

export const restrictToRange = (num: number, min: number, max: number): number => Math.min(Math.max(num, min), max);

export const shortenAddress = (address: string, displayDigitsNumber = 3): string => {
  return (
    address.slice(0, displayDigitsNumber) + '..' + address.slice(address.length - displayDigitsNumber, address.length)
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

export const isVaultVaultIbbtc = (vault: VaultDTOV3): boolean => {
  return vault.vaultToken === mainnetDeploy.sett_system.vaults['native.ibbtcCrv'];
};

export function shouldDisplayEarnings(vault: VaultDTOV3, data: VaultData): boolean {
  // possible to have negative earned value (digg) :sadge:
  if (data.earnedValue <= 0) {
    return false;
  }
  // search for the vault source, always "Vault Compounding"
  const vaultSource = vault.apy.sources.find((s) => s.name.includes('Compounding'));
  if (!vaultSource) {
    return false;
  }

  return vaultSource.performance.baseYield > 0;
}

export const getFormattedNetworkName = (network: Chain): string => {
  return network.name
    .split(' ')
    .map((word) => word.slice(0, 1).toUpperCase() + word.slice(1))
    .join(' ');
};

export function isBadgerSource(source: { name: string }): boolean {
  return source.name === BoostedRewards.Badger || source.name === BoostedRewards.BoostedBadger;
}

export function isFlywheelSource(source: { name: string }): boolean {
  return /vault flywheel/i.test(source?.name);
}

export function getUserVaultBoost(vault: VaultDTOV3, boost: number, apr = false): number {
  if (vault.state === VaultState.Discontinued || vault.apy.sources.length === 0) {
    return 0;
  }

  const maxBoost = calculateUserBoost(MAX_BOOST_RANK.stakeRatioBoundary);
  return (apr ? vault.apr.sources : vault.apy.sources)
    .map((source) => {
      const {
        performance: { baseYield, minYield, maxYield },
      } = source;
      if (!source.boostable) {
        return baseYield;
      }
      return minYield + (boost / maxBoost) * (maxYield - minYield);
    })
    .reduce((total, apr) => total + apr, 0);
}

export function getBoostContribution(vault: VaultDTOV3, boost: number): number {
  const maxBoost = calculateUserBoost(MAX_BOOST_RANK.stakeRatioBoundary);
  return vault.apy.sources
    .filter((s) => s.name === BoostedRewards.BoostedBadger)
    .map((s) => {
      const {
        performance: { minYield, maxYield },
      } = s;
      return minYield + (boost / maxBoost) * (maxYield - minYield);
    })
    .reduce((total, apr) => total + apr, 0);
}

export const limitVaultType = (vaults: VaultDTOV3[], type: VaultType, max = 3): VaultDTOV3[] => {
  return vaults
    .sort((a, b) => b.value - a.value) // sort by TVL
    .filter((vault) => vault.type === type)
    .slice(0, max);
};

export function useFormatExampleList(userStore: UserStore): (vaults: VaultDTOV3[]) => string {
  return (vaults: VaultDTOV3[]) =>
    vaults
      .map((vault) => userStore.getBalance(vault.underlyingToken).token.symbol)
      .sort((a, b) => a.length - b.length) // sort with the shortest name
      .join(', ');
}

export function getTokenIconPath(token: Token | { symbol: string }): string {
  const fileName = token.symbol.replaceAll('/', '-');
  return `/assets/icons/${fileName.toLowerCase()}.svg`;
}

export const isValidCalculatedValue = (value: number) => isFinite(value) && !isNaN(value);

export function decamelize(str: string, separator: string) {
  separator = typeof separator === 'undefined' ? '_' : separator;

  return str
    .replace(/([a-z\d])([A-Z])/g, '$1' + separator + '$2')
    .replace(/([A-Z]+)([A-Z][a-z\d]+)/g, '$1' + separator + '$2')
    .toLowerCase()
    .split(separator)
    .map((word) => word[0].toUpperCase() + word.substring(1))
    .join(separator);
}
