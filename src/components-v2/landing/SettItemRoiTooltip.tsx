import React from 'react';
import { Sett } from '../../mobx/model/setts/sett';

interface Props {
	sett: Sett;
	divisor: number;
	multiplier?: number;
}

export const SettItemRoiTooltip = ({ sett, divisor, multiplier }: Props): JSX.Element => {
	return (
		<>
			{sett.sources.map((source) => {
				const sourceApr = source.boostable ? source.apr * (multiplier ?? 1) : source.apr;
				const apr = `${(sourceApr / divisor).toFixed(2)}% ${source.name}`;
				return <div key={source.name}>{apr}</div>;
			})}
		</>
	);
};
