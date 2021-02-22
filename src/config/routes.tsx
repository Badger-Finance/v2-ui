import React from 'react';

//models
import { QueryParams, Route } from 'mobx-router';

// pages
import Landing from '../pages/Landing';

//components
import { Collection } from '../components/Collection';
import { RootStore } from '../mobx/store';
import { Airdrops } from '../components/Airdrops';
import { Digg } from '../components/Digg';
import { Locked } from 'components/Common/Locked';

const routes = {
	locked: new Route<RootStore>({
		path: '/locked',
		component: <Locked />,
		onEnter: (_, params, store) => {
			//
		},
		beforeExit: () => {
			//
		},
		onParamsChange: () => {
			//
		},
	}),
	home: new Route<RootStore>({
		path: '/',
		component: <Landing />,
		onEnter: (_, params, store) => {
			store.rewards.fetchSettRewards();
		},
		beforeExit: () => {
			//
		},
		onParamsChange: () => {
			//
		},
	}),

	airdrops: new Route<RootStore, QueryParams>({
		path: '/airdrops',
		component: <Airdrops />,
		onEnter: (_, params, store) => {
			store.airdrops.fetchAirdrops();
		},
		beforeExit: () => {
			//
		},
		onParamsChange: () => {
			// store.uiState.setVault(collection, id)
		},
	}),
	digg: new Route<RootStore, QueryParams>({
		path: '/digg',
		component: <Digg />,
		onEnter: (_, params, store) => {
			store.rebase.fetchRebaseStats();
		},
		beforeExit: () => {
			//
		},
		onParamsChange: () => {
			// store.uiState.setVault(collection, id)
		},
	}),
	// account: new Route<RootStore, {
	// 	account: string;
	// }>({
	// 	path: '/accounts/:account',
	// 	component: <Account />,
	// 	onEnter: (_, { account }) => {
	// 		console.log(`entering account: ${account}!`);
	// 	},
	// 	beforeExit: () => {
	// 		console.log('exiting account!');
	// 	},
	// 	onParamsChange: (route, params) => {
	// 		console.log('params changed to', params);
	// 	}
	// }),
};
export default routes;
