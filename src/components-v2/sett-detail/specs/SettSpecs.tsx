import React from 'react';
import { Grid } from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';

import { BadgerSett } from '../../../mobx/model/vaults/badger-sett';
import { Value } from './Value';
import { Tokens } from './Tokens';
import { Claims } from './Claims';
import { Sett } from '../../../mobx/model/setts/sett';
import { Links } from './Links';
import { SettFees } from '../../common/SettFees';
import { SettDetailMode } from '../../../mobx/model/setts/sett-detail';
import { SettBalance } from '../../../mobx/model/setts/sett-balance';
import { Holdings } from '../holdings/Holdings';

const useStyles = makeStyles(() => ({
	root: {
		flexDirection: 'column',
		display: 'flex',
		height: '100%',
	},
	specSection: {
		marginBottom: 20,
	},
}));

interface Props {
	sett: Sett;
	badgerSett: BadgerSett;
	mode: SettDetailMode;
	settBalance?: SettBalance;
}

export const SettSpecs = ({ sett, badgerSett, settBalance, mode }: Props): JSX.Element => {
	const classes = useStyles();

	if (mode === SettDetailMode.userInformation && settBalance) {
		return (
			<div className={classes.root}>
				<Grid item xs className={classes.specSection}>
					<Holdings sett={sett} settBalance={settBalance} />
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
			</div>
		);
	}

	return (
		<div className={classes.root}>
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
		</div>
	);
};
