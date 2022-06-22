import { VaultState } from '@badger-dao/sdk';
import React from 'react';
import { Badge, BadgeType } from 'ui-library/Badge';

interface VaultBadgeProps {
  state: VaultState;
}

const VaultBadge = ({ state }: VaultBadgeProps): JSX.Element | null => {
  switch (state) {
    case VaultState.Featured:
      return <Badge type={BadgeType.FEATURED} />;
    case VaultState.Experimental:
      return <Badge type={BadgeType.EXPERIMENTAL} />;
    case VaultState.Guarded:
      return <Badge type={BadgeType.GUARDED} />;
    case VaultState.Discontinued:
      return <Badge type={BadgeType.DISCONTINUED} />;
    default:
      return null;
  }
};

export default VaultBadge;
