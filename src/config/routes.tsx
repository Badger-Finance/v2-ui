import React from 'react';

//models
import { Route } from 'mobx-router';

//components
import { Home } from '../components/Home';
import { Asset } from '../components/Asset';
import { Account } from '../components/Accounts';
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
			console.log(`entering collection: ${collection}!`);
			store.app.fetchCollection(collection)
		},
		beforeExit: () => {
			console.log('exiting collection!');
		},
		onParamsChange: (route, { collection }, store) => {
			console.log('collection changed to', collection);
			store.app.fetchCollection(collection)

		}
	}),
	asset: new Route<RootStore, {
		collection: string;
		id: string;
	}>({
		path: '/asset/:collection/:id',
		component: <Asset />,
		onEnter: (_, { collection, id }, store) => {
			console.log(`entering asset: ${collection} + ${id}`);

			store.app.fetchVault(collection, id)


		},
		beforeExit: (_, _p, store) => {
			console.log('exiting asset');
		},
		onParamsChange: (route, { collection, id }, store) => {
			console.log('params changed to', collection, id);
			store.app.fetchVault(collection, id)

		}
	}),
	account: new Route<RootStore, {
		account: string;
	}>({
		path: '/accounts/:account',
		component: <Account />,
		onEnter: (_, { account }) => {
			console.log(`entering account: ${account}!`);
		},
		beforeExit: () => {
			console.log('exiting account!');
		},
		onParamsChange: (route, params) => {
			console.log('params changed to', params);
		}
	}),

};
export default routes;