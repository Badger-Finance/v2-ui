import SpecsCard from 'components-v2/vault-detail/specs/SpecsCard';
import React from 'react';
import { checkSnapshot } from 'tests/utils/snapshots';

import { SAMPLE_VAULT } from '../utils/samples';

describe('Specs Section', () => {
  beforeEach(() => {
    const dateString = new Date(0).toLocaleString('en-US', {
      timeZone: 'America/New_York',
    });
    jest.spyOn(Date.prototype, 'toLocaleString').mockReturnValue(dateString);
  });
  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('displays sett information', () => {
    checkSnapshot(<SpecsCard vault={SAMPLE_VAULT} />);
  });
});
