import { VaultDTO } from '@badger-dao/sdk';
import { StoreContext } from 'mobx/stores/store-context';
import { observer } from 'mobx-react-lite';
import React, { useContext } from 'react';

interface Props {
	vault: VaultDTO;
	multiplier?: number;
}

const VaultItemRoiTooltip = observer(({ vault, multiplier }: Props): JSX.Element => {
	const { vaults } = useContext(StoreContext);
	const { showAPR } = vaults.vaultsFilters;
	return (
		<>
			{(showAPR ? vault.sources : vault.sourcesApy).map((source) => {
				const sourceApr = source.boostable ? source.apr * (multiplier ?? 1) : source.apr;
				const apr = `${sourceApr.toFixed(2)}% ${source.name}`;
				return <div key={source.name}>{apr}</div>;
			})}
		</>
	);
});

export default VaultItemRoiTooltip;
