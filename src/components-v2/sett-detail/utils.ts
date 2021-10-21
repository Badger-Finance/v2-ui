import { Sett, SettData } from '@badger-dao/sdk';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import { ChartMode } from '../../mobx/model/setts/sett-charts';
import { DelaySeverity } from '../../mobx/model/setts/sett-rewards';

dayjs.extend(utc);

export const ChartModeTitles: Record<string, string> = {
	[ChartMode.Value]: 'Sett Value',
	[ChartMode.Ratio]: 'Token Ratio',
	[ChartMode.AccountBalance]: 'My Holdings',
	[ChartMode.BoostMultiplier]: 'Badger Boost',
};

export const calculateDelaySeverity = (delay: number): DelaySeverity => {
	if (delay >= 4) {
		return DelaySeverity.high;
	}

	if (delay >= 2) {
		return DelaySeverity.medium;
	}

	return DelaySeverity.none;
};

export const calculateDifferenceInHoursFromCycle = (cycle: Date): number => {
	return Math.abs(dayjs(cycle).diff(dayjs(), 'hours'));
};

export function defaultSettBalance(sett: Sett): SettData {
	return {
		address: sett.settToken,
		name: sett.name,
		symbol: sett.asset,
		pricePerFullShare: sett.pricePerFullShare,
		balance: 0,
		value: 0,
		earnedBalance: 0,
		earnedValue: 0,
		depositedBalance: 0,
		withdrawnBalance: 0,
	};
}

export interface Balance {
	balance: number;
}

export function hasBalance(input?: Balance): boolean {
	if (!input) {
		return false;
	}
	return input.balance > 0;
}
