import { Sett } from '@badger-dao/sdk';
import { observer } from 'mobx-react-lite';
import { StoreContext } from 'mobx/store-context';
import React, { useContext } from 'react';

interface Props {
	sett: Sett;
	multiplier?: number;
}

const SettItemRoiTooltip = observer(
	({ sett, multiplier }: Props): JSX.Element => {
		const { onboard } = useContext(StoreContext);
		return (
			<>
				{sett.sources.map((source) => {
					let sourceApr;
					if (onboard.isActive()) {
						sourceApr = source.boostable ? source.apr * (multiplier ?? 1) : source.apr;
					} else {
						sourceApr = source.minApr;
					}
					const apr = `${sourceApr.toFixed(2)}% ${source.name}`;
					return <div key={source.name}>{apr}</div>;
				})}
			</>
		);
	},
);

export default SettItemRoiTooltip;
