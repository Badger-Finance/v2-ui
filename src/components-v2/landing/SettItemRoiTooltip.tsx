import { Vault } from '@badger-dao/sdk';
import { observer } from 'mobx-react-lite';
import React from 'react';

interface Props {
	sett: Vault;
	multiplier?: number;
}

const SettItemRoiTooltip = observer(({ sett, multiplier }: Props): JSX.Element => {
	return (
		<>
			{sett.sources.map((source) => {
				const sourceApr = source.boostable ? source.apr * (multiplier ?? 1) : source.apr;
				const apr = `${sourceApr.toFixed(2)}% ${source.name}`;
				return <div key={source.name}>{apr}</div>;
			})}
		</>
	);
});

export default SettItemRoiTooltip;
