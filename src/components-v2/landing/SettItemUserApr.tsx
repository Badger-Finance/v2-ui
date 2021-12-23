import React from 'react';
import { Typography } from '@material-ui/core';
import { Vault } from '@badger-dao/sdk';

interface Props {
	sett: Vault;
	multiplier: number;
}

export const SettItemUserApr = ({ sett, multiplier }: Props): JSX.Element => {
	const totalBoost = sett.sources
		.map((source) => (source.boostable ? source.apr * multiplier : source.apr))
		.reduce((total, apr) => total + apr, 0);

	return (
		<Typography variant="caption" color={'textPrimary'}>
			My Boost: {totalBoost.toFixed(2)}%
		</Typography>
	);
};
