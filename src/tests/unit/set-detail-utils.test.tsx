import 'jest';
import dayjs from 'dayjs';
import {
	calculateDelaySeverity,
	calculateDifferenceInHoursFromCycle,
	DelaySeverity,
} from '../../components-v2/sett-detail/utils';

describe('sett detail utils', () => {
	describe('calculateDifferenceInHoursFromCycle', () => {
		test.each([
			[dayjs().subtract(1, 'hours').toDate(), 1],
			[dayjs().subtract(2, 'hours').toDate(), 2],
			[dayjs().subtract(3, 'hours').toDate(), 3],
			[dayjs().subtract(4, 'hours').toDate(), 4],
		])('calculateDifferenceInHoursFromCycle(%s) returns %d', (cycle: Date, difference: number) => {
			expect(calculateDifferenceInHoursFromCycle(cycle)).toEqual(difference);
		});
	});

	describe('calculateDelaySeverity', () => {
		test.each([
			[0.5, DelaySeverity.none],
			[1, DelaySeverity.none],
			[1.9, DelaySeverity.none],
			[2, DelaySeverity.medium],
			[3, DelaySeverity.medium],
			[3.9, DelaySeverity.medium],
			[4, DelaySeverity.high],
			[5, DelaySeverity.high],
		])('calculateDelaySeverity(%d) returns %s', (delay: number, severity: DelaySeverity) => {
			expect(calculateDelaySeverity(delay)).toEqual(severity);
		});
	});
});
