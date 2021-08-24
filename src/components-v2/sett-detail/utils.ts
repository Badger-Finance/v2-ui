import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import { Sett } from 'mobx/model/setts/sett';
import { SettBalance } from 'mobx/model/setts/sett-balance';
import { ChartMode } from '../../mobx/model/setts/sett-charts';
import { DelaySeverity } from '../../mobx/model/setts/sett-rewards';

dayjs.extend(utc);

export const ChartModeTitles = {
	[ChartMode.value]: 'Sett Value',
	[ChartMode.ratio]: 'Token Ratio',
	[ChartMode.accountBalance]: 'Your Holdings',
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

export function defaultSettBalance(sett: Sett): SettBalance {
	return {
		id: sett.vaultToken,
		name: sett.name,
		asset: sett.asset,
		ppfs: sett.ppfs,
		balance: 0,
		value: 0,
		earnedTokens: [],
		tokens: [],
		earnedBalance: 0,
		earnedValue: 0,
		depositedBalance: 0,
		withdrawnBalance: 0,
	};
}
