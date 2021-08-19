import React from 'react';
import { QueryParams, Route } from 'mobx-router';
import Landing from '../pages/Landing';
import { RootStore } from '../mobx/RootStore';
import { Airdrops } from '../components/Airdrops';
import { BoostOptimizer } from '../components/Boost';
import { Digg } from '../components/Digg';
import { Locked } from 'components/Common/Locked';
import { IbBTC } from 'components/IbBTC';
import { Bridge } from '../components/Bridge';
import HoneybadgerDrop from '../components/HoneybadgerDrop/index';
import BoostLeaderBoard from 'pages/BoostLeaderBoard';
import { SettDetail } from '../components-v2/sett-detail/SettDetail';
import { SettState } from '../mobx/model/setts/sett-state';
import { NotFound } from '../components-v2/common/NotFound';
import ReactGA from 'react-ga4';

/* eslint-disable @typescript-eslint/no-unused-vars */

const pageView = (route: string) => {
	ReactGA.send({ hitType: 'pageview', page: route });
};

const routes = {
	locked: new Route<RootStore>({
		path: '/locked',
		component: <Locked />,
		onEnter: (route, _params, _store) => pageView(route.path),
	}),
	home: new Route<RootStore>({
		path: '/',
		component: (
			<Landing
				title="Sett Vaults"
				subtitle="Powerful Bitcoin strategies. Automatic staking rewards."
				state={SettState.Open}
			/>
		),
		onEnter: (route, _params, _store) => pageView(route.path),
	}),
	notFound: new Route<RootStore>({
		path: '/not-found',
		component: <NotFound />,
		onEnter: (route, _params, _store) => pageView(route.path),
	}),
	guarded: new Route<RootStore>({
		path: '/guarded',
		component: (
			<Landing
				title="Guarded Vaults"
				subtitle="New vaults to dip your toes in. Ape safe."
				state={SettState.Guarded}
			/>
		),
		onEnter: (route, _params, _store) => pageView(route.path),
	}),
	experimental: new Route<RootStore>({
		path: '/experimental',
		component: (
			<Landing
				title="Experimental Vaults"
				subtitle="Novel Bitcoin strategies. Bleeding edge innovation."
				state={SettState.Experimental}
			/>
		),
		onEnter: (route, _params, _store) => pageView(route.path),
	}),
	airdrops: new Route<RootStore, QueryParams>({
		path: '/airdrops',
		component: <Airdrops />,
		onEnter: (route, _params, store) => {
			pageView(route.path);
			store.airdrops.fetchAirdrops();
		},
	}),
	boostOptimizer: new Route<RootStore, QueryParams>({
		path: '/boost-optimizer',
		component: <BoostOptimizer />,
		onEnter: (route, _params, _store) => pageView(route.path),
	}),
	digg: new Route<RootStore, QueryParams>({
		path: '/digg',
		component: <Digg />,
		onEnter: (route, _params, _store) => pageView(route.path),
	}),
	honeybadgerDrop: new Route<RootStore, QueryParams>({
		path: '/honey-badger-drop',
		component: <HoneybadgerDrop />,
		onEnter: (route, _params, _store) => pageView(route.path),
	}),
	IbBTC: new Route<RootStore, QueryParams>({
		path: '/ibBTC',
		component: <IbBTC />,
		onEnter: (route, _params, store) => {
			pageView(route.path);
			store.ibBTCStore.init();
		},
	}),
	bridge: new Route<RootStore, QueryParams>({
		path: '/bridge',
		component: <Bridge />,
		onEnter: (route, _params, _store) => pageView(route.path),
	}),
	boostLeaderBoard: new Route<RootStore, QueryParams>({
		path: '/leaderboard',
		component: <BoostLeaderBoard />,
		onEnter: (route, _params, _store) => pageView(route.path),
	}),
	settDetails: new Route<RootStore, QueryParams>({
		path: '/setts/:settName',
		component: <SettDetail />,
		onEnter: (route, params, store) => {
			if (params && params.settName) {
				pageView(route.path);
				store.settDetail.setSearchSlug(params.settName as string);
			}
		},
		onExit: (_route, _params, store) => {
			store.settDetail.reset();
		},
	}),
};

export default routes;
