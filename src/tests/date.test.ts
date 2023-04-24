import { getFormatedDateTime } from 'utils/date';

describe('Date Utils', () => {
  it('Should return date with timezone', () => {
    expect(getFormatedDateTime(new Date('12/1/22 01:00:00 EST'))).toEqual('12/1/22, 1:00 AM EST');
  });
});
