import React from 'react';
import { Sett } from '../../mobx/model/setts/sett';
import { Typography } from '@material-ui/core';

interface Props {
	sett: Sett;
	divisor: number;
	multiplier: number;
}

export const SettItemUserApr = ({ sett, divisor, multiplier }: Props): JSX.Element => {
	const totalBoost = sett.sources
		.map((source) => (source.boostable ? source.apr * multiplier : source.apr))
		.reduce((total, apr) => total + apr, 0);

	const userApr = totalBoost / divisor;

	return (
		<Typography variant="caption" color={'textPrimary'}>
			My Boost: {userApr.toFixed(2)}%
		</Typography>
	);
};
