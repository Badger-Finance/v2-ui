import React from 'react';

//models
import { Route } from 'mobx-router';

//components
import { Home } from '../components/Home';
import { Asset } from '../components/Asset';
import { Collection } from '../components/Collection';
import { RootStore } from '../mobx/store';

const routes = {
	home: new Route<RootStore>({
		path: '/',
		component: <Home />
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
	vault: new Route<RootStore, {
		collection: string;
		id: string;
	}>({
		path: '/asset/:collection/:id',
		component: <Asset />,
		onEnter: (_, { collection, id }, store) => {
			store.uiState.setVault(collection, id)
		},
		beforeExit: (_, _p, store) => {
		},
		onParamsChange: (route, { collection, id }, store) => {
			store.uiState.setVault(collection, id)

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