import { Vault, VaultBehavior } from '@badger-dao/sdk';
import React from 'react';

interface Props {
  vault: Vault;
}

const VaultBehaviorTooltip = ({ vault }: Props): JSX.Element | null => {
  const { protocol, behavior, name } = vault;

  let description = '';
  switch (behavior) {
    case VaultBehavior.Compounder:
      description = `Compounds 100% of rewards into more ${name}`;
      break;
    case VaultBehavior.Ecosystem:
      description = `Converts rewards to ${protocol} Helpers`;
      break;
    case VaultBehavior.EcosystemHelper:
      description = `Combination of compounding rewards into more ${name} and converting rewards to ${protocol} Helpers`;
      break;
    case VaultBehavior.Helper:
    case VaultBehavior.None:
    default:
      return null;
  }

  return (
    <div>
      {description}
    </div>
  );
}

export default VaultBehaviorTooltip;
