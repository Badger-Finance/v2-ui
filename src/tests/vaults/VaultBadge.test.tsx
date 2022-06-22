import { VaultState } from '@badger-dao/sdk';
import React from 'react';

import VaultBadge from '../../components-v2/landing/VaultBadge';
import { checkSnapshot } from '../utils/snapshots';

describe('VaultTag', () => {
  test.each([...Object.values(VaultState)])('%p Vaults', (state) => {
    checkSnapshot(<VaultBadge state={state} />);
  });
});
