import React from 'react';
import { makeStyles } from '@material-ui/core/styles';

import { CardContainer } from '../styled';
import { Value } from './Value';
import { Tokens } from './Tokens';
import { Claims } from './Claims';
import { Harvests } from './Harvests';
import { Fees } from './Fees';

const useStyles = makeStyles((theme) => ({
	root: {
		flexDirection: 'column',
		padding: theme.spacing(2),
	},
}));

export const SpecsCard = (): JSX.Element => {
	const classes = useStyles();

	return (
		<CardContainer className={classes.root}>
			<Value />
			<Tokens />
			<Claims />
			<Harvests />
			<Fees />
		</CardContainer>
	);
};
