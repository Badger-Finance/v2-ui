import React from 'react';
import { Value } from './Value';
import { Tokens } from './Tokens';
import { Claims } from './Claims';
import { Harvests } from './Harvests';
import { Fees } from './Fees';
import { Card } from '@material-ui/core';

export const InformationCard = (): JSX.Element => {
	return (
		<Card>
			<Value />
			<Tokens />
			<Claims />
			<Harvests />
			<Fees />
		</Card>
	);
};
