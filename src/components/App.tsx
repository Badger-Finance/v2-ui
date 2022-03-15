import React from 'react';
import { makeStyles } from '@material-ui/core/styles';
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
import WalletDrawer from '../components-v2/common/WalletDrawer';
import Navbar from '../components-v2/navbar';
import RewardsDialog from '../components-v2/common/dialogs/RewardsDialog';

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
