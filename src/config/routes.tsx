import React from 'react';

//models
import { Route } from 'mobx-router';

//components
import { Home } from '../components/Home';
import { Asset } from '../components/Asset';
import { Collection } from '../components/Collection';
import { RootStore } from '../mobx/store';
import { collections } from './constants';
import { Airdrops } from '../components/Collection/Airdrops';
import { Digg } from '../components/Collection/Digg';

const routes = {
	home: new Route<RootStore>({
		path: '/',
		component: <Home />,
		onEnter: (route, params, store) => {
			store.uiState.setCollection(collections[0].id)
		},
		beforeExit: () => {
		},
		onParamsChange: (route, params, store) => {
			store.uiState.setCollection(collections[0].id)
		}

	}),

	collection: new Route<RootStore, {
		collection: string;
	}>({
		path: '/collection/:collection',
		component: <Collection />,
		onEnter: (route, { collection }, store) => {
			store.uiState.setCollection(collection)
		},
		beforeExit: () => {
		},
		onParamsChange: (route, { collection }, store) => {
			store.uiState.setCollection(collection)
		}
	}),
	airdrops: new Route<RootStore, {
	}>({
		path: '/airdrops',
		component: <Airdrops />,
		onEnter: (_, params, store) => {
			store.uiState.setCollection('badger')
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
			store.uiState.setCollection('badger')
			store.contracts.fetchAirdrops()
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