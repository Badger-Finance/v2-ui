import { makeStyles, Tab, Tabs, useMediaQuery, useTheme } from '@material-ui/core';
import { FLAGS } from 'config/environment';
import { StoreContext } from 'mobx/stores/store-context';
import { observer } from 'mobx-react-lite';
import { QueryParams, Route } from 'mobx-router';
import { useContext } from 'react';

import { getNavbarConfig } from '../../config/navbar.config';
import routes from '../../config/routes';
import { RootStore } from '../../mobx/stores/RootStore';

const useStyles = makeStyles({
  tab: {
    minWidth: 90,
  },
  indicator: {
    minWidth: 90,
  },
});

export const NavbarTabs = observer((): JSX.Element => {
  const {
    router,
    vaults,
    chain: { network },
  } = useContext(StoreContext);
  const classes = useStyles();
  const isMobile = useMediaQuery(useTheme().breakpoints.down('xs'));
  const config = getNavbarConfig(network);

  const goToTab = (route: Route<RootStore, QueryParams>) => {
    let queryParams: QueryParams = {
      chain: router.queryParams?.chain,
    };

    if (route.path === routes.home.path && vaults.vaultsFiltersCount > 0) {
      queryParams = vaults.mergeQueryParamsWithFilters(queryParams);
    }

    router.goTo(route, {}, queryParams);
  };

  return (
    <Tabs
      variant={isMobile ? 'fullWidth' : undefined}
      textColor="primary"
      indicatorColor="primary"
      value={router.currentRoute?.path}
      classes={{ indicator: classes.indicator }}
    >
      <Tab
        classes={{ root: classes.tab }}
        label="VAULTS"
        onClick={() => goToTab(routes.home)}
        value={routes.home.path === router.currentRoute?.path ? routes.home.path : routes.vaultDetail.path}
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
          value={routes.IbBTC.path}
        />
      )}
      {FLAGS.GOVERNANCE_TAB && config.governance && (
        <Tab
          classes={{ root: classes.tab }}
          label="GOVERNANCE"
          onClick={() => goToTab(routes.governance)}
          value={routes.governance.path}
        />
      )}
    </Tabs>
  );
});
