import React from 'react';
import { VaultState } from '@badger-dao/sdk';
import { Badge, BadgeType } from 'ui-library/Badge';

interface VaultBadgeProps {
	state: VaultState;
}

const VaultBadge = ({ state }: VaultBadgeProps): JSX.Element | null => {
	switch (state) {
		case VaultState.New:
			return <Badge type={BadgeType.NEW} />;
		case VaultState.Experimental:
			return <Badge type={BadgeType.EXPERIMENTAL} />;
		case VaultState.Guarded:
			return <Badge type={BadgeType.GUARDED} />;
		case VaultState.Deprecated:
			return <Badge type={BadgeType.OBSOLETE} />;
		default:
			return null;
	}
};

export default VaultBadge;
