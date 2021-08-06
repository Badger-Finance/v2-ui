import React from 'react';
import { Grid } from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';

import { CardContainer } from '../styled';
import { Value } from './Value';
import { Tokens } from './Tokens';
import { Claims } from './Claims';
import { Harvests } from './Harvests';
import { Fees } from './Fees';
import { Sett } from '../../../mobx/model/setts/sett';

const useStyles = makeStyles((theme) => ({
	root: {
		flexDirection: 'column',
		padding: theme.spacing(2),
		display: 'flex',
	},
}));

interface Props {
	sett: Sett;
}

export const SpecsCard = ({ sett }: Props): JSX.Element => {
	const classes = useStyles();

	return (
		<CardContainer className={classes.root}>
			<Grid item xs>
				<Value settValue={sett.value} />
			</Grid>
			<Grid item xs>
				<Tokens sett={sett} />
			</Grid>
			<Grid item xs>
				<Claims />
			</Grid>
			<Grid item xs>
				<Harvests />
			</Grid>
			<Grid item xs>
				<Fees sett={sett} />
			</Grid>
		</CardContainer>
	);
};
