import { Vault } from '@badger-dao/sdk';
import { observer } from 'mobx-react-lite';
import React from 'react';

interface Props {
	vault: Vault;
	multiplier?: number;
}

const VaultItemRoiTooltip = observer(({ vault, multiplier }: Props): JSX.Element => {
	return (
		<>
			{vault.sources.map((source) => {
				const sourceApr = source.boostable ? source.apr * (multiplier ?? 1) : source.apr;
				const apr = `${sourceApr.toFixed(2)}% ${source.name}`;
				return <div key={source.name}>{apr}</div>;
			})}
		</>
	);
});

export default VaultItemRoiTooltip;
