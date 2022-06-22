import {
  Protocol,
  VaultBehavior,
  VaultState,
  VaultType,
} from '@badger-dao/sdk';
import Bridge from 'components/Bridge';
import Governance from 'components/Governance';
// import { IbBTC } from 'components/IbBTC';
import { QueryParams, Route } from 'mobx-router';
import React from 'react';

import { BoostOptimizer } from '../components/Boost';
import { NotFound } from '../components-v2/common/NotFound';
import { VaultDetail } from '../components-v2/vault-detail/VaultDetail';
import { VaultSortOrder } from '../mobx/model/ui/vaults-filters';
import { RootStore } from '../mobx/stores/RootStore';
import { parseQueryMultipleParams } from '../mobx/utils/helpers';
import Landing from '../pages/Landing';

const routes = {
  home: new Route<RootStore, QueryParams>({
    path: '/',
    component: <Landing />,
    onEnter: (_route, _params, store, queryParams: QueryParams) => {
      if (queryParams) {
        store.vaults.vaultsFilters = {
          hidePortfolioDust: Boolean(queryParams['hidePortfolioDust']),
          showAPR: Boolean(queryParams['showAPR']),
          onlyDeposits: Boolean(queryParams['onlyDeposits']),
          onlyBoostedVaults: Boolean(queryParams['onlyBoostedVaults']),
          sortOrder: (queryParams['sortOrder'] as VaultSortOrder) ?? undefined,
          search: (queryParams['search'] as string) ?? undefined,
          protocols: parseQueryMultipleParams<Protocol>(
            queryParams['protocols'],
          ),
          types: parseQueryMultipleParams<VaultType>(queryParams['types']),
          statuses: parseQueryMultipleParams<VaultState>(
            queryParams['statuses'],
          ),
          behaviors: parseQueryMultipleParams<VaultBehavior>(
            queryParams['behaviors'],
          ),
        };
      }
    },
  }),
  notFound: new Route<RootStore, QueryParams>({
    path: '/not-found',
    component: <NotFound />,
  }),
  boostOptimizer: new Route<RootStore, QueryParams>({
    path: '/boost-optimizer',
    component: <BoostOptimizer />,
  }),
  IbBTC: new Route<RootStore, QueryParams>({
    path: '/ibBTC',
    component: <></>, //  <IbBTC />,
    // onEnter: (_route, _params, store) => store.ibBTCStore.init(),
  }),
  vaultDetail: new Route<RootStore, QueryParams>({
    path: '/vault/:vaultName',
    component: <VaultDetail />,
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
    component: <Governance />,
  }),
  bridge: new Route<RootStore, QueryParams>({
    path: '/bridge',
    component: <Bridge />,
  }),
};

export default routes;
