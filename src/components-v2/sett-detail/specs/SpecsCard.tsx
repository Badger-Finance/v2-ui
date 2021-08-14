import React from 'react';
import { Card, Grid } from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';

import { BadgerSett } from '../../../mobx/model/vaults/badger-sett';
import { Value } from './Value';
import { Tokens } from './Tokens';
import { Claims } from './Claims';
import { Fees } from './Fees';
import { Sett } from '../../../mobx/model/setts/sett';
import { Links } from './Links';

const useStyles = makeStyles((theme) => ({
	root: {
		flexDirection: 'column',
		padding: theme.spacing(2),
		display: 'flex',
	},
}));

interface Props {
	sett: Sett;
	badgerSett: BadgerSett;
}

export const SpecsCard = ({ sett, badgerSett }: Props): JSX.Element => {
	const classes = useStyles();

	return (
		<Card className={classes.root}>
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
				<Fees sett={sett} />
			</Grid>
			<Grid item xs>
				<Links sett={sett} badgerSett={badgerSett} />
			</Grid>
		</Card>
	);
};
