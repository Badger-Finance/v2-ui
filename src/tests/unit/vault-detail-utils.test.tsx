import { ONE_HOUR_MS } from '@badger-dao/sdk';
import { calculateDelaySeverity, calculateDifferenceInHoursFromCycle } from '../../components-v2/vault-detail/utils';
import { DelaySeverity } from '../../mobx/model/vaults/vault-rewards';

describe('sett detail utils', () => {
  describe('calculateDifferenceInHoursFromCycle', () => {
    const baseTime = 1659715530585;
    beforeEach(() => {
      jest.spyOn(Date, 'now').mockImplementation(() => baseTime);
    });
    test.each([
      [undefined, 0],
      [baseTime - ONE_HOUR_MS, 1],
      [baseTime - ONE_HOUR_MS * 2, 2],
    ])('calculateDifferenceInHoursFromCycle(%s) returns %d', (timestamp: number | undefined, difference: number) => {
      expect(calculateDifferenceInHoursFromCycle(timestamp ? timestamp / 1000 : timestamp)).toEqual(difference);
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
