import React from 'react';
import { makeStyles } from '@material-ui/core/styles';
import { Sidebar } from './Sidebar';
import { Header } from './Header';
import { MobxRouter } from 'mobx-router';
import { useEffect } from 'react';
import { ONE_MIN_MS } from 'config/constants';
import { useContext } from 'react';
import { StoreContext } from 'mobx/store-context';
// import AppNotification from 'components-v2/common/AppNotification';

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
	const store = useContext(StoreContext);

	// network data updating
	useEffect(() => {
		const networkInterval = setInterval(async () => {
			await store.network.updateNetwork();
		}, ONE_MIN_MS / 2);
		return () => clearInterval(networkInterval);
	});

	return (
		<div className={classes.root}>
			<Sidebar />
			<Header />
			<main className={classes.content}>
				{/* Intentionally left commented for quick turnaround if we need to add again */}
				{/* <AppNotification /> */}
				<MobxRouter store={store} />
			</main>
		</div>
	);
};
