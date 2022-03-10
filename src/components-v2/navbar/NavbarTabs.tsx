import React, { useContext } from 'react';
import { makeStyles, Tab, Tabs, useMediaQuery, useTheme } from '@material-ui/core';
import { observer } from 'mobx-react-lite';
import { StoreContext } from '../../mobx/store-context';
import routes from '../../config/routes';
import { getNavbarConfig } from '../../config/navbar.config';

const useStyles = makeStyles({
	tab: {
		minWidth: 90,
		width: 90,
	},
	indicator: {
		width: 90,
		minWidth: 90,
	},
});

export const NavbarTabs = observer((): JSX.Element => {
	const {
		router,
		network: { network },
	} = useContext(StoreContext);
	const classes = useStyles();
	const isMobile = useMediaQuery(useTheme().breakpoints.down('xs'));
	const config = getNavbarConfig(network.symbol);
	return (
		<Tabs
			variant={isMobile ? 'fullWidth' : undefined}
			textColor="secondary"
			value={router.currentPath}
			classes={{ indicator: classes.indicator }}
		>
			<Tab
				classes={{ root: classes.tab }}
				value={routes.home.path}
				label="VAULTS"
				onClick={() => router.goTo(routes.home)}
			/>
			{config.digg && (
				<Tab
					classes={{ root: classes.tab }}
					value={routes.digg.path}
					label="DIGG"
					onClick={() => router.goTo(routes.digg)}
				/>
			)}
			{config.boost && (
				<Tab
					classes={{ root: classes.tab }}
					value={routes.boostOptimizer.path}
					label="BOOST"
					onClick={() => router.goTo(routes.boostOptimizer)}
				/>
			)}
			{config.ibBTC && (
				<Tab
					classes={{ root: classes.tab }}
					value={routes.IbBTC.path}
					label="IBBTC"
					onClick={() => router.goTo(routes.IbBTC)}
				/>
			)}
		</Tabs>
	);
});
