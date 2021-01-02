import React from 'react';

//models
import { Route } from 'mobx-router';

//components
import { Home } from '../components/Home';
import { Collection } from '../components/Collection';
import { RootStore } from '../mobx/store';
import { Airdrops } from '../components/Collection/Airdrops';
import { Digg } from '../components/Collection/Digg';

const routes = {
	home: new Route<RootStore>({
		path: '/',
		component: <Home />,
		onEnter: (route, params, store) => {
		},
		beforeExit: () => {
		},
		onParamsChange: (route, params, store) => {
		}

	}),

	collection: new Route<RootStore, any>({
		path: '/setts',
		component: <Collection />,
		onEnter: (route, params, store) => {
		},
		beforeExit: () => {
		},
		onParamsChange: (route, { collection }, store) => {
		}
	}),
	airdrops: new Route<RootStore, {
	}>({
		path: '/airdrops',
		component: <Airdrops />,
		onEnter: (_, params, store) => {
			store.contracts.fetchAirdrops()
		},
		beforeExit: (_, _p, store) => {
		},
		onParamsChange: (route, params, store) => {
			// store.uiState.setVault(collection, id)

		}
	}),
	digg: new Route<RootStore, {
	}>({
		path: '/digg',
		component: <Digg />,
		onEnter: (_, params, store) => {
		},
		beforeExit: (_, _p, store) => {

		},
		onParamsChange: (route, params, store) => {
			// store.uiState.setVault(collection, id)

		}
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