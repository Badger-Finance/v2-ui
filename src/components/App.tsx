import React from 'react';
import { makeStyles } from '@material-ui/core/styles';
import { Sidebar } from './Sidebar';
import Header from './Header';
import { MobxRouter } from 'mobx-router';
import { useEffect } from 'react';
import { ONE_MIN_MS } from 'config/constants';
import { useContext } from 'react';
import { StoreContext } from 'mobx/store-context';
import NetworkNotification from 'components-v2/common/NetworkNotification';
import NewsNotification from '../components-v2/common/NewsNotification';

const useStyles = makeStyles((theme) => ({
	root: {
		display: 'flex',
	},
	content: {
		flexGrow: 1,
		paddingBottom: theme.spacing(8),
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
			<main className={classes.content}>
				<Header />
				<NetworkNotification />
				<NewsNotification />
				<MobxRouter store={store} />
			</main>
		</div>
	);
};
