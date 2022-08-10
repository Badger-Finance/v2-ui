import { SAMPLE_VAULT } from 'tests/utils/samples';

import VaultItemApr from '../../components-v2/landing/VaultItemApr';
import { checkSnapshot } from '../utils/snapshots';

describe('VaultItemApr', () => {
  afterEach(() => {
    jest.useRealTimers();
  });

  describe('No APR Vaults', () => {
    it('renders zero APR', () => {
      checkSnapshot(<VaultItemApr vault={{ ...SAMPLE_VAULT, apr: 0 }} />);
    });
  });

  describe('Boosted Vaults', () => {
    it('displays correct APR and boost information', () => {
      checkSnapshot(<VaultItemApr vault={SAMPLE_VAULT} />);
    });
  });
});
