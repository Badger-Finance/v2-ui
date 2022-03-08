import React, { useContext } from 'react';
import { makeStyles, Tab, Tabs, useMediaQuery, useTheme } from '@material-ui/core';
import { observer } from 'mobx-react-lite';
import { StoreContext } from '../../mobx/store-context';
import routes from '../../config/routes';

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
	const classes = useStyles();
	const isMobile = useMediaQuery(useTheme().breakpoints.down('xs'));
	const { router } = useContext(StoreContext);
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
			<Tab
				classes={{ root: classes.tab }}
				value={routes.boostOptimizer.path}
				label="BOOST"
				onClick={() => router.goTo(routes.boostOptimizer)}
			/>
			<Tab
				classes={{ root: classes.tab }}
				value={routes.IbBTC.path}
				label="IBBTC"
				onClick={() => router.goTo(routes.IbBTC)}
			/>
		</Tabs>
	);
});
