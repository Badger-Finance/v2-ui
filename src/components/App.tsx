import React from 'react';
import { makeStyles } from '@material-ui/core/styles';
import Header from './Header';
import { MobxRouter } from 'mobx-router';
import { useEffect } from 'react';
import { ONE_MIN_MS } from 'config/constants';
import { useContext } from 'react';
import { StoreContext } from 'mobx/store-context';
import NetworkNotification from 'components-v2/common/NetworkNotification';
import NewsNotification from '../components-v2/common/NewsNotification';
import Sidebar from 'components-v2/sidebar';

const useStyles = makeStyles((theme) => ({
	root: {
		display: 'flex',
	},
	contentContainer: {
		display: 'flex',
		flexDirection: 'column',
		flexGrow: 1,
	},
	content: {
		flexGrow: 1,
		paddingBottom: theme.spacing(4),
	},
}));

export const App = (): JSX.Element => {
	const classes = useStyles();
	const store = useContext(StoreContext);

	// network data updating
	useEffect(() => {
		const networkInterval = setInterval(async () => {
			await store.network.updateGasPrices();
		}, ONE_MIN_MS / 2);
		return () => clearInterval(networkInterval);
	});

	return (
		<div className={classes.root}>
			<Sidebar />
			<div className={classes.contentContainer}>
				<Header />
				<main className={classes.content}>
					<NetworkNotification />
					<NewsNotification />
					<MobxRouter store={store} />
				</main>
			</div>
		</div>
	);
};
