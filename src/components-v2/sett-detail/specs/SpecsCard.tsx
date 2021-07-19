import React from 'react';
import { CardContainer } from '../styled';
import { Value } from './Value';
import { Tokens } from './Tokens';
import { Claims } from './Claims';
import { Harvests } from './Harvests';
import { Fees } from './Fees';

export const SpecsCard = (): JSX.Element => {
	return (
		<CardContainer>
			<Value />
			<Tokens />
			<Claims />
			<Harvests />
			<Fees />
		</CardContainer>
	);
};
