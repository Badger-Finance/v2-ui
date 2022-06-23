import {
  makeStyles,
  Tab,
  Tabs,
  useMediaQuery,
  useTheme,
} from '@material-ui/core';
import { StoreContext } from 'mobx/stores/store-context';
import { observer } from 'mobx-react-lite';
import { QueryParams, Route } from 'mobx-router';
import React, { useContext, useState } from 'react';

import { getNavbarConfig } from '../../config/navbar.config';
import routes from '../../config/routes';
import { RootStore } from '../../mobx/stores/RootStore';

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
    [getRootPath(routes.IbBTC.path)]: 2,
  }),
);

export const NavbarTabs = observer((): JSX.Element => {
  const {
    router,
    vaults,
    network: { network },
  } = useContext(StoreContext);
  const [selectedTab, setSelectedTab] = useState(
    routeTabMapping.get(getRootPath(router.currentPath)) ?? 0,
  );
  const classes = useStyles();
  const isMobile = useMediaQuery(useTheme().breakpoints.down('xs'));
  const config = getNavbarConfig(network.symbol);

  const goToTab = (route: Route<RootStore, QueryParams>) => {
    let queryParams: QueryParams = {
      chain: router.queryParams?.chain,
    };

    if (route.path === routes.home.path && vaults.vaultsFiltersCount > 0) {
      queryParams = vaults.mergeQueryParamsWithFilters(queryParams);
    }

    router.goTo(route, {}, queryParams);
  };

  // idk matieral ui is stupid
  // eslint-disable-next-line @typescript-eslint/ban-types
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
      <Tab
        classes={{ root: classes.tab }}
        label="VAULTS"
        onClick={() => goToTab(routes.home)}
      />
      {config.boost && (
        <Tab
          classes={{ root: classes.tab }}
          value={routes.boostOptimizer.path}
          label="BOOST"
          onClick={() => goToTab(routes.boostOptimizer)}
        />
      )}
      {config.ibBTC && (
        <Tab
          classes={{ root: classes.tab }}
          label="IBBTC"
          onClick={() => goToTab(routes.IbBTC)}
        />
      )}
    </Tabs>
  );
});
