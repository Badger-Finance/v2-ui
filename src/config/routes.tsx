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

const routes = {
	home: new Route<RootStore, QueryParams>({
		path: '/',
		component: <Landing />,
		onEnter: (route, params, store, queryParams) => {
			const urlParams = new URLSearchParams(
				Object.entries(queryParams).map(([key, value]) => [key, String(value)]),
			);

			store.vaults.vaultsFilters = {
				hidePortfolioDust: Boolean(urlParams.get('hidePortfolioDust')),
				showAPR: Boolean(urlParams.get('showAPR')),
				onlyDeposits: Boolean(urlParams.get('onlyDeposits')),
				onlyBoostedVaults: Boolean(urlParams.get('onlyBoostedVaults')),
				currency: (urlParams.get('currency') as Currency) ?? store.uiState.currency,
				sortOrder: (urlParams.get('sortOrder') as VaultSortOrder) ?? undefined,
				search: (urlParams.get('search') as string) ?? undefined,
				protocols: urlParams.getAll('protocols') as Protocol[],
				types: urlParams.getAll('types') as VaultType[],
				statuses: urlParams.getAll('statuses') as VaultState[],
				behaviors: urlParams.getAll('behaviors') as VaultBehavior[],
			};
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
