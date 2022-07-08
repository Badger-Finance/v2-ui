import { VaultDTO } from '@badger-dao/sdk';
import { AdvisoryType } from 'mobx/model/vaults/advisory-type';
import React from 'react';

import ChadgerVaultAdvisory from './ChadgerVaultAdvisory';
import LockingVaultAdvisory from './LockingVaultAdivsory';
import RemunerationVaultAdvisory from './RemunerationVaultAdvisory';

interface Props {
  vault: VaultDTO;
  type: AdvisoryType;
  accept: () => void;
}

const VaultAdvisory = ({ vault, type, accept }: Props): JSX.Element | null => {
  let advisory: JSX.Element | null;
  switch (type) {
    case AdvisoryType.ConvexLock:
      advisory = (
        <LockingVaultAdvisory
          accept={accept}
          vault={vault}
          lockingWeeks={16}
          learnMoreLink="https://docs.badger.com/badger-finance/sett-user-guides/blcvx-locked-convex"
        />
      );
      break;
    case AdvisoryType.VaultLock:
      advisory = <LockingVaultAdvisory vault={vault} accept={accept} lockingWeeks={16} />;
      break;
    case AdvisoryType.Remuneration:
      advisory = <RemunerationVaultAdvisory accept={accept} />;
      break;
    case AdvisoryType.Chadger:
      advisory = <ChadgerVaultAdvisory accept={accept} />;
      break;
    case AdvisoryType.None:
    default:
      advisory = null;
  }
  return advisory;
};

export default VaultAdvisory;
