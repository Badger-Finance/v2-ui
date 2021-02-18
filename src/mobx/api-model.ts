/**
 * All API Model Objects should be directly in line with API interface model
 * objects to ensure data compatiblity. Interfaces located at link below:
 * https://github.com/axejintao/badger-api/tree/staging/src/interface
 */
import BigNumber from "bignumber.js";

export interface Geyser {
  emissions: Emission[],
}

export interface Token {
  address: string;
  name: string;
  symbol: string;
  decimals: number;
}

export interface Emission {
  token: Token,
  unlockSchedule: UnlockSchedule,
}

export interface UnlockSchedule {
	initialLocked: BigNumber,
	endAtSec: BigNumber,
	durationSec: BigNumber,
	startTime: BigNumber,
}

export interface TokenBalance {
  address: string;
  name: string;
  symbol: string;
  decimals: number;
  balance: number,
  value: number,
}

export interface ValueSource {
  name: string,
  apy: number,
  performance: Performance,
}

export interface Sett {
  name: string,
  asset: string,
  ppfs: number,
  value: number,
  apy: number,
  tokens: TokenBalance[],
  sources: ValueSource[],
  geyser?: Geyser,
}

export interface SettSummary {
  name: string,
  asset: string,
  value: number,
  tokens: TokenBalance[],
}
