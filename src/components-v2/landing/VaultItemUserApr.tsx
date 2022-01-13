import React from 'react';
import { Typography } from '@material-ui/core';
import { Vault } from '@badger-dao/sdk';
import { MAX_BOOST_LEVEL } from 'config/system/boost-ranks';

interface Props {
	vault: Vault;
	boost?: number;
}

export const VaultItemUserApr = ({ vault, boost }: Props): JSX.Element | null => {
	if (!boost) {
		return null;
	}

	const totalBoost = vault.sources
		.map((source) => (source.boostable ? source.maxApr * (boost / MAX_BOOST_LEVEL.multiplier) : source.apr))
		.reduce((total, apr) => total + apr, 0);

	return (
		<Typography variant="caption" color={'textPrimary'}>
			My Boost: {totalBoost.toFixed(2)}%
		</Typography>
	);
};
