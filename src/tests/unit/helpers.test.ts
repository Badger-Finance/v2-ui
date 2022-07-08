import '@testing-library/jest-dom';

import { numberWithCommas, parseQueryMultipleParams } from '../../mobx/utils/helpers';

describe('helpers', () => {
  describe('numberWithCommas', () => {
    test.each([
      ['1000', '1,000'],
      ['1000000.1000', '1,000,000.1000'],
      ['100', '100'],
      ['-1000000.00', '-1,000,000.00'],
    ])('formatTokens(%s) returns %s', (x, expected) => {
      expect(numberWithCommas(x)).toBe(expected);
    });
  });

  describe('parseQueryMultipleParams', () => {
    test.each([
      [undefined, undefined],
      ['', undefined],
      ['value', ['value']],
      [
        ['value1', 'value2'],
        ['value1', 'value2'],
      ],
    ])('parseQueryMultipleParams(%s) returns %s', (query, expected) => {
      expect(parseQueryMultipleParams(query)).toEqual(expected);
    });
  });
});
