import dayjs from 'dayjs';

import { calculateDelaySeverity, calculateDifferenceInHoursFromCycle } from '../../components-v2/vault-detail/utils';
import { DelaySeverity } from '../../mobx/model/vaults/vault-rewards';

describe('sett detail utils', () => {
  describe('calculateDifferenceInHoursFromCycle', () => {
    test.each([
      [dayjs().subtract(1, 'hours').toDate(), 1],
      [dayjs().subtract(2, 'hours').toDate(), 2],
      [dayjs().subtract(3, 'hours').toDate(), 3],
      [dayjs().subtract(4, 'hours').toDate(), 4],
    ])('calculateDifferenceInHoursFromCycle(%s) returns %d', (cycle: Date, difference: number) => {
      expect(calculateDifferenceInHoursFromCycle(cycle.getTime())).toEqual(difference);
    });
  });

  describe('calculateDelaySeverity', () => {
    test.each([
      [0.5, DelaySeverity.None],
      [1, DelaySeverity.None],
      [1.9, DelaySeverity.None],
      [2, DelaySeverity.Medium],
      [3, DelaySeverity.Medium],
      [3.9, DelaySeverity.Medium],
      [4, DelaySeverity.High],
      [5, DelaySeverity.High],
    ])('calculateDelaySeverity(%d) returns %s', (delay: number, severity: DelaySeverity) => {
      expect(calculateDelaySeverity(delay)).toEqual(severity);
    });
  });
});
