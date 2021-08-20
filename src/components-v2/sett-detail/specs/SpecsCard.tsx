import React from 'react';
import { Grid } from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';

import { BadgerSett } from '../../../mobx/model/vaults/badger-sett';
import { Value } from './Value';
import { Tokens } from './Tokens';
import { Claims } from './Claims';
import { Sett } from '../../../mobx/model/setts/sett';
import { Links } from './Links';
import { CardContainer } from '../styled';
import { SettFees } from '../../common/SettFees';

const useStyles = makeStyles((theme) => ({
	root: {
		flexDirection: 'column',
		padding: theme.spacing(2),
		display: 'flex',
	},
	specSection: {
		marginBottom: 20,
	},
}));

interface Props {
	sett: Sett;
	badgerSett: BadgerSett;
}

export const SpecsCard = ({ sett, badgerSett }: Props): JSX.Element => {
	const classes = useStyles();

	return (
		<CardContainer className={classes.root}>
			<Grid item xs className={classes.specSection}>
				<Value settValue={sett.value} />
			</Grid>
			<Grid item xs className={classes.specSection}>
				<Tokens sett={sett} />
			</Grid>
			<Grid item xs className={classes.specSection}>
				<Claims />
			</Grid>
			<Grid item xs className={classes.specSection}>
				<SettFees sett={sett} showNowFees />
			</Grid>
			<Grid item xs>
				<Links sett={sett} badgerSett={badgerSett} />
			</Grid>
		</CardContainer>
	);
};
