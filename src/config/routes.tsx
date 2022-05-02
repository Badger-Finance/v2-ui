import React from 'react';
import { QueryParams, Route } from 'mobx-router';
import Landing from '../pages/Landing';
import { RootStore } from '../mobx/RootStore';
import { BoostOptimizer } from '../components/Boost';
import { Digg } from '../components/Digg';
import { IbBTC } from 'components/IbBTC';
import { VaultDetail } from '../components-v2/vault-detail/VaultDetail';
import { NotFound } from '../components-v2/common/NotFound';
import Governance from 'components/Governance';
import { Currency, Protocol, VaultBehavior, VaultState, VaultType } from '@badger-dao/sdk';
import { VaultSortOrder } from '../mobx/model/ui/vaults-filters';
import { parseQueryMultipleParams } from '../mobx/utils/helpers';

const routes = {
	home: new Route<RootStore, QueryParams>({
		path: '/',
		component: <Landing />,
		onEnter: (route, params, store, queryParams: Record<string, any>) => {
			if (queryParams) {
				store.vaults.vaultsFilters = {
					hidePortfolioDust: Boolean(queryParams['hidePortfolioDust']),
					showAPR: Boolean(queryParams['showAPR']),
					onlyDeposits: Boolean(queryParams['onlyDeposits']),
					onlyBoostedVaults: Boolean(queryParams['onlyBoostedVaults']),
					currency: (queryParams['currency'] as Currency) ?? store.uiState.currency,
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
		component: <NotFound />,
	}),
	boostOptimizer: new Route<RootStore, QueryParams>({
		path: '/boost-optimizer',
		component: <BoostOptimizer />,
	}),
	digg: new Route<RootStore, QueryParams>({
		path: '/digg',
		component: <Digg />,
	}),
	IbBTC: new Route<RootStore, QueryParams>({
		path: '/ibBTC',
		component: <IbBTC />,
		onEnter: (_route, _params, store) => store.ibBTCStore.init(),
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
};

export default routes;
