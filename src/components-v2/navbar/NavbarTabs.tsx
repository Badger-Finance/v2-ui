import React, { useContext, useState } from 'react';
import { makeStyles, Tab, Tabs, useMediaQuery, useTheme } from '@material-ui/core';
import { observer } from 'mobx-react-lite';
import { StoreContext } from '../../mobx/store-context';
import routes from '../../config/routes';
import { getNavbarConfig } from '../../config/navbar.config';
import { QueryParams, Route } from 'mobx-router';
import { RootStore } from '../../mobx/RootStore';

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

const getRootPath = (path: string) => '/' + path.split('/')[1];

const routeTabMapping = new Map(
	Object.entries({
		[getRootPath(routes.home.path)]: 0,
		[getRootPath(routes.vaultDetail.path)]: 0,
		[getRootPath(routes.boostOptimizer.path)]: 1,
		[getRootPath(routes.digg.path)]: 2,
		[getRootPath(routes.IbBTC.path)]: 3,
	}),
);

export const NavbarTabs = observer((): JSX.Element => {
	const {
		router,
		vaults,
		network: { network },
	} = useContext(StoreContext);
	const [selectedTab, setSelectedTab] = useState(routeTabMapping.get(getRootPath(router.currentPath)) ?? 0);
	const classes = useStyles();
	const isMobile = useMediaQuery(useTheme().breakpoints.down('xs'));
	const config = getNavbarConfig(network.symbol);

	const goToTab = (route: Route<RootStore, QueryParams>) => {
		let queryParams: Record<string, any> = {
			chain: router.queryParams?.chain,
		};

		if (route.path === routes.home.path && vaults.vaultsFiltersCount > 0) {
			queryParams = vaults.mergeQueryParamsWithFilters(queryParams);
		}

		router.goTo(route, {}, queryParams);
	};

	const handleChange = (event: React.ChangeEvent<{}>, newValue: number) => {
		setSelectedTab(newValue);
	};

	return (
		<Tabs
			variant={isMobile ? 'fullWidth' : undefined}
			textColor="primary"
			indicatorColor="primary"
			value={selectedTab}
			onChange={handleChange}
			classes={{ indicator: classes.indicator }}
		>
			<Tab classes={{ root: classes.tab }} label="VAULTS" onClick={() => goToTab(routes.home)} />
			{config.boost && (
				<Tab
					classes={{ root: classes.tab }}
					value={routes.boostOptimizer.path}
					label="BOOST"
					onClick={() => goToTab(routes.boostOptimizer)}
				/>
			)}
			{config.digg && <Tab classes={{ root: classes.tab }} label="DIGG" onClick={() => goToTab(routes.digg)} />}
			{config.ibBTC && (
				<Tab classes={{ root: classes.tab }} label="IBBTC" onClick={() => goToTab(routes.IbBTC)} />
			)}
		</Tabs>
	);
});
