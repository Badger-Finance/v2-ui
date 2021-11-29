import React from 'react';
import { makeStyles } from '@material-ui/core/styles';
import Header from './Header';
import { MobxRouter } from 'mobx-router';
import { useEffect } from 'react';
import { ONE_MIN_MS } from 'config/constants';
import { useContext } from 'react';
import { StoreContext } from 'mobx/store-context';
import NetworkNotification from 'components-v2/common/NetworkNotification';
import Announcements from '../components-v2/common/Announcements';
import Sidebar from 'components-v2/sidebar';
import clsx from 'clsx';
import { useMediaQuery, useTheme } from '@material-ui/core';

const useStyles = makeStyles((theme) => ({
	rootContainer: {
		height: '100vh',
	},
	flexContainer: {
		display: 'flex',
		flexGrow: 1,
		maxHeight: '100%',
	},
	columnContainer: {
		flexDirection: 'column',
	},
	rowContainer: {
		flexDirection: 'row',
	},
	contentContainer: {
		display: 'flex',
		flexGrow: 1,
	},
	content: {
		overflow: 'auto',
		paddingBottom: theme.spacing(6),
		'&::-webkit-scrollbar': {
			display: 'none',
		},
	},
	appContainer: {
		overflow: 'auto',
	},
}));

export const App = (): JSX.Element => {
	const classes = useStyles();
	const store = useContext(StoreContext);
	const isMobile = useMediaQuery(useTheme().breakpoints.down('sm'));

	// network data updating
	useEffect(() => {
		const networkInterval = setInterval(async () => {
			await store.network.updateGasPrices();
		}, ONE_MIN_MS / 2);
		return () => clearInterval(networkInterval);
	});

	return (
		<div className={clsx(classes.rootContainer, classes.flexContainer, classes.columnContainer)}>
			<NetworkNotification />
			{!isMobile && <Announcements />}
			<div className={clsx(classes.appContainer, classes.flexContainer)}>
				<Sidebar />
				<main className={clsx(classes.contentContainer, classes.columnContainer)}>
					<Header />
					{isMobile && <Announcements />}
					<main className={classes.content}>
						<MobxRouter store={store} />
					</main>
				</main>
			</div>
		</div>
	);
};
