import React from 'react';
import { makeStyles } from '@material-ui/core/styles';
import { Sidebar } from './Sidebar';
import { Header } from './Header';
import { MobxRouter } from 'mobx-router';
import store from '../mobx/store';

const useStyles = makeStyles(() => ({
	root: {
		display: 'flex',
	},
	content: {
		flexGrow: 1,
	},
}));

export const App = (): JSX.Element => {
	const classes = useStyles();

	return (
		<div className={classes.root}>
			<Sidebar />
			<Header />
			<main className={classes.content}>
				<MobxRouter store={store} />
			</main>
		</div>
	);
};
