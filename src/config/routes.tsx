//models
import { QueryParams, Route } from 'mobx-router';

import { Airdrops } from '../components/Airdrops';
import { Bridge } from '../components/Bridge';
import { Digg } from '../components/Digg';
import { FLAGS } from 'config/constants';
import { IbBTC } from 'components/IbBTC';
// pages
import Landing from '../pages/Landing';
import { Locked } from 'components/Common/Locked';
import React from 'react';
//components
import { RootStore } from '../mobx/store';

const routes = {
	locked: new Route<RootStore>({
		path: '/locked',
		component: <Locked />,
		onEnter: () => {
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
		onEnter: (_, _params, store) => {
			store.rebase.fetchRebaseStats();
		},
		beforeExit: () => {
			//
		},
		onParamsChange: () => {
			// store.uiState.setVault(collection, id)
		},
	}),
	IbBTC: new Route<RootStore, QueryParams>({
		path: '/ibBTC',
		component: FLAGS.IBBTC_FLAG ? <IbBTC /> : <></>,
		onEnter: () => {
			//
		},
		beforeExit: () => {
			//
		},
		onParamsChange: () => {
			//
		},
	}),
	bridge: new Route<RootStore, QueryParams>({
		path: '/bridge',
		component: FLAGS.BRIDGE_FLAG ? <Bridge /> : <></>,
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
