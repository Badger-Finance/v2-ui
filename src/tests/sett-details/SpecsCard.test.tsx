import SpecsCard from 'components-v2/vault-detail/specs/SpecsCard';
import React from 'react';
import { checkSnapshot } from 'tests/utils/snapshots';

import { SAMPLE_VAULT } from '../utils/samples';

describe('Specs Section', () => {
  it('displays sett information', () => {
    checkSnapshot(<SpecsCard vault={SAMPLE_VAULT} />);
  });
});
