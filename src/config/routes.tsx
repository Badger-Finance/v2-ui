import { Protocol, VaultBehavior, VaultState, VaultType } from '@badger-dao/sdk';
import { Loader } from 'components/Loader';
import { QueryParams, Route } from 'mobx-router';
import React from 'react';

import { VaultSortOrder } from '../mobx/model/ui/vaults-filters';
import { RootStore } from '../mobx/stores/RootStore';
import { parseQueryMultipleParams } from '../mobx/utils/helpers';

const Landing = React.lazy(() => import('../pages/Landing'));
const NotFound = React.lazy(() => import('../components-v2/common/NotFound'));
const BoostOptimizer = React.lazy(() => import('../components/Boost'));
const IbBTC = React.lazy(() => import('components/IbBTC'));
const VaultDetailWrapper = React.lazy(() => import('components-v2/vault-detail/VaultDetailWrapper'));
const Governance = React.lazy(() => import('components/Governance'));
const Bridge = React.lazy(() => import('components/Bridge'));

const withSuspance = (Component: React.FunctionComponent) => (
  <React.Suspense fallback={<Loader />}>
    <Component />
  </React.Suspense>
);

const routes = {
  home: new Route<RootStore, QueryParams>({
    path: '/',
    component: withSuspance(Landing),
    onEnter: (_route, _params, store, queryParams: QueryParams) => {
      if (queryParams) {
        store.vaults.vaultsFilters = {
          hidePortfolioDust: Boolean(queryParams['hidePortfolioDust']),
          showAPR: Boolean(queryParams['showAPR']),
          onlyDeposits: Boolean(queryParams['onlyDeposits']),
          onlyBoostedVaults: Boolean(queryParams['onlyBoostedVaults']),
          sortOrder: (queryParams['sortOrder'] as VaultSortOrder) ?? undefined,
          search: (queryParams['search'] as string) ?? undefined,
          protocols: parseQueryMultipleParams<Protocol>(queryParams['protocols']),
          types: parseQueryMultipleParams<VaultType>(queryParams['types']),
          statuses: parseQueryMultipleParams<VaultState>(queryParams['statuses']),
          behaviors: parseQueryMultipleParams<VaultBehavior>(queryParams['behaviors']),
        };
      }
    },
  }),
  notFound: new Route<RootStore, QueryParams>({
    path: '/not-found',
    component: withSuspance(NotFound),
  }),
  boostOptimizer: new Route<RootStore, QueryParams>({
    path: '/boost-optimizer',
    component: withSuspance(BoostOptimizer),
  }),
  IbBTC: new Route<RootStore, QueryParams>({
    path: '/ibBTC',
    component: withSuspance(IbBTC),
  }),
  vaultDetail: new Route<RootStore, QueryParams>({
    path: '/vault/:vaultName',
    component: withSuspance(VaultDetailWrapper),
    onEnter: (_route, params, store) => {
      if (!params || !params.vaultName) {
        return;
      }
      store.vaultDetail.setSearchSlug(params.vaultName as string);
    },
    onParamsChange: (_route, params, store) => {
      if (!params || !params.vaultName) {
        return;
      }
      store.vaultDetail.setSearchSlug(params.vaultName as string);
    },
    onExit: (_route, _params, store) => {
      store.vaultDetail.reset();
    },
  }),
  governance: new Route<RootStore, QueryParams>({
    path: '/governance',
    component: withSuspance(Governance),
  }),
  bridge: new Route<RootStore, QueryParams>({
    path: '/bridge',
    component: withSuspance(Bridge),
  }),
};

export default routes;
