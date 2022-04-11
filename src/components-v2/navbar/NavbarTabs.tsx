import React, { useContext, useState } from 'react';
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

const getRootPath = (path: string) => '/' + path.split('/')[1];

const routeTabMapping = new Map(
	Object.entries({
		[getRootPath(routes.home.path)]: 0,
		[getRootPath(routes.vaultDetail.path)]: 0,
		[getRootPath(routes.digg.path)]: 1,
		[getRootPath(routes.boostOptimizer.path)]: 2,
		[getRootPath(routes.IbBTC.path)]: 3,
	}),
);

export const NavbarTabs = observer((): JSX.Element => {
	const {
		router,
		network: { network },
	} = useContext(StoreContext);
	const [selectedTab, setSelectedTab] = useState(routeTabMapping.get(getRootPath(router.currentPath)) ?? 0);
	const classes = useStyles();
	const isMobile = useMediaQuery(useTheme().breakpoints.down('xs'));
	const config = getNavbarConfig(network.symbol);

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
			<Tab classes={{ root: classes.tab }} label="VAULTS" onClick={() => router.goTo(routes.home)} />
			{config.digg && (
				<Tab classes={{ root: classes.tab }} label="DIGG" onClick={() => router.goTo(routes.digg)} />
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
				<Tab classes={{ root: classes.tab }} label="IBBTC" onClick={() => router.goTo(routes.IbBTC)} />
			)}
		</Tabs>
	);
});
