import { VaultDTO, VaultBehavior } from '@badger-dao/sdk';
import React from 'react';

interface Props {
	vault: VaultDTO;
}

const VaultBehaviorTooltip = ({ vault }: Props): JSX.Element | null => {
	const { protocol, behavior, name } = vault;

	let description = '';
	switch (behavior) {
		case VaultBehavior.Compounder:
			description = `Compounds 100% of rewards into more ${name}`;
			break;
		case VaultBehavior.DCA:
			const emittedDCA = vault.sources.map((s) => s.name.replace('Rewards', '').trim()).join(', ');
			description = `Compounds 100% of rewards into ${emittedDCA}`;
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

	return <div>{description}</div>;
};

export default VaultBehaviorTooltip;
