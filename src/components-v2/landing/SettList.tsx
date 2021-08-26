import React from 'react';
import { observer } from 'mobx-react-lite';
import { makeStyles } from '@material-ui/core';

import SettListView from './SettListView';
import { SettState } from '../../mobx/model/setts/sett-state';

const useStyles = makeStyles((theme) => ({
	settListContainer: {
		marginTop: theme.spacing(4),
		marginBottom: theme.spacing(12),
	},
}));

export interface SettListProps {
	state: SettState;
}

const SettList = observer(({ state }: SettListProps) => {
	const classes = useStyles();

	return (
		<div className={classes.settListContainer}>
			<SettListView state={state} />
		</div>
	);
});

export default SettList;
