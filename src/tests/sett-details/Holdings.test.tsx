import React from 'react';
import { checkSnapshot } from 'tests/utils/snapshots';
import { SAMPLE_BADGER_SETT, SAMPLE_SETT, SAMPLE_SETT_BALANCE, SAMPLE_TOKEN_BALANCE } from '../utils/samples';
import { Holdings } from '../../components-v2/sett-detail/holdings/Holdings';

describe('Breadcrumb', () => {
  it('displays holdings with no balance', () => {
    checkSnapshot(
      <Holdings
        sett={SAMPLE_SETT}
        badgerSett={SAMPLE_BADGER_SETT}
        userData={SAMPLE_SETT_BALANCE}
        tokenBalance={SAMPLE_TOKEN_BALANCE}
      />,
    );
  });

  it('displays holdings with balance', () => {
    checkSnapshot(
      <Holdings
        sett={SAMPLE_SETT}
        badgerSett={SAMPLE_BADGER_SETT}
        userData={SAMPLE_SETT_BALANCE}
        tokenBalance={SAMPLE_TOKEN_BALANCE}
      />,
    );
  });
});
