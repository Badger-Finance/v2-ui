import { useMediaQuery, useTheme } from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';
import clsx from 'clsx';
import NetworkNotification from 'components-v2/common/NetworkNotification';
import Sidebar from 'components-v2/sidebar';
import { ONE_MIN_MS } from 'config/constants';
import { StoreContext } from 'mobx/stores/store-context';
import { MobxRouter } from 'mobx-router';
import React, { useContext, useEffect } from 'react';

import Announcements from '../components-v2/common/Announcements';
import RewardsDialog from '../components-v2/common/dialogs/RewardsDialog';
import WalletDrawer from '../components-v2/common/WalletDrawer';
import Navbar from '../components-v2/navbar';

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
			<RewardsDialog />
			<div className={clsx(classes.appContainer, classes.flexContainer)}>
				<Sidebar />
				<WalletDrawer />
				<main className={clsx(classes.contentContainer, classes.columnContainer)}>
					<main className={classes.content}>
						{!isMobile && <Announcements />}
						<Navbar />
						{isMobile && <Announcements />}
						<MobxRouter store={store} />
					</main>
				</main>
			</div>
		</div>
	);
};
