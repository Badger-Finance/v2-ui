import { VaultDTOV3 } from '@badger-dao/sdk';
import { AdvisoryType } from 'mobx/model/vaults/advisory-type';
import React from 'react';

import AuraLockingVaultAdvisory from './AuraLockingVaultAdivsory';
import ChadgerVaultAdvisory from './ChadgerVaultAdvisory';
import LockingVaultAdvisory from './LockingVaultAdivsory';
import RemunerationVaultAdvisory from './RemunerationVaultAdvisory';

interface Props {
  vault: VaultDTOV3;
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
          learnMoreLink="https://docs.badger.com/vaults/user-guides/vault-user-guides-ethereum/vote-locked-cvx"
        />
      );
      break;
    case AdvisoryType.AuraLock:
      advisory = <AuraLockingVaultAdvisory accept={accept} vault={vault} lockingWeeks={16} />;
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
